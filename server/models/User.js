const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Termux互換性のための変更

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: [true, 'ユーザー名は必須です'],
        unique: true,
        trim: true,
        minlength: [3, 'ユーザー名は3文字以上です'],
        maxlength: [30, 'ユーザー名は30文字以内です']
    },
    email: {
        type: String,
        required: [true, 'メールアドレスは必須です'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, '有効なメールアドレスを入力してください']
    },
    password: { 
        type: String, 
        required: [true, 'パスワードは必須です'],
        minlength: [8, 'パスワードは8文字以上です'],
        select: false 
    },
    role: { 
        type: String, 
        enum: ['user', 'admin'],
        default: 'user' 
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// 保存前のハッシュ化
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// パスワード比較メソッド
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// 静的メソッド：ログイン用
userSchema.statics.findByUsernameWithPassword = function(username) {
    return this.findOne({ username }).select('+password');
};

module.exports = mongoose.model('User', userSchema);
