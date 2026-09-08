const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Battle = require('../models/Battle');

router.post('/start', protect, async (req, res) => {
    try {
        const battle = await Battle.create({ userId: req.user._id, mapId: req.body.mapId || null });
        res.status(201).json({ success: true, battle });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/:id/end', protect, async (req, res) => {
    try {
        const battle = await Battle.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { result: req.body.result || 'draw', score: Number(req.body.score) || 0, rewards: req.body.rewards || {}, endedAt: new Date() },
            { new: true, runValidators: true }
        );
        if (!battle) return res.status(404).json({ success: false, message: 'バトルが見つかりません' });
        res.json({ success: true, battle });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/history', protect, async (req, res) => {
    try {
        const battles = await Battle.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
        res.json({ success: true, battles });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
