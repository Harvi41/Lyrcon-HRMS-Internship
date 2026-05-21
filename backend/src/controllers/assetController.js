const Asset = require('../models/Asset');
const User = require('../models/User');

const clean = (v) => String(v || '').trim();
const codeOf = (b, n) => `LYRCON-${clean(b.floor)}-${clean(b.category).toUpperCase()}-${String(n).padStart(3, '0')}`.replace(/\s+/g, '-');

exports.createAsset = async (req, res) => {
    const { name, floor, category, count } = req.body;
    if (!name || !floor || !category) return res.status(400).json({ message: 'name, floor and category are required' });
    const n = (await Asset.countDocuments({ name: clean(name), floor: clean(floor) })) + 1;
    const asset = await Asset.create({ name: clean(name), floor: clean(floor), category: clean(category), count: Number(count) || 1, code: codeOf(req.body, n) });
    res.status(201).json(asset);
};

exports.listAssets = async (req, res) => res.json(await Asset.find().populate('damagedBy', 'name email'));
exports.getAssetById = async (req, res) => res.json(await Asset.findById(req.params.id).populate('damagedBy', 'name email'));
exports.updateAsset = async (req, res) => {
    const updated = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('damagedBy', 'name email');
    res.json(updated);
};
exports.deleteAsset = async (req, res) => res.json(await Asset.findByIdAndDelete(req.params.id));
exports.addComment = async (req, res) => res.json(await Asset.findByIdAndUpdate(req.params.id, { $push: { comments: clean(req.body.comment) } }, { new: true }));
exports.markDamaged = async (req, res) => res.json(await Asset.findByIdAndUpdate(req.params.id, { damaged: true, damagedBy: req.body.damagedBy, status: 'damaged' }, { new: true }));
exports.summary = async (req, res) => res.json({ total: await Asset.countDocuments(), damaged: await Asset.countDocuments({ damaged: true }) });
exports.employeeDamages = async (req, res) => res.json(await Asset.find({ damagedBy: req.params.userId }));