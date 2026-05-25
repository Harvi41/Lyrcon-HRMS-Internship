const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcementController");
const { verifyToken } = require("../middlewares/auth");

router.post("/", verifyToken, announcementController.createAnnouncement);
router.get("/", verifyToken, announcementController.getAnnouncements);
router.post("/:id/read", verifyToken, announcementController.markAsRead);
router.get("/targets", verifyToken, announcementController.getTargetOptions);

module.exports = router;
