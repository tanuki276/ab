const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Player = require('../models/Player');
const Item = require('../models/Item');

const itemResponse = i => ({
    id: i.ID,
    name: i.名前,
    type: i.タイプ || 'item',
    effectValue: i.効果値 || '',
    price: Number(i.値段 || 0),
    description: i.説明 || '',
    maxStack: Number(i.最大所持数 || 99),
    usableIn: i.使用可能場所 || 'any'
});

router.get('/items', protect, async (req, res) => {
    try {
        const filter = req.query.category ? { タイプ: req.query.category } : {};
        const items = await Item.find(filter).lean();
        res.json({ success: true, data: items.map(itemResponse) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/buy', protect, async (req, res) => {
    try {
        const requested = Number(req.body?.quantity ?? 1);
        if (!Number.isInteger(requested) || requested < 1 || requested > 99) {
            return res.status(400).json({ success: false, message: 'quantityは1〜99の整数で指定してください' });
        }
        if (!req.body?.itemId) {
            return res.status(400).json({ success: false, message: 'itemIdは必須です' });
        }

        const item = await Item.findOne({ ID: req.body.itemId }).lean();
        if (!item) return res.status(404).json({ success: false, message: '商品が見つかりません' });

        const player = await Player.findOne({ userId: req.user._id });
        if (!player) return res.status(404).json({ success: false, message: 'プレイヤーデータがありません' });

        const inventory = { ...(player.progress?.inventory || {}) };
        const current = Number(inventory[item.ID] || 0);
        const maxStack = Math.max(1, Number(item.最大所持数 || 99));
        const purchasable = Math.min(requested, Math.max(0, maxStack - current));
        if (purchasable <= 0) {
            return res.status(400).json({ success: false, message: '所持上限です' });
        }

        const unitPrice = Math.max(0, Number(item.値段 || 0));
        const cost = unitPrice * purchasable;
        if (player.points < cost) return res.status(400).json({ success: false, message: 'NP不足です' });

        inventory[item.ID] = current + purchasable;
        player.points -= cost;
        player.progress = { ...(player.progress || {}), inventory };
        await player.save();

        res.json({
            success: true,
            data: {
                item: itemResponse(item),
                quantity: purchasable,
                remainingPoints: player.points,
                message: purchasable < requested ? `所持上限まで${purchasable}個購入しました` : '購入しました'
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
