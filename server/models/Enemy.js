const mongoose = require('mongoose');

const enemySchema = new mongoose.Schema({
    ID: String,
    名前: String,
    タイプ: String,
    攻撃力: Number,
    防御力: Number,
    体力: Number,
    速度: Number,
    獲得経験値: Number,
    獲得ポイント: Number,
    出現確率: Number,
    特殊スキル: String
});

module.exports = mongoose.model('Enemy', enemySchema);