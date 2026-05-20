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
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Employee", employeeSchema);
