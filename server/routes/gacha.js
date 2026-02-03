const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // 不足していたインポートを追加
const { protect } = require('../middleware/auth');
const Player = require('../models/Player');
const Cat = require('../models/Cat');
const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parser');
const { createReadStream } = require('fs');

// --- キャッシュ設定 ---
let gachaRatesCache = null;
let lastCacheUpdate = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5分間有効

/**
 * CSVからガチャ確率を読み込む (キャッシュ機能付き)
 */
const getGachaRates = async () => {
    const now = Date.now();
    if (gachaRatesCache && lastCacheUpdate && (now - lastCacheUpdate) < CACHE_DURATION) {
        return gachaRatesCache;
    }
    
    try {
        const rates = [];
        const filePath = path.join(__dirname, '../data/csv/gacha_rates.csv');
        
        await fs.access(filePath); // 存在確認
        
        await new Promise((resolve, reject) => {
            createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => {
                    if (data.ガチャタイプ && data.レアリティ && data['確率(%)']) {
                        rates.push({
                            type: data.ガチャタイプ,
                            rarity: data.レアリティ,
                            rate: parseFloat(data['確率(%)'])
                        });
                    }
                })
                .on('end', () => {
                    const totalRate = rates.reduce((sum, item) => sum + item.rate, 0);
                    if (Math.abs(totalRate - 100) > 0.01) {
                        console.warn(`[Gacha] 確率合計異常: ${totalRate}%`);
                    }
                    resolve();
                })
                .on('error', reject);
        });
        
        gachaRatesCache = rates;
        lastCacheUpdate = now;
        return rates;
    } catch (error) {
        console.error('ガチャ確率読み込みエラー:', error);
        throw error;
    }
};

/**
 * 抽選ロジック
 */
const drawGacha = (rates, gachaType = 'normal') => {
    const filteredRates = rates.filter(r => r.type === gachaType);
    if (filteredRates.length === 0) throw new Error(`タイプ不明: ${gachaType}`);
    
    const roll = Math.random() * 100;
    let accumulatedRate = 0;
    
    for (const rate of filteredRates) {
        accumulatedRate += rate.rate;
        if (roll <= accumulatedRate) return rate.rarity;
    }
    return filteredRates[filteredRates.length - 1].rarity;
};

// --- APIエンドポイント ---

/**
 * @route   POST /api/gacha/roll
 * @desc    単発ガチャ
 */
router.post('/roll', protect, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { gachaType = 'normal' } = req.body;
        const COST = 150; // 単発コスト

        const player = await Player.findOne({ userId: req.user.id }).session(session);
        if (!player) throw new Error('PlayerNotFound');
        if (player.points < COST) return res.status(400).json({ success: false, message: 'NP不足' });

        const allRates = await getGachaRates();
        const selectedRarity = drawGacha(allRates, gachaType);

        const possibleCats = await Cat.find({ レアリティ: selectedRarity }).session(session);
        if (possibleCats.length === 0) throw new Error('NoCatsInRarity');

        const wonCat = possibleCats[Math.floor(Math.random() * possibleCats.length)];

        // プレイヤー更新
        player.points -= COST;
        const existingCat = player.ownedCats.find(c => c.catId === wonCat.ID);
        if (existingCat) {
            existingCat.level += 1;
        } else {
            player.ownedCats.push({ catId: wonCat.ID, level: 1, obtainedAt: new Date() });
        }

        await player.save({ session });
        await session.commitTransaction();

        res.json({
            success: true,
            cat: { id: wonCat.ID, name: wonCat.名前, rarity: wonCat.レアリティ }, // 名前フィールドに注意
            remainingPoints: player.points
        });
    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ success: false, message: err.message });
    } finally {
        session.endSession();
    }
});

/**
 * @route   POST /api/gacha/multi-roll
 * @desc    10連ガチャ (保証付き)
 */
router.post('/multi-roll', protect, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const COST = 1500; 
        const GUARANTEE_RARITY = '超激レア'; // CSVの内容に合わせる

        const player = await Player.findOne({ userId: req.user.id }).session(session);
        if (player.points < COST) return res.status(400).json({ success: false, message: 'NP不足' });

        const allRates = await getGachaRates();
        const results = [];
        let hasGuaranteed = false;

        for (let i = 0; i < 10; i++) {
            let rarity = (i === 9 && !hasGuaranteed) ? GUARANTEE_RARITY : drawGacha(allRates);
            if (rarity === GUARANTEE_RARITY) hasGuaranteed = true;

            const possibleCats = await Cat.find({ レアリティ: rarity }).session(session);
            const wonCat = possibleCats[Math.floor(Math.random() * possibleCats.length)];

            const existingCat = player.ownedCats.find(c => c.catId === wonCat.ID);
            if (existingCat) {
                existingCat.level += 1;
            } else {
                player.ownedCats.push({ catId: wonCat.ID, level: 1 });
            }

            results.push({ id: wonCat.ID, name: wonCat.名前, rarity });
        }

        player.points -= COST;
        await player.save({ session });
        await session.commitTransaction();

        res.json({ success: true, results, remainingPoints: player.points });
    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ success: false, message: err.message });
    } finally {
        session.endSession();
    }
});

module.exports = router;
