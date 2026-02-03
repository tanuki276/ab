const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Player = require('../models/Player');

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. ユーザー重複チェック
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) return res.status(400).json({ success: false, message: '既に存在するユーザーです' });

        // 2. ユーザー作成
        user = await User.create({ username, email, password });

        // 3. プレイヤー初期データの作成 (にゃんこ大戦争の初期状態をイメージ)
        await Player.create({
            userId: user._id,
            name: username,
            points: 1000,
            energy: 100,
            ownedCats: [{ catId: 'cat001', level: 1 }] // 初期キャラ
        });

        res.status(201).json({ success: true, message: '登録が完了しました' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findByUsernameWithPassword(username);
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'ユーザー名またはパスワードが違います' });
        }

        user.lastLogin = Date.now();
        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'nyanko_secret',
            { expiresIn: '24h' }
        );

        res.json({ success: true, token, user: { id: user._id, username: user.username, role: user.role } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;