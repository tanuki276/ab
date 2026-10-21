const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Player = require('../models/Player');
const Cat = require('../models/Cat');

const catResponse = async (owned, player = null) => {
    const base = await Cat.findOne({ ID: owned.catId }).lean();
    if (!base) return null;
    const level = Number(owned.level || 1);
    const growth = Number(base.成長率 || 0);
    const team = Array.isArray(player?.currentTeam) ? player.currentTeam : [];
    const position = team.indexOf(base.ID);
    return {
        id: base.ID,
        name: base.名前,
        rarity: base.レアリティ,
        level,
        attack: Math.round(Number(base.基本攻撃力 || 0) * (1 + growth * (level - 1))),
        defense: Math.round(Number(base.基本防御力 || 0) * (1 + growth * (level - 1))),
        health: Math.round(Number(base.基本体力 || 0) * (1 + growth * (level - 1))),
        speed: Number(base.速度 || 1),
        criticalRate: 0.05,
        criticalDamage: 1.5,
        element: base.タイプ || 'none',
        isFavorite: false,
        isInTeam: position >= 0,
        teamPosition: position >= 0 ? position : null,
        skills: [],
        createdFromGacha: true,
        battleCount: 0,
        winCount: 0,
        createdAt: owned.obtainedAt?.toISOString?.() || new Date().toISOString()
    };
};

const playerResponse = (p, user) => ({
    id: String(p._id),
    username: user.username,
    level: Number(p.progress?.level || 1),
    experience: Number(p.progress?.experience || 0),
    nyankoPoints: Number(p.points || 0),
    energy: Number(p.energy || 0),
    maxEnergy: 100,
    gems: Number(p.progress?.gems || 0),
    battleCount: Number(p.progress?.battleCount || 0),
    winCount: Number(p.progress?.winCount || 0),
    loseCount: Number(p.progress?.loseCount || 0),
    gachaCount: Number(p.progress?.gachaCount || 0),
    lastEnergyUpdate: p.updatedAt?.toISOString?.() || new Date().toISOString(),
    createdAt: p.createdAt?.toISOString?.() || new Date().toISOString(),
    settings: p.progress?.settings || { sound: true, music: true, notifications: true }
});

router.get('/', protect, async (req, res) => {
    try {
        const player = await Player.findOne({ userId: req.user._id });
        if (!player) return res.status(404).json({ success: false, message: 'プレイヤーデータがありません' });
        res.json({ success: true, data: playerResponse(player, req.user) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/settings', protect, async (req, res) => {
    try {
        const player = await Player.findOne({ userId: req.user._id });
        if (!player) return res.status(404).json({ success: false, message: 'プレイヤーデータがありません' });
        const allowed = ['sound', 'music', 'notifications'];
        const incoming = Object.fromEntries(Object.entries(req.body || {}).filter(([key, value]) => allowed.includes(key) && typeof value === 'boolean'));
        player.progress = {
            ...(player.progress || {}),
            settings: { ...(player.progress?.settings || {}), ...incoming }
        };
        await player.save();
        res.json({ success: true, data: playerResponse(player, req.user) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/cats', protect, async (req, res) => {
    try {
        const player = await Player.findOne({ userId: req.user._id });
        if (!player) return res.status(404).json({ success: false, message: 'プレイヤーデータがありません' });
        let cats = (await Promise.all(player.ownedCats.map(c => catResponse(c, player)))).filter(Boolean);
        if (req.query.teamOnly === 'true') cats = cats.filter(c => c.isInTeam);
        res.json({ success: true, data: cats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/cats/:id', protect, async (req, res) => {
    try {
        const player = await Player.findOne({ userId: req.user._id });
        if (!player) return res.status(404).json({ success: false, message: 'プレイヤーデータがありません' });
        const owned = player.ownedCats.find(c => c.catId === req.params.id);
        if (!owned) return res.status(404).json({ success: false, message: '猫が見つかりません' });
        const cat = await catResponse(owned, player);
        if (!cat) return res.status(404).json({ success: false, message: '猫マスターデータが見つかりません' });
        res.json({ success: true, data: cat });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/cats/:id/team', protect, async (req, res) => {
    try {
        const player = await Player.findOne({ userId: req.user._id });
        if (!player) return res.status(404).json({ success: false, message: 'プレイヤーデータがありません' });
        if (!player.ownedCats.some(c => c.catId === req.params.id)) {
            return res.status(404).json({ success: false, message: '猫が見つかりません' });
        }
        const position = Number(req.body?.position);
        if (!Number.isInteger(position) || position < 0 || position > 4) {
            return res.status(400).json({ success: false, message: 'positionは0〜4の整数で指定してください' });
        }
        const team = Array.isArray(player.currentTeam)
            ? player.currentTeam.filter(id => id !== req.params.id)
            : [];
        team.splice(Math.min(position, team.length), 0, req.params.id);
        player.currentTeam = team.slice(0, 5);
        await player.save();
        res.json({ success: true, data: null, message: 'チームを更新しました' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/cats/:id/upgrade', protect, async (req, res) => {
    try {
        const player = await Player.findOne({ userId: req.user._id });
        if (!player) return res.status(404).json({ success: false, message: 'プレイヤーデータがありません' });
        const owned = player.ownedCats.find(c => c.catId === req.params.id);
        if (!owned) return res.status(404).json({ success: false, message: '猫が見つかりません' });
        const cost = Math.max(100, Number(owned.level || 1) * 100);
        if (player.points < cost) return res.status(400).json({ success: false, message: 'NP不足です' });
        owned.level = Number(owned.level || 1) + 1;
        player.points -= cost;
        await player.save();
        const cat = await catResponse(owned, player);
        if (!cat) return res.status(500).json({ success: false, message: '猫マスターデータが見つかりません' });
        res.json({ success: true, data: { cat, remainingPoints: player.points, message: 'レベルアップしました' } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
