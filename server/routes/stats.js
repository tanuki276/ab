const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Player = require('../models/Player');
const User = require('../models/User');

router.get('/player', protect, async (req, res) => {
    try {
        const player = await Player.findOne({ userId: req.user._id });
        if (!player) return res.status(404).json({ success: false, message: 'プレイヤーデータがありません' });
        const progress = player.progress || {};
        const total = Number(progress.battleCount || 0);
        const wins = Number(progress.winCount || 0);
        res.json({
            success: true,
            data: {
                totalBattles: total,
                winRate: total > 0 ? (wins / total) * 100 : 0,
                totalDamageDealt: Number(progress.totalDamageDealt || 0),
                totalDamageTaken: Number(progress.totalDamageTaken || 0),
                totalExperience: Number(progress.experience || 0),
                totalPoints: Number(player.points || 0),
                favoriteCat: null,
                playTime: Number(progress.playTime || 0)
            }
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

router.get('/leaderboard', protect, async (req, res) => {
    try {
        const limit = Math.max(1, Math.min(100, Number(req.query.limit || 100)));
        const type = req.query.type === 'level' ? 'level' : 'points';
        const sort = type === 'level' ? { 'progress.level': -1, points: -1 } : { points: -1, 'progress.level': -1 };
        const players = await Player.find({}).sort(sort).limit(limit).lean();
        const ids = players.map(p => p.userId);
        const users = await User.find({ _id: { $in: ids } }).select('username').lean();
        const names = new Map(users.map(u => [String(u._id), u.username]));
        const data = players.map((p, i) => {
            const level = Number(p.progress?.level || 1);
            const points = Number(p.points || 0);
            return {
                rank: i + 1,
                playerId: String(p._id),
                username: names.get(String(p.userId)) || p.name,
                level,
                score: type === 'level' ? level : points,
                avatar: null
            };
        });
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

module.exports = router;
