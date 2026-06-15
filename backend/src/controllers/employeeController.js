const Employee = require('../models/Employee');
const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // ◄ Added for automated credential delivery

// 📧 Configure Automated SMTP Mail Transporter 
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SYSTEM_EMAIL,    // Maps to your .env file
        pass: process.env.SYSTEM_PASSWORD  // Maps to your 16-character Google App Password
    }
});

// 1. CREATE AND ONBOARD NEW EMPLOYEE
exports.createEmployee = async (req, res) => {
    try {
        const { 
            employeeCode, firstName, lastName, email, phoneNumber, 
            gender, dateOfBirth, joiningDate, department, designation, 
            managerId, workLocation, emergencyContact, address, roleName, baseCTC
        } = req.body;
        
        const existingEmail = await Employee.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Employee with this email already exists' });
        }

        const existingCode = await Employee.findOne({ employeeCode });
        if (existingCode) {
            return res.status(400).json({ message: 'Employee with this employee code already exists' });
        }

        let verifiedManagerId = null;
        if (managerId) {
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(managerId);
            if (!isValidObjectId) {
                return res.status(400).json({ message: "Invalid Manager ID format string provided." });
            }

            const activeManager = await Employee.findOne({ _id: managerId, isDeleted: false });
            if (!activeManager) {
                return res.status(422).json({ 
                    message: "Validation Error: The assigned supervisor does not exist or has been terminated." 
                });
            }
            verifiedManagerId = activeManager._id;
        }

        const selectedRole = roleName || 'Employee'; 
        const targetRole = await Role.findOne({ name: selectedRole, isActive: true });
        if (!targetRole) {
            return res.status(404).json({ message: `Role '${selectedRole}' not found or is currently inactive.` });
        }

        // Generate a secure temporary password for the new hire
        const temporaryPassword = `Lyrcon2026!${crypto.randomBytes(4).toString('hex')}`;
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        // 🛡️ FIX: Flatten the incoming Frontend Address Object cleanly into a structured String
        let processedAddress = "";
        if (address && typeof address === 'object') {
            // Extracts the nested 'street' property sent by your frontend form schema
            processedAddress = address.street || "";
        } else {
            processedAddress = address || "";
        }

        // Create the Auth Account inside the User collection
        const newUser = await User.create({
            name: `${firstName} ${lastName}`.trim(),
            email: email.toLowerCase(),
            password: hashedPassword,
            role: targetRole._id,
            address: processedAddress // ◄ Safe flat string applied here
        });

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
            EmployeeModel = Employee; 
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
            managerId: verifiedManagerId, 
            workLocation,
            emergencyContact,
            address: processedAddress, // ◄ Safe flat string applied here to prevent document corruption
            baseCTC : Number(baseCTC) || 0,
            ...roleSpecificFields
        });

        const savedEmployee = await newEmployee.save();

        await User.findByIdAndUpdate(newUser._id, {
            $set: { employeeId: savedEmployee._id }
        });

        // ✉️ REQUIREMENT 4: Automated Credentials Mail Dispatcher
        const mailOptions = {
            from: `"Lyrcon HRMS Workspace" <${process.env.SYSTEM_EMAIL}>`,
            to: email,
            subject: "Welcome to Lyrcon HRMS - Workspace Onboarding Credentials",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 25px; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px; color: #1e293b;">
                    <h2 style="color: #4f46e5; margin-bottom: 5px;">Welcome aboard, ${firstName}!</h2>
                    <p style="font-size: 15px; color: #475569;">Your official corporate employee profile record has been successfully generated.</p>
                    <p style="font-size: 15px; color: #475569;">Please log into your dashboard using the access credentials below:</p>
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4f46e5;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr style="height: 35px;">
                                <td style="font-weight: bold; width: 140px; color: #334155;">Employee ID:</td>
                                <td style="color: #0f172a; font-family: monospace; font-size: 15px;">${employeeCode}</td>
                            </tr>
                            <tr style="height: 35px;">
                                <td style="font-weight: bold; color: #334155;">Login Email:</td>
                                <td style="color: #0f172a;">${email.toLowerCase()}</td>
                            </tr>
                            <tr style="height: 35px;">
                                <td style="font-weight: bold; color: #334155;">Temp Password:</td>
                                <td style="color: #ef4444; font-weight: bold; font-size: 15px;">${temporaryPassword}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (mailErr) => {
            if (mailErr) console.error("SMTP Automation error log:", mailErr);
        });

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
        const allowedUpdates = [
            'firstName', 'lastName', 'phoneNumber', 'gender', 'dateOfBirth', 
            'department', 'designation', 'workLocation', 'emergencyContact', 'address'
        ];

        const updates = {};
        Object.keys(req.body).forEach((key) => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        if (req.body.managerId !== undefined) {
            if (req.body.managerId === null || req.body.managerId === '') {
                updates.managerId = null;
            } else {
                const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(req.body.managerId);
                if (!isValidObjectId) {
                    return res.status(400).json({ message: "Invalid Manager ID format string." });
                }
                
                if (req.body.managerId === req.params.id) {
                    return res.status(400).json({ message: "An employee cannot be assigned as their own direct supervisor." });
                }

                const activeManager = await Employee.findOne({ _id: req.body.managerId, isDeleted: false });
                if (!activeManager) {
                    return res.status(422).json({ message: "Provided Manager ID does not point to an active corporate record." });
                }
                updates.managerId = activeManager._id;
            }
        }

        if (req.body.baseCTC && req.user.roleName === 'admin') {
            updates.baseCTC = Number(req.body.baseCTC);
        }

        const updatedEmployee = await Employee.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { $set: updates },
            { returnDocument: 'after', runValidators: true }
        ).populate('managerId', 'firstName lastName employeeCode');
        
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
            { returnDocument: 'after' }
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
        
        let employee = await Employee.findOne({ userId: req.user.userId, isDeleted: false })
            .populate('managerId', 'firstName lastName employeeCode email');
            
        if (!employee) {
            // Fallback for users (e.g. system admins) who don't have a linked Employee profile
            const user = await User.findById(req.user.userId);
            if (!user) {
                return res.status(404).json({ message: 'User profile not found' });
            }
            
            const nameParts = (user.name || '').split(' ');
            employee = {
                firstName: nameParts[0] || 'System',
                lastName: nameParts.slice(1).join(' ') || 'User',
                email: user.email,
                employeeCode: 'SYS-001',
                designation: req.user.roleName || 'Administrator',
                department: 'System Management',
                status: 'active',
                joiningDate: user.createdAt || new Date(),
            };
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
