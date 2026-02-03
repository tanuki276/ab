const mongoose = require('mongoose');
const bossSchema = new mongoose.Schema({
    ID: String, 名前: String, 章: Number, 攻撃力: Number, 防御力: Number,
    体力: Number, 速度: Number, 特殊スキル1: String, 特殊スキル2: String,
    特殊スキル3: String, 弱体効果: String, ドロップアイテム: String
});
module.exports = mongoose.model('Boss', bossSchema);
