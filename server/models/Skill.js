const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    ID: String,
    名前: String,
    タイプ: String,
    効果値: String,
    消費MP: Number,
    説明: String,
    対象: String,
    発動確率: Number
});

module.exports = mongoose.model('Skill', skillSchema);