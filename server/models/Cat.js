const mongoose = require('mongoose');
const catSchema = new mongoose.Schema({
    ID: String, 名前: String, レアリティ: String, タイプ: String,
    基本攻撃力: Number, 基本防御力: Number, 基本体力: Number,
    成長率: Number, コスト: Number, 説明: String
});
module.exports = mongoose.model('Cat', catSchema);
