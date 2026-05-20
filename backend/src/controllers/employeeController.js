const Employee = require('../models/Employee');
const User = require('../models/User');

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
            userId 
        } = req.body;
        
        // Check if an employee with the same email or code already exists
        const existingEmail = await Employee.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Employee with this email already exists' });
        }

        const existingCode = await Employee.findOne({ employeeCode });
        if (existingCode) {
            return res.status(400).json({ message: 'Employee with this employee code already exists' });
        }

        // Create the profile
        const newEmployee = new Employee({
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
            address
        });

        const savedEmployee = await newEmployee.save();

        if (userId) {
            await User.findByIdAndUpdate(userId, {
                $set: { employeeId: savedEmployee._id }
            });
        }

        res.status(201).json(savedEmployee);
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