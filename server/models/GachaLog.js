const mongoose = require('mongoose');

const gachaLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    gachaType: { type: String, default: 'normal' },
    cost: { type: Number, default: 0 },
    results: { type: mongoose.Schema.Types.Mixed, default: [] },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GachaLog', gachaLogSchema);
