const mongoose = require('mongoose');
const itemSchema = new mongoose.Schema({
    ID: String, 名前: String, タイプ: String, 効果値: String,
    値段: Number, 説明: String, 最大所持数: Number, 使用可能場所: String
});
module.exports = mongoose.model('Item', itemSchema);
