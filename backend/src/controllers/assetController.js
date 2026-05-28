const Asset = require('../models/Asset');
const User = require('../models/User');
const Employee = require('../models/Employee');

const clean = (v) => String(v || '').trim();

const buildAssetPayload = (body) => {
    const status = clean(body.status) || 'Active';
    const condition = clean(body.condition) || 'Excellent';
    const isDamaged = condition.toLowerCase() === 'damaged' || status.toLowerCase() === 'damaged';

    return {
        name: clean(body.name),
        category: clean(body.category),
        modelNumber: clean(body.modelNumber),
        brand: clean(body.brand),
        manufactureYear: clean(body.manufactureYear),
        assignedTo: clean(body.assignedTo),
        department: clean(body.department) || 'Engineering',
        assetValue: clean(body.assetValue),
        issueDate: clean(body.issueDate),
        returnDate: clean(body.returnDate),
        status,
        condition,
        damaged: isDamaged,
        floor: clean(body.floor) || 'Ground',
        code: clean(body.code) || clean(body._id)
    };
};

const validateAssignedEmployee = async (assignedTo) => {
    if (!assignedTo || assignedTo.trim() === '') {
        return true; // No assignment is valid
    }

    const trimmed = assignedTo.trim();
    
    // 1. Try to match the Name (EmployeeCode) pattern, e.g. "Prince Ghevariya (EMP-001)"
    const codeMatch = trimmed.match(/\(([^)]+)\)$/);
    if (codeMatch) {
        const code = codeMatch[1].trim();
        const emp = await Employee.findOne({ employeeCode: code, isDeleted: false });
        if (emp) return true;
    }

    // 2. Try matching by employeeCode directly (in case just the code was sent)
    const empByCode = await Employee.findOne({ employeeCode: trimmed, isDeleted: false });
    if (empByCode) return true;

    // 3. Fallback: match by full name or parts of the name
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2) {
        const emp = await Employee.findOne({
            firstName: parts[0],
            lastName: parts.slice(1).join(' '),
            isDeleted: false
        });
        if (emp) return true;
    } else {
        const emp = await Employee.findOne({
            $or: [
                { firstName: trimmed },
                { lastName: trimmed }
            ],
            isDeleted: false
        });
        if (emp) return true;
    }

    return false; // No employee found in database
};

exports.createAsset = async (req, res) => {
    try {
        const { name, category } = req.body;

        if (!name || !category) {
            return res.status(400).json({ message: 'name and category are required' });
        }

        // Validate assigned employee exists in database
        const isEmployeeVal = await validateAssignedEmployee(req.body.assignedTo);
        if (!isEmployeeVal) {
            return res.status(400).json({ message: `Assigned employee '${req.body.assignedTo}' does not exist in the database.` });
        }

        const assetId = req.body._id || `AST-${Math.floor(Math.random() * 900) + 100}`;
        
        // Ensure no duplicate custom _id
        const existing = await Asset.findById(assetId);
        if (existing) {
            return res.status(400).json({ message: `Asset ID ${assetId} already exists in database` });
        }

        const payload = buildAssetPayload(req.body);
        const asset = await Asset.create({
            _id: assetId,
            ...payload
        });

        res.status(201).json(asset);
    } catch (error) {
        console.error('Create Asset Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.listAssets = async (req, res) => {
    try {
        const assets = await Asset.find().populate('damagedBy', 'name email');
        res.json(assets);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getAssetById = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id).populate('damagedBy', 'name email');
        if (!asset) {
            return res.status(404).json({ message: 'Asset not found' });
        }
        res.json(asset);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updateAsset = async (req, res) => {
    try {
        const existingAsset = await Asset.findById(req.params.id);

        if (!existingAsset) {
            return res.status(404).json({ message: 'Asset not found' });
        }

        // Validate assigned employee exists in database
        const isEmployeeVal = await validateAssignedEmployee(req.body.assignedTo);
        if (!isEmployeeVal) {
            return res.status(400).json({ message: `Assigned employee '${req.body.assignedTo}' does not exist in the database.` });
        }

        const payload = buildAssetPayload(req.body);
        const updated = await Asset.findByIdAndUpdate(req.params.id, payload, { new: true }).populate('damagedBy', 'name email');

        res.json(updated);
    } catch (error) {
        console.error('Update Asset Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.deleteAsset = async (req, res) => {
    try {
        const deleted = await Asset.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Asset not found' });
        }
        res.json(deleted);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.addComment = async (req, res) => {
    try {
        const updated = await Asset.findByIdAndUpdate(req.params.id, { $push: { comments: clean(req.body.comment) } }, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.markDamaged = async (req, res) => {
    try {
        const updated = await Asset.findByIdAndUpdate(req.params.id, { damaged: true, damagedBy: req.body.damagedBy, status: 'damaged' }, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.summary = async (req, res) => {
    try {
        res.json({ total: await Asset.countDocuments(), damaged: await Asset.countDocuments({ damaged: true }) });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.employeeDamages = async (req, res) => {
    try {
        res.json(await Asset.find({ damagedBy: req.params.userId }));
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 11. GET MY ASSETS (For the logged-in employee)
exports.getMyAssets = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        const employee = await Employee.findOne({ userId: req.user.userId, isDeleted: false });
        let queryOptions = [];

        if (employee) {
            const codeRegex = new RegExp(employee.employeeCode, 'i');
            const nameRegex = new RegExp(`${employee.firstName} ${employee.lastName}`, 'i');
            queryOptions.push({ assignedTo: { $regex: codeRegex } });
            queryOptions.push({ assignedTo: { $regex: nameRegex } });
            queryOptions.push({ assignedTo: employee.employeeCode });
        } else {
            // Fallback for Admin/System users who only have a User record
            const user = await User.findById(req.user.userId);
            if (user && user.name) {
                const nameRegex = new RegExp(user.name, 'i');
                queryOptions.push({ assignedTo: { $regex: nameRegex } });
            } else {
                return res.status(200).json([]);
            }
        }
        
        const assets = await Asset.find({
            $or: queryOptions
        });
        
        res.status(200).json(assets);
    } catch (error) {
        console.error('Get My Assets Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};