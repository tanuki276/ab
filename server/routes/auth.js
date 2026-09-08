const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Player = require('../models/Player');
const { protect } = require('../middleware/auth');

const tokenFor = (user) => jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'nyanko_secret',
    { expiresIn: '24h' }
);

const playerResponse = (player, user) => ({
    id: String(player._id), username: user.username,
    level: Number(player.progress?.level || 1), experience: Number(player.progress?.experience || 0),
    nyankoPoints: Number(player.points || 0), energy: Number(player.energy || 0), maxEnergy: 100,
    gems: Number(player.progress?.gems || 0), battleCount: Number(player.progress?.battleCount || 0),
    winCount: Number(player.progress?.winCount || 0), loseCount: Number(player.progress?.loseCount || 0),
    gachaCount: Number(player.progress?.gachaCount || 0),
    lastEnergyUpdate: player.updatedAt?.toISOString?.() || new Date().toISOString(),
    createdAt: player.createdAt?.toISOString?.() || new Date().toISOString(),
    settings: player.progress?.settings || { sound: true, music: true, notifications: true }
});

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) return res.status(400).json({ success: false, message: 'username、email、passwordは必須です' });
        if (await User.findOne({ $or: [{ email }, { username }] })) return res.status(400).json({ success: false, message: '既に存在するユーザーです' });
        const user = await User.create({ username, email, password });
        const player = await Player.create({ userId: user._id, name: username, points: 1000, energy: 100, ownedCats: [{ catId: 'cat001', level: 1 }] });
        res.status(201).json({ success: true, message: '登録が完了しました', data: { token: tokenFor(user), player: playerResponse(player, user) } });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password, username } = req.body;
        const user = email
            ? await User.findOne({ email }).select('+password')
            : await User.findByUsernameWithPassword(username);
        if (!user || !(await user.comparePassword(password))) return res.status(401).json({ success: false, message: 'メールアドレスまたはパスワードが違います' });
        user.lastLogin = Date.now();
        await user.save();
        let player = await Player.findOne({ userId: user._id });
        if (!player) player = await Player.create({ userId: user._id, name: user.username, points: 1000, energy: 100 });
        res.json({ success: true, message: 'ログインしました', data: { token: tokenFor(user), player: playerResponse(player, user) } });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/profile', protect, async (req, res) => {
    try {
        const player = await Player.findOne({ userId: req.user._id });
        if (!player) return res.status(404).json({ success: false, message: 'プレイヤーデータがありません' });
        const cats = player.ownedCats.map(c => ({ id: c.catId, level: c.level }));
        res.json({ success: true, data: { player: playerResponse(player, req.user), cats } });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
