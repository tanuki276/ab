const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Player = require('../models/Player');
const Item = require('../models/Item');

const itemResponse = i => ({ id: i.ID, name: i.名前, type: i.タイプ || 'item', effectValue: i.効果値 || '', price: Number(i.値段 || 0), description: i.説明 || '', maxStack: Number(i.最大所持数 || 99), usableIn: i.使用可能場所 || 'any' });

router.get('/items', protect, async (req, res) => {
    try {
        const filter = req.query.category ? { タイプ: req.query.category } : {};
        const items = await Item.find(filter).lean();
        res.json({ success: true, data: items.map(itemResponse) });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/buy', protect, async (req, res) => {
    try {
        const quantity = Math.max(1, Math.min(99, Number(req.body.quantity || 1)));
        const item = await Item.findOne({ ID: req.body.itemId }).lean();
        if (!item) return res.status(404).json({ success: false, message: '商品が見つかりません' });
        const player = await Player.findOne({ userId: req.user._id });
        const cost = Number(item.値段 || 0) * quantity;
        if (player.points < cost) return res.status(400).json({ success: false, message: 'NP不足です' });
        const inventory = { ...(player.progress?.inventory || {}) };
        inventory[item.ID] = Math.min(Number(item.最大所持数 || 99), Number(inventory[item.ID] || 0) + quantity);
        player.points -= cost;
        player.progress = { ...(player.progress || {}), inventory };
        await player.save();
        res.json({ success: true, data: { item: itemResponse(item), remainingPoints: player.points, message: '購入しました' } });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
module.exports = router;
