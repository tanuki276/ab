const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const Player = require('../models/Player');
const Cat = require('../models/Cat');
const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parser');
const { createReadStream } = require('fs');
let gachaRatesCache = null, lastCacheUpdate = null;
const CACHE_DURATION = 5 * 60 * 1000;
const getGachaRates = async () => {
    const now = Date.now();
    if (gachaRatesCache && lastCacheUpdate && now - lastCacheUpdate < CACHE_DURATION) return gachaRatesCache;
    const rates = [];
    const filePath = path.join(__dirname, '../data/csv/gacha_rates.csv');
    await fs.access(filePath);
    await new Promise((resolve, reject) => createReadStream(filePath).pipe(csv())
        .on('data', d => { if (d.ガチャタイプ && d.レアリティ && d['確率(%)']) rates.push({ type: d.ガチャタイプ, rarity: d.レアリティ, rate: parseFloat(d['確率(%)']) }); })
        .on('end', resolve).on('error', reject));
    gachaRatesCache = rates; lastCacheUpdate = now; return rates;
};
const drawGacha = (rates, type = 'normal') => {
    const filtered = rates.filter(r => r.type === type);
    if (!filtered.length) throw new Error(`タイプ不明: ${type}`);
    const roll = Math.random() * 100; let sum = 0;
    for (const r of filtered) { sum += r.rate; if (roll <= sum) return r.rarity; }
    return filtered[filtered.length - 1].rarity;
};
const catPayload = (cat, level = 1) => ({
    id: cat.ID, name: cat.名前, rarity: cat.レアリティ, level,
    attack: Number(cat.基本攻撃力 || 0), defense: Number(cat.基本防御力 || 0), health: Number(cat.基本体力 || 0),
    speed: Number(cat.速度 || 1), criticalRate: 0.05, criticalDamage: 1.5, element: cat.タイプ || 'none',
    isFavorite: false, isInTeam: false, teamPosition: null, skills: [], createdFromGacha: true,
    battleCount: 0, winCount: 0, createdAt: new Date().toISOString()
});

router.post('/roll', protect, async (req, res) => {
    try {
        const COST = 150, player = await Player.findOne({ userId: req.user._id });
        if (!player) return res.status(404).json({ success: false, message: 'PlayerNotFound' });
        if (player.points < COST) return res.status(400).json({ success: false, message: 'NP不足' });
        const rarity = drawGacha(await getGachaRates(), req.body.type || req.body.gachaType || 'normal');
        const cats = await Cat.find({ レアリティ: rarity });
        if (!cats.length) return res.status(500).json({ success: false, message: '該当レアリティの猫がありません' });
        const won = cats[Math.floor(Math.random() * cats.length)];
        const existing = player.ownedCats.find(c => c.catId === won.ID);
        if (existing) existing.level += 1; else player.ownedCats.push({ catId: won.ID, level: 1 });
        player.points -= COST;
        player.progress = { ...(player.progress || {}), gachaCount: Number(player.progress?.gachaCount || 0) + 1 };
        await player.save();
        res.json({ success: true, data: { cat: catPayload(won, existing ? existing.level : 1), remainingPoints: player.points, message: 'ガチャ結果' } });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/multi-roll', protect, async (req, res) => {
    try {
        const COST = 1500, GUARANTEE = '超激レア';
        const player = await Player.findOne({ userId: req.user._id });
        if (!player) return res.status(404).json({ success: false, message: 'PlayerNotFound' });
        if (player.points < COST) return res.status(400).json({ success: false, message: 'NP不足' });
        const rates = await getGachaRates(), results = [];
        let guaranteed = false;
        for (let i = 0; i < 10; i++) {
            const rarity = (i === 9 && !guaranteed) ? GUARANTEE : drawGacha(rates, req.body.type || req.body.gachaType || 'normal');
            if (rarity === GUARANTEE) guaranteed = true;
            const cats = await Cat.find({ レアリティ: rarity });
            if (!cats.length) continue;
            const won = cats[Math.floor(Math.random() * cats.length)];
            const existing = player.ownedCats.find(c => c.catId === won.ID);
            if (existing) existing.level += 1; else player.ownedCats.push({ catId: won.ID, level: 1 });
            results.push(catPayload(won, existing ? existing.level : 1));
        }
        player.points -= COST;
        player.progress = { ...(player.progress || {}), gachaCount: Number(player.progress?.gachaCount || 0) + 10 };
        await player.save();
        res.json({ success: true, data: { cats: results, remainingPoints: player.points, message: '10連ガチャ結果' } });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
module.exports = router;
