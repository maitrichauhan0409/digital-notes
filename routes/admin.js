const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Note = require("../models/Note");
const Settings = require("../models/Settings");
const { authenticateToken } = require("../middleware/auth");

// Admin middleware
const isAdmin = async (req, res, next) => {
  try {
    console.log("Checking admin status for userId:", req.user.userId);
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'admin') {
      console.log("Access denied. User role:", user?.role);
      return res.status(403).json({ success: false, message: "Access denied. Admin only." });
    }
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({ success: false, message: "Server error checking admin status" });
  }
};

// GET /api/admin/settings
router.get("/settings", authenticateToken, isAdmin, async (req, res) => {
  try {
    console.log("Admin fetching settings...");
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
      await settings.save();
    }
    res.json({ success: true, settings });
  } catch (error) {
    console.error("GET /settings error:", error);
    res.status(500).json({ success: false, message: "Error fetching settings" });
  }
});

// POST /api/admin/settings
router.post("/settings", authenticateToken, isAdmin, async (req, res) => {
  try {
    console.log("Admin saving settings:", req.body);
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      // Ensure we don't mess with version keys or other mongoose internals
      settings.availableTags = req.body.availableTags || settings.availableTags;
      settings.minPasswordLength = req.body.minPasswordLength || settings.minPasswordLength;
    }
    await settings.save();
    console.log("Settings saved successfully");
    res.json({ success: true, message: "Settings updated successfully", settings });
  } catch (error) {
    console.error("POST /settings error:", error);
    res.status(500).json({ success: false, message: "Error updating settings" });
  }
});

// PUBLIC GET /api/admin/public-settings (Accessible by all logged-in users)
router.get("/public-settings", authenticateToken, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = { availableTags: [], minPasswordLength: 6 };
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching public settings" });
  }
});

// GET /api/admin/stats
router.get("/stats", authenticateToken, isAdmin, async (req, res) => {
  try {
    const usersCount = await User.countDocuments({ role: 'user' });
    const notesCount = await Note.countDocuments({ trash: false });
    res.json({ success: true, usersCount, notesCount });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching stats" });
  }
});

// GET /api/admin/users
router.get("/users", authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
});

// PUT /api/admin/block/:id
router.put("/block/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ success: true, message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, isBlocked: user.isBlocked });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error toggling block status" });
  }
});

// DELETE /api/admin/delete/:id
router.delete("/delete/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    // Delete all notes owned by this user
    await Note.deleteMany({ userId: req.params.id });
    res.json({ success: true, message: "User and associated notes deleted completely" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
});

module.exports = router;
