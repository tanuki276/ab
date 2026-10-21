const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Player = require('../models/Player');
const Cat = require('../models/Cat');
const { protect } = require('../middleware/auth');

const jwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET is required in production');
    }
    return secret || 'nyanko_dev_secret_change_me';
};

const tokenFor = user => jwt.sign(
    { id: user._id, role: user.role },
    jwtSecret(),
    { expiresIn: '24h' }
);

const playerResponse = (player, user) => ({
    id: String(player._id),
    username: user.username,
    level: Number(player.progress?.level || 1),
    experience: Number(player.progress?.experience || 0),
    nyankoPoints: Number(player.points || 0),
    energy: Number(player.energy || 0),
    maxEnergy: 100,
    gems: Number(player.progress?.gems || 0),
    battleCount: Number(player.progress?.battleCount || 0),
    winCount: Number(player.progress?.winCount || 0),
    loseCount: Number(player.progress?.loseCount || 0),
    gachaCount: Number(player.progress?.gachaCount || 0),
    lastEnergyUpdate: player.updatedAt?.toISOString?.() || new Date().toISOString(),
    createdAt: player.createdAt?.toISOString?.() || new Date().toISOString(),
    settings: player.progress?.settings || { sound: true, music: true, notifications: true }
});

const catResponse = async (owned, player) => {
    const base = await Cat.findOne({ ID: owned.catId }).lean();
    if (!base) return null;
    const team = Array.isArray(player.currentTeam) ? player.currentTeam : [];
    const teamPosition = team.indexOf(base.ID);
    const level = Number(owned.level || 1);
    const growth = Number(base.成長率 || 0);
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
        isInTeam: teamPosition >= 0,
        teamPosition: teamPosition >= 0 ? teamPosition : null,
        skills: [],
        createdFromGacha: true,
        battleCount: 0,
        winCount: 0,
        createdAt: owned.obtainedAt?.toISOString?.() || new Date().toISOString()
    };
};

router.post('/register', async (req, res) => {
    try {
        const username = String(req.body?.username || '').trim();
        const email = String(req.body?.email || '').trim().toLowerCase();
        const password = String(req.body?.password || '');
        if (username.length < 3 || username.length > 30) {
            return res.status(400).json({ success: false, message: 'ユーザー名は3〜30文字で入力してください' });
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ success: false, message: '有効なメールアドレスを入力してください' });
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'パスワードは8文字以上で入力してください' });
        }
        if (await User.findOne({ $or: [{ email }, { username }] })) {
            return res.status(409).json({ success: false, message: '既に存在するユーザーです' });
        }
        const user = await User.create({ username, email, password });
        const player = await Player.create({
            userId: user._id,
            name: username,
            points: 1000,
            energy: 100,
            ownedCats: [{ catId: 'cat001', level: 1 }]
        });
        res.status(201).json({
            success: true,
            message: '登録が完了しました',
            data: { token: tokenFor(user), player: playerResponse(player, user) }
        });
    } catch (err) {
        if (err?.code === 11000) {
            return res.status(409).json({ success: false, message: '既に存在するユーザーです' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const email = String(req.body?.email || '').trim().toLowerCase();
        const username = String(req.body?.username || '').trim();
        const password = String(req.body?.password || '');
        if ((!email && !username) || !password) {
            return res.status(400).json({ success: false, message: 'ログイン情報が不足しています' });
        }
        const user = email
            ? await User.findOne({ email }).select('+password')
            : await User.findByUsernameWithPassword(username);
        if (!user || !user.isActive || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'メールアドレスまたはパスワードが違います' });
        }
        user.lastLogin = Date.now();
        await user.save();
        let player = await Player.findOne({ userId: user._id });
        if (!player) {
            player = await Player.create({ userId: user._id, name: user.username, points: 1000, energy: 100 });
        }
        res.json({
            success: true,
            message: 'ログインしました',
            data: { token: tokenFor(user), player: playerResponse(player, user) }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/profile', protect, async (req, res) => {
    try {
        const player = await Player.findOne({ userId: req.user._id });
        if (!player) return res.status(404).json({ success: false, message: 'プレイヤーデータがありません' });
        const cats = (await Promise.all(player.ownedCats.map(owned => catResponse(owned, player)))).filter(Boolean);
        res.json({ success: true, data: { player: playerResponse(player, req.user), cats } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
