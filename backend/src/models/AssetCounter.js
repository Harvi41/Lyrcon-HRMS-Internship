const mongoose = require('mongoose');

const assetCounterSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true, trim: true },
    sequence: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.models.AssetCounter || mongoose.model('AssetCounter', assetCounterSchema);