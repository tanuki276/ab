const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Player = require('../models/Player');
const Achievement = require('../models/Achievement');

const out = (achievement, player) => {
    const condition = achievement.condition || {};
    const reward = achievement.reward || {};
    const rawUnlock = player.progress?.achievements?.[achievement.id];
    const unlocked = Boolean(rawUnlock);
    const unlockedAt = typeof rawUnlock === 'string'
        ? rawUnlock
        : rawUnlock?.unlockedAt || null;
    return {
        id: achievement.id,
        title: achievement.name || achievement.id,
        description: achievement.description || '',
        condition: {
            type: condition.type || 'general',
            target: String(condition.target || ''),
            value: Number(condition.value || condition.amount || 1)
        },
        rewards: {
            nyankoPoints: Number(reward.nyankoPoints || reward.points || 0),
            items: Array.isArray(reward.items) ? reward.items : []
        },
        secret: Boolean(achievement.secret),
        unlocked,
        unlockedAt
    };
};

router.get('/', protect, async (req, res) => {
    try {
        const player = await Player.findOne({ userId: req.user._id });
        if (!player) return res.status(404).json({ success: false, message: 'プレイヤーデータがありません' });
        const achievements = await Achievement.find({}).lean();
        let data = achievements.map(a => out(a, player));
        if (req.query.unlocked !== undefined) {
            if (!['true', 'false'].includes(req.query.unlocked)) {
                return res.status(400).json({ success: false, message: 'unlockedはtrueまたはfalseで指定してください' });
            }
            const value = req.query.unlocked === 'true';
            data = data.filter(a => a.unlocked === value);
        }
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

module.exports = router;
