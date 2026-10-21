const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Battle = require('../models/Battle');
const Player = require('../models/Player');
const Map = require('../models/Map');
const Enemy = require('../models/Enemy');
const Cat = require('../models/Cat');

const cat = (c, level = 1) => ({
    id: c.ID,
    name: c.名前,
    rarity: c.レアリティ || 'normal',
    level,
    attack: Number(c.基本攻撃力 || 0),
    defense: Number(c.基本防御力 || 0),
    health: Number(c.基本体力 || 0),
    speed: Number(c.速度 || 1),
    criticalRate: 0.05,
    criticalDamage: 1.5,
    element: c.タイプ || 'none',
    isFavorite: false,
    isInTeam: false,
    teamPosition: null,
    skills: [],
    createdFromGacha: true,
    battleCount: 0,
    winCount: 0,
    createdAt: new Date().toISOString()
});

const mapOut = m => ({
    id: m.ID,
    name: m.名前,
    chapter: Number(m.章 || 1),
    stage: Number(m.ステージ || 1),
    enemyIds: String(m.敵IDリスト || '').split(',').map(x => x.trim()).filter(Boolean),
    enemyLevel: Number(m.敵レベル || 1),
    expReward: Number(m.獲得経験値 || 0),
    pointReward: Number(m.獲得ポイント || 0),
    clearCondition: m.クリア条件 || '敵を全滅',
    turnLimit: Number(m.制限ターン || 20),
    description: null,
    backgroundImage: null
});

const finiteNonNegative = value => Number.isFinite(Number(value)) && Number(value) >= 0;

router.get('/maps', protect, async (req, res) => {
    try {
        const filter = req.query.chapter ? { 章: Number(req.query.chapter) } : {};
        res.json({ success: true, data: (await Map.find(filter).lean()).map(mapOut) });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

router.get('/maps/:id', protect, async (req, res) => {
    try {
        const map = await Map.findOne({ ID: req.params.id }).lean();
        if (!map) return res.status(404).json({ success: false, message: 'マップが見つかりません' });
        res.json({ success: true, data: mapOut(map) });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/start', protect, async (req, res) => {
    try {
        const player = await Player.findOne({ userId: req.user._id });
        if (!player) return res.status(404).json({ success: false, message: 'プレイヤーデータがありません' });

        let map = null;
        if (req.body?.mapId) {
            map = await Map.findOne({ ID: req.body.mapId }).lean();
            if (!map) return res.status(404).json({ success: false, message: 'マップが見つかりません' });
        }

        const requestedIds = Array.isArray(req.body?.catIds) && req.body.catIds.length
            ? req.body.catIds.map(String)
            : (Array.isArray(player.currentTeam) ? player.currentTeam.map(String) : []);
        const ids = [...new Set(requestedIds)];
        if (!ids.length) return res.status(400).json({ success: false, message: '出撃する猫がありません' });
        if (ids.length > 5) return res.status(400).json({ success: false, message: '出撃できる猫は5体までです' });

        const ownedById = new Map(player.ownedCats.map(x => [String(x.catId), x]));
        const invalidIds = ids.filter(id => !ownedById.has(id));
        if (invalidIds.length) {
            return res.status(400).json({ success: false, message: '未所持の猫が編成に含まれています' });
        }
        if (player.energy < 10) return res.status(400).json({ success: false, message: 'エネルギー不足です' });

        const owned = ids.map(id => ownedById.get(id));
        const bases = await Cat.find({ ID: { $in: ids } }).lean();
        if (bases.length !== ids.length) {
            return res.status(500).json({ success: false, message: '猫マスターデータが不足しています' });
        }
        const playerCats = owned.map(o => cat(bases.find(x => x.ID === o.catId), o.level));

        const enemyIds = map
            ? String(map.敵IDリスト || '').split(',').map(x => x.trim()).filter(Boolean)
            : [];
        const enemiesBase = enemyIds.length ? await Enemy.find({ ID: { $in: enemyIds } }).lean() : [];
        if (map && enemiesBase.length !== enemyIds.length) {
            return res.status(500).json({ success: false, message: '敵マスターデータが不足しています' });
        }
        const enemies = enemiesBase.map(e => ({
            id: e.ID,
            name: e.名前,
            rarity: e.タイプ || 'normal',
            level: Number(map?.敵レベル || 1),
            attack: Number(e.攻撃力 || 0),
            defense: Number(e.防御力 || 0),
            health: Number(e.体力 || 1),
            currentHealth: Number(e.体力 || 1),
            speed: Number(e.速度 || 1),
            skills: []
        }));

        const battle = await Battle.create({ userId: req.user._id, mapId: req.body?.mapId || null });
        player.energy -= 10;
        player.progress = {
            ...(player.progress || {}),
            battleCount: Number(player.progress?.battleCount || 0) + 1
        };
        await player.save();

        res.status(201).json({
            success: true,
            data: {
                battleId: String(battle._id),
                playerCats,
                enemyCats: enemies,
                map: map ? mapOut(map) : null
            }
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/:id/action', protect, async (req, res) => {
    try {
        const battle = await Battle.findOne({ _id: req.params.id, userId: req.user._id });
        if (!battle) return res.status(404).json({ success: false, message: 'バトルが見つかりません' });
        if (battle.endedAt) return res.status(400).json({ success: false, message: '完了済みのバトルです' });

        const action = req.body || {};
        if (!Number.isInteger(Number(action.roundNumber)) || Number(action.roundNumber) < 1) {
            return res.status(400).json({ success: false, message: 'roundNumberが不正です' });
        }
        if (!finiteNonNegative(action.damage)) {
            return res.status(400).json({ success: false, message: 'damageが不正です' });
        }
        const normalized = {
            roundNumber: Number(action.roundNumber),
            attackerId: action.attackerId || null,
            targetId: action.targetId || null,
            skillId: action.skillId || null,
            damage: Number(action.damage),
            isCritical: Boolean(action.isCritical)
        };
        res.json({
            success: true,
            data: {
                roundNumber: normalized.roundNumber,
                actions: [normalized],
                playerCats: [],
                enemyCats: [],
                battleContinues: true
            }
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/:id/complete', protect, async (req, res) => {
    try {
        const battle = await Battle.findOne({ _id: req.params.id, userId: req.user._id });
        if (!battle) return res.status(404).json({ success: false, message: 'バトルが見つかりません' });
        if (battle.endedAt) return res.status(400).json({ success: false, message: '完了済みです' });
        if (typeof req.body?.victory !== 'boolean') {
            return res.status(400).json({ success: false, message: 'victoryはbooleanで指定してください' });
        }
        if (!finiteNonNegative(req.body?.damageDealt ?? 0) || !finiteNonNegative(req.body?.damageTaken ?? 0)) {
            return res.status(400).json({ success: false, message: 'ダメージ値が不正です' });
        }

        const player = await Player.findOne({ userId: req.user._id });
        if (!player) return res.status(404).json({ success: false, message: 'プレイヤーデータがありません' });

        const win = req.body.victory;
        const map = battle.mapId ? await Map.findOne({ ID: battle.mapId }).lean() : null;
        if (battle.mapId && !map) return res.status(500).json({ success: false, message: 'マップデータが見つかりません' });

        const exp = win ? Number(map?.獲得経験値 || 0) : 0;
        const points = win ? Number(map?.獲得ポイント || 0) : 0;
        const damageDealt = Number(req.body.damageDealt || 0);
        const damageTaken = Number(req.body.damageTaken || 0);

        battle.result = win ? 'win' : 'lose';
        battle.score = points;
        battle.rewards = { nyankoPoints: points, items: [], newCats: [] };
        battle.endedAt = new Date();
        await battle.save();

        player.points += points;
        player.progress = {
            ...(player.progress || {}),
            experience: Number(player.progress?.experience || 0) + exp,
            winCount: Number(player.progress?.winCount || 0) + (win ? 1 : 0),
            loseCount: Number(player.progress?.loseCount || 0) + (win ? 0 : 1),
            totalDamageDealt: Number(player.progress?.totalDamageDealt || 0) + damageDealt,
            totalDamageTaken: Number(player.progress?.totalDamageTaken || 0) + damageTaken
        };
        await player.save();

        res.json({
            success: true,
            data: {
                victory: win,
                damageDealt,
                damageTaken,
                rewards: { nyankoPoints: points, items: [], newCats: [] },
                experienceGained: exp,
                playerLeveledUp: false,
                newPlayerLevel: Number(player.progress?.level || 1)
            }
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

module.exports = router;
