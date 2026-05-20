const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    floor: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    count: { type: Number, default: 1 },
    status: { type: String, default: 'available' },
    damaged: { type: Boolean, default: false },
    damagedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    comments: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.models.Asset || mongoose.model('Asset', assetSchema);