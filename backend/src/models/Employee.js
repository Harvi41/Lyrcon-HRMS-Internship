const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    dateOfBirth: {
      type: Date,
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },

    department: {
      type: String,
      trim: true,
    },

    designation: {
      type: String,
      trim: true,
    },

    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    workLocation: {
      type: String,
      trim: true,
    },

    emergencyContact: {
      name: {
        type: String,
        trim: true,
      },

      phone: {
        type: String,
        trim: true,
      },
    },

    address: {
      street: {
        type: String,
        trim: true,
      },

      city: {
        type: String,
        trim: true,
      },

      state: {
        type: String,
        trim: true,
      },

      country: {
        type: String,
        trim: true,
      },

      postalCode: {
        type: String,
        trim: true,
      },
    },

    status: {
      type: String,
      enum: ["active", "inactive", "terminated"],
      default: "active",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    probationStatus: {
      type: String,
      enum: ["Under Probation", "Confirmed", "Extended"],
      default: "Under Probation",
    },

    performanceRating: {
      type: Number,
      default: 5,
    },
    
    baseCTC: { type: Number, required: true, default: 0 },
    
    registeredDeviceFingerprint : {
        type: String,
        default: null ,
    },  
  },
  {
    timestamps: true,
    discriminatorKey: "roleType",
  },
);

const Employee = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);

// Define Discriminators only if not already compiled
if (!Employee.HR) {
  Employee.HR = Employee.discriminator(
    "HR",
    new mongoose.Schema({
      hrSpecialization: {
        type: String,
        default: "Generalist",
        trim: true,
      },
      assignedDepartments: [
        {
          type: String,
          trim: true,
        },
      ],
    })
  );
}

if (!Employee.Admin) {
  Employee.Admin = Employee.discriminator(
    "Admin",
    new mongoose.Schema({
      adminLevel: {
        type: Number,
        default: 1,
      },
      systemAccessFlags: [
        {
          type: String,
          default: "all",
        },
      ],
    })
  );
}

module.exports = Employee;
