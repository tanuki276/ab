const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Player = require('../models/Player');
const Quest = require('../models/Quest');

const questResponse = (quest, player) => {
    const condition = quest.condition || {};
    const reward = quest.reward || {};
    const progress = Number(player.progress?.quests?.[quest.id] || 0);
    const amount = Number(condition.amount || condition.value || 1);
    return {
        id: quest.id,
        type: condition.type || 'general',
        title: quest.name || quest.id,
        description: quest.description || '',
        condition: {
            type: condition.type || 'general',
            target: String(condition.target || ''),
            amount
        },
        rewards: {
            experience: Number(reward.experience || reward.exp || 0),
            nyankoPoints: Number(reward.nyankoPoints || reward.points || 0),
            items: Array.isArray(reward.items) ? reward.items : []
        },
        timeLimit: quest.timeLimit || null,
        repeatable: Boolean(quest.repeatable),
        progress,
        completed: progress >= amount
    };
};

router.get('/', protect, async (req, res) => {
    try {
        const player = await Player.findOne({ userId: req.user._id });
        if (!player) return res.status(404).json({ success: false, message: 'プレイヤーデータがありません' });
        const filter = req.query.type ? { 'condition.type': req.query.type } : {};
        const quests = await Quest.find(filter).lean();
        res.json({ success: true, data: quests.map(q => questResponse(q, player)) });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/:id/claim', protect, async (req, res) => {
    try {
        const player = await Player.findOne({ userId: req.user._id });
        if (!player) return res.status(404).json({ success: false, message: 'プレイヤーデータがありません' });

        const quest = await Quest.findOne({ id: req.params.id }).lean();
        if (!quest) return res.status(404).json({ success: false, message: 'クエストが見つかりません' });

        const data = questResponse(quest, player);
        if (!data.completed) return res.status(400).json({ success: false, message: 'クエスト未達成です' });

        const claimed = { ...(player.progress?.claimedQuests || {}) };
        if (claimed[quest.id] && !quest.repeatable) {
            return res.status(400).json({ success: false, message: '受取済みです' });
        }

        const reward = quest.reward || {};
        const rewardItems = Array.isArray(reward.items) ? reward.items : [];
        const inventory = { ...(player.progress?.inventory || {}) };
        for (const item of rewardItems) {
            const itemId = String(item.itemId || item.id || '');
            const quantity = Math.max(0, Number(item.quantity || 0));
            if (itemId && quantity > 0) inventory[itemId] = Number(inventory[itemId] || 0) + quantity;
        }

        const questsProgress = { ...(player.progress?.quests || {}) };
        if (quest.repeatable) questsProgress[quest.id] = 0;
        else claimed[quest.id] = true;

        player.points += Number(reward.nyankoPoints || reward.points || 0);
        player.progress = {
            ...(player.progress || {}),
            experience: Number(player.progress?.experience || 0) + Number(reward.experience || reward.exp || 0),
            inventory,
            quests: questsProgress,
            claimedQuests: claimed
        };
        await player.save();

        res.json({
            success: true,
            data: {
                quest: data,
                rewards: {
                    experience: Number(reward.experience || reward.exp || 0),
                    nyankoPoints: Number(reward.nyankoPoints || reward.points || 0),
                    items: rewardItems
                },
                message: '報酬を受け取りました'
            }
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

module.exports = router;
