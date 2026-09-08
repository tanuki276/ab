const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Player = require('../models/Player');

router.get('/', protect, async (req, res) => {
    try {
        const player = await Player.findOne({ userId: req.user._id });
        if (!player) return res.status(404).json({ success: false, message: 'プレイヤーデータがありません' });
        res.json({ success: true, player });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/', protect, async (req, res) => {
    try {
        const allowed = ['name', 'currentTeam', 'progress'];
        const update = {};
        for (const key of allowed) if (req.body[key] !== undefined) update[key] = req.body[key];
        const player = await Player.findOneAndUpdate({ userId: req.user._id }, update, { new: true, runValidators: true });
        if (!player) return res.status(404).json({ success: false, message: 'プレイヤーデータがありません' });
        res.json({ success: true, player });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
