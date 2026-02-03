const mongoose = require('mongoose');

const mapSchema = new mongoose.Schema({
    ID: String,
    名前: String,
    章: Number,
    ステージ: Number,
    敵IDリスト: String,
    敵レベル: Number,
    獲得経験値: Number,
    獲得ポイント: Number,
    クリア条件: String,
    制限ターン: Number
});

module.exports = mongoose.model('Map', mapSchema);