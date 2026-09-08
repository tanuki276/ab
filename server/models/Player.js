const mongoose = require('mongoose');

const ownedCatSchema = new mongoose.Schema({
    catId: { type: String, required: true },
    level: { type: Number, default: 1, min: 1 },
    obtainedAt: { type: Date, default: Date.now }
}, { _id: false });

const playerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    points: { type: Number, default: 0, min: 0 },
    energy: { type: Number, default: 100, min: 0 },
    ownedCats: { type: [ownedCatSchema], default: [] },
    currentTeam: { type: [String], default: [] },
    progress: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema);
