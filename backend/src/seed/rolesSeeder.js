const Role = require("../models/Role");

const seedRoles = async () => {
  try {
    const roles = [
      {
        name: "Admin",

        description: "Full system access",

        permissions: ["*"],

        isDefault: true,
      },

      {
        name: "HR",

        description: "Human Resource Manager",

        permissions: [
          "employee.view",
          "employee.create",
          "employee.edit",
          "employee.delete",
          "asset.view",
          "asset.create",
          "asset.edit",
          "asset.delete",
        ],

        isDefault: true,
      },

      {
        name: "Employee",

        description: "Basic employee access",

        permissions: ["employee.view_self"],

        isDefault: true,
      },
    ];

    for (const role of roles) {
      const exists = await Role.findOne({
        name: role.name,
      });

      if (!exists) {
        await Role.create(role);

        console.log(`${role.name} role created`);
      }
    }

    console.log("Default roles seeded");
  } catch (error) {
    console.error("Role seeding error:", error.message);
  }
};

module.exports = seedRoles;
