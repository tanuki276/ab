const mongoose = require('mongoose');

const battleSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mapId: { type: String, default: null },
    result: { type: String, enum: ['win', 'lose', 'draw'], default: null },
    score: { type: Number, default: 0 },
    rewards: { type: mongoose.Schema.Types.Mixed, default: {} },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Battle', battleSchema);
