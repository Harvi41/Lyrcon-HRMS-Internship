const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    floor: { type: String, trim: true, default: 'Ground' },
    category: { type: String, required: true, trim: true },
    count: { type: Number, default: 1 },
    status: { type: String, default: 'Active' },
    damaged: { type: Boolean, default: false },
    damagedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    assignedTo: { type: String, trim: true, default: '' },
    comments: [{ type: String }],

    // Frontend fields
    modelNumber: { type: String, trim: true, default: '' },
    brand: { type: String, trim: true, default: '' },
    manufactureYear: { type: String, trim: true, default: '' },
    department: { type: String, trim: true, default: 'Engineering' },
    issueDate: { type: String, trim: true, default: '' },
    returnDate: { type: String, trim: true, default: '' },
    condition: { type: String, trim: true, default: 'Excellent' },
    assetValue: { type: String, trim: true, default: '' }
}, { timestamps: true });

module.exports = mongoose.models.Asset || mongoose.model('Asset', assetSchema);