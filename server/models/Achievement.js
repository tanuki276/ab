const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    id: { type: String, unique: true, sparse: true },
    name: String,
    description: String,
    reward: { type: mongoose.Schema.Types.Mixed, default: {} },
    condition: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });
module.exports = mongoose.model('Achievement', schema);
