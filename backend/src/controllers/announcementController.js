const Announcement = require("../models/Announcement");
const User = require("../models/User");
const Employee = require("../models/Employee");
const Role = require("../models/Role");
const nodemailer = require("nodemailer");

const announcementController = {
  // 1. CREATE AND BROADCAST ANNOUNCEMENT
  createAnnouncement: async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        priority,
        targetAudience,
        targetGroup,
        targetRecipient,
      } = req.body;

      if (!title || !description || !targetAudience) {
        return res.status(400).json({ message: "Title, description, and target audience are required." });
      }

      // Create new announcement
      const newAnnouncement = new Announcement({
        sender: req.user.userId,
        title,
        description,
        category: category || "General",
        priority: priority || "Medium",
        targetAudience,
        targetGroup: targetAudience === "group" ? targetGroup : undefined,
        targetRecipient: targetAudience === "individual" ? targetRecipient : undefined,
        readBy: [req.user.userId], // Marked as read by sender automatically
      });

      const savedAnnouncement = await newAnnouncement.save();

      // Resolve recipient users for email delivery
      let recipientUsers = [];
      const hrRole = await Role.findOne({ name: "HR" });
      const employeeRole = await Role.findOne({ name: "Employee" });

      if (targetAudience === "all") {
        recipientUsers = await User.find({ isActive: true });
      } else if (targetAudience === "hr") {
        if (hrRole) {
          recipientUsers = await User.find({ role: hrRole._id, isActive: true });
        }
      } else if (targetAudience === "employee") {
        if (employeeRole) {
          recipientUsers = await User.find({ role: employeeRole._id, isActive: true });
        }
      } else if (targetAudience === "group") {
        const employees = await Employee.find({ department: targetGroup, isDeleted: false, status: "active" });
        const userIds = employees.map((emp) => emp.userId).filter(Boolean);
        recipientUsers = await User.find({ _id: { $in: userIds }, isActive: true });
      } else if (targetAudience === "individual") {
        const user = await User.findById(targetRecipient);
        if (user && user.isActive) {
          recipientUsers = [user];
        }
      }

      // Email dispatch using Nodemailer (with Console Log developer fallback)
      const hasSmtpCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASS;
      let emailSent = false;
      let smtpError = null;

      if (hasSmtpCredentials && recipientUsers.length > 0) {
        try {
          const smtpConfig = {
            host: process.env.EMAIL_HOST || "smtp.mailtrap.io",
            port: Number(process.env.EMAIL_PORT) || 2525,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          };
          const transporter = nodemailer.createTransport(smtpConfig);
          const emailAddresses = recipientUsers.map((u) => u.email).filter(Boolean);

          if (emailAddresses.length > 0) {
            await transporter.sendMail({
              from: '"Lyrcon HRMS Notifications" <notifications@lyrcon.com>',
              to: emailAddresses.join(", "),
              subject: `[${priority} Priority] ${title} - Lyrcon HRMS`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5eaf2; border-radius: 8px;">
                  <h2 style="color: #4f46e5; text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-top: 0;">Lyrcon Corporate Alert</h2>
                  <div style="margin: 20px 0;">
                    <h3 style="color: #0f172a; margin-top: 0;">${title}</h3>
                    <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 16px;">
                      <strong>Category:</strong> ${category || "General"} | <strong>Priority:</strong> ${priority || "Medium"}
                    </p>
                    <p style="color: #334155; line-height: 1.6; white-space: pre-line;">${description}</p>
                  </div>
                  <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 20px 0;"/>
                  <p style="font-size: 0.8rem; color: #94a3b8; text-align: center;">This notification was sent via Lyrcon HRMS Portal. Please do not reply directly.</p>
                </div>
              `,
            });
            console.log(`[SMTP] Announcement email successfully sent to: ${emailAddresses.join(", ")}`);
            emailSent = true;
          }
        } catch (err) {
          console.error("[SMTP ERROR] Failed to send announcement emails:", err.message);
          smtpError = err.message;
        }
      }

      if (!emailSent && recipientUsers.length > 0) {
        const emailAddresses = recipientUsers.map((u) => u.email).filter(Boolean);
        console.log("\n======================================================");
        console.log("📣  [FALLBACK MODE] ANNOUNCEMENT BROADCAST  📣");
        console.log(`Title:    ${title}`);
        console.log(`Category: ${category || "General"}`);
        console.log(`Priority: ${priority || "Medium"}`);
        console.log(`Recipients: ${emailAddresses.join(", ")}`);
        console.log(`Message:\n${description}`);
        if (smtpError) {
          console.log(`Reason:   SMTP failed (${smtpError})`);
        }
        console.log("======================================================\n");
      }

      res.status(201).json({
        message: "Announcement published successfully!",
        announcement: savedAnnouncement,
      });
    } catch (error) {
      console.error("Create announcement error:", error);
      res.status(500).json({ message: "Server error creating announcement.", error: error.message });
    }
  },

  // 2. GET TARGETED ANNOUNCEMENTS FOR LOGGED IN USER
  getAnnouncements: async (req, res) => {
    try {
      const loggedInUser = await User.findById(req.user.userId).populate("role");
      const employeeProfile = await Employee.findOne({ userId: req.user.userId, isDeleted: false });

      const userRoleName = String(loggedInUser?.role?.name || "").toLowerCase();
      const userDept = employeeProfile?.department || "";

      // Sender matches OR targeted explicitly
      const criteria = [
        { targetAudience: "all" },
        { sender: req.user.userId },
      ];

      if (userRoleName === "hr") {
        criteria.push({ targetAudience: "hr" });
      } else if (userRoleName === "employee") {
        criteria.push({ targetAudience: "employee" });
      }

      if (userDept) {
        criteria.push({ targetAudience: "group", targetGroup: userDept });
      }

      criteria.push({ targetAudience: "individual", targetRecipient: req.user.userId });

      const userCreationDate = loggedInUser?.createdAt || new Date(0);

      const announcements = await Announcement.find({ 
        $and: [
          { $or: criteria },
          { createdAt: { $gte: userCreationDate } }
        ]
      })
        .populate("sender", "name email")
        .populate("targetRecipient", "name email")
        .sort({ createdAt: -1 });

      // Append live unread indicators
      const announcementsWithReadStatus = announcements.map((ann) => {
        const isRead = ann.readBy.includes(req.user.userId);
        const senderId = ann.sender?._id ? String(ann.sender._id) : null;
        return {
          ...ann.toObject(),
          isRead: isRead || (senderId === String(req.user.userId)),
        };
      });

      // Calculate unread count (exclude what logged in user sent themselves)
      const unreadCount = announcementsWithReadStatus.filter((ann) => {
        const senderId = ann.sender?._id ? String(ann.sender._id) : null;
        return !ann.isRead && (senderId !== String(req.user.userId));
      }).length;

      res.status(200).json({
        announcements: announcementsWithReadStatus,
        unreadCount,
      });
    } catch (error) {
      console.error("Get announcements error:", error);
      res.status(500).json({ message: "Server error retrieving announcements.", error: error.message });
    }
  },

  // 3. MARK AN ANNOUNCEMENT AS READ
  markAsRead: async (req, res) => {
    try {
      const announcement = await Announcement.findById(req.params.id);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found." });
      }

      if (!announcement.readBy.includes(req.user.userId)) {
        announcement.readBy.push(req.user.userId);
        await announcement.save();
      }

      res.status(200).json({ message: "Announcement marked as read.", id: req.params.id });
    } catch (error) {
      console.error("Mark as read error:", error);
      res.status(500).json({ message: "Server error marking announcement as read.", error: error.message });
    }
  },

  // 4. GET SYSTEM TARGETING OPTIONS (DEPARTMENTS & USERS)
  getTargetOptions: async (req, res) => {
    try {
      const departments = await Employee.distinct("department", {
        isDeleted: false,
        department: { $ne: null, $ne: "" },
      });

      const users = await User.find({ isActive: true })
        .select("name email role")
        .populate("role", "name");

      res.status(200).json({
        departments: departments.filter(Boolean),
        users: users.map((u) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role?.name || "Employee",
        })),
      });
    } catch (error) {
      console.error("Get targeting options error:", error);
      res.status(500).json({ message: "Server error retrieving targeting choices.", error: error.message });
    }
  },
};

module.exports = announcementController;
