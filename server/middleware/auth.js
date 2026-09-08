const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        const header = req.headers.authorization || '';
        if (!header.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: '認証が必要です' });
        }

        const token = header.slice(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nyanko_secret');
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'ユーザーが見つかりません' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: '無効な認証トークンです' });
    }
};

const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: '管理者権限が必要です' });
    }
    next();
};

module.exports = { protect, isAdmin };