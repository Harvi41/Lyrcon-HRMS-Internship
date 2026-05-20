const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    permissions: [
      {
        type: String,
        trim: true,
      },
    ],

    isDefault: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Role", roleSchema);

// {
//   name: "HR",

//   permissions: [
//     "employee.view",
//     "employee.create",
//     "employee.edit"
//   ]
// }
