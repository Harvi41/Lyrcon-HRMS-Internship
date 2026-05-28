const Employee = require('../models/Employee');
const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

exports.createEmployee = async (req, res) => {
    try {
        const { 
            employeeCode, 
            firstName, 
            lastName, 
            email, 
            phoneNumber, 
            gender, 
            dateOfBirth, 
            joiningDate, 
            department, 
            designation, 
            managerId, 
            workLocation, 
            emergencyContact, 
            address,
            roleName,
            baseCTC
        } = req.body;
        
        // 1. Check if an employee with the same email or code already exists
        const existingEmail = await Employee.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Employee with this email already exists' });
        }

        const existingCode = await Employee.findOne({ employeeCode });
        if (existingCode) {
            return res.status(400).json({ message: 'Employee with this employee code already exists' });
        }

        // 2. Resolve the role from the database
        const selectedRole = roleName || 'Employee'; 
        const targetRole = await Role.findOne({ name: selectedRole, isActive: true });
        if (!targetRole) {
            return res.status(404).json({ message: `Role '${selectedRole}' not found or is currently inactive.` });
        }

        // 3. Generate a secure temporary password for the new hire
        const temporaryPassword = `Lyrcon2026!${crypto.randomBytes(8).toString('hex')}`;
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        // 4. STEP 1: Create the Auth Account inside the User collection
        const newUser = await User.create({
            name: `${firstName} ${lastName}`.trim(),
            email: email.toLowerCase(),
            password: hashedPassword,
            role: targetRole._id
        });

        // 5. Select the correct Mongoose Model and extract role-specific fields
        let EmployeeModel;
        let roleSpecificFields = {};

        if (targetRole.name === 'Admin') {
            EmployeeModel = Employee.Admin;
            roleSpecificFields = {
                adminLevel: req.body.adminLevel,
                systemAccessFlags: req.body.systemAccessFlags
            };
        } else if (targetRole.name === 'HR') {
            EmployeeModel = Employee.HR;
            roleSpecificFields = {
                hrSpecialization: req.body.hrSpecialization,
                assignedDepartments: req.body.assignedDepartments
            };
        } else {
            EmployeeModel = Employee; // Base model representing standard employees
            roleSpecificFields = {
                probationStatus: req.body.probationStatus,
                performanceRating: req.body.performanceRating
            };
        }

        const newEmployee = new EmployeeModel({
            userId: newUser._id, 
            employeeCode,
            firstName,
            lastName,
            email,
            phoneNumber,
            gender,
            dateOfBirth,
            joiningDate,
            department,
            designation,
            managerId: managerId || null,
            workLocation,
            emergencyContact,
            address,
            baseCTC : Number(baseCTC) || 0,
            ...roleSpecificFields
        });

        const savedEmployee = await newEmployee.save();

        // 6. STEP 2: Complete the bridge link by referencing employeeId back on the User document
        await User.findByIdAndUpdate(newUser._id, {
            $set: { employeeId: savedEmployee._id }
        });

        // 7. Send confirmation back to HR along with the temporary credentials
        res.status(201).json({
            message: 'Employee onboarded successfully!',
            employee: savedEmployee,
            credentials: {
                email: newUser.email,
                temporaryPassword: temporaryPassword 
            }
        });

    } catch (error) {
        console.error('Create Employee Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 2. GET ALL ACTIVE EMPLOYEES
exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find({ isDeleted: false })
            .populate('managerId', 'firstName lastName employeeCode');
            
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 3. GET A SINGLE EMPLOYEE BY ID
exports.getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findOne({ _id: req.params.id, isDeleted: false })
            .populate('managerId', 'firstName lastName employeeCode');

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found or has been removed' });
        }
        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 4. UPDATE AN EMPLOYEE
exports.updateEmployee = async (req, res) => {
    try {
        const updatedEmployee = await Employee.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { $set: req.body },
            { new: true, runValidators: true }
        );
        
        if (!updatedEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        
        res.status(200).json(updatedEmployee);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 5. DELETE AN EMPLOYEE (Soft Delete Implementation)
exports.deleteEmployee = async (req, res) => {
    try {
        const deletedEmployee = await Employee.findByIdAndUpdate(
            req.params.id,
            { $set: { isDeleted: true, status: 'terminated' } },
            { new: true }
        );
        
        if (!deletedEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        
        res.status(200).json({ message: 'Employee profile deleted successfully (Soft Delete)' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 6. GET CURRENT EMPLOYEE PROFILE (Me)
exports.getMe = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        const employee = await Employee.findOne({ userId: req.user.userId, isDeleted: false })
            .populate('managerId', 'firstName lastName employeeCode email');
            
        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found' });
        }
        
        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 7. GET COMPANY DIRECTORY (Lightweight employee list)
exports.getDirectory = async (req, res) => {
    try {
        const employees = await Employee.find({ isDeleted: false, status: 'active' })
            .select('firstName lastName email phoneNumber department designation workLocation roleType')
            .populate('managerId', 'firstName lastName email')
            .sort({ firstName: 1 });
            
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};