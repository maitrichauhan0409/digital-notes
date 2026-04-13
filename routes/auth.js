const express = require("express")
const router = express.Router()
const User = require("../models/User")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const Settings = require("../models/Settings")

// JWT Secret
const JWT_SECRET = "your-secret-key-change-in-production"

// Register new user
router.post("/register", async (req, res) => {
  try {
    console.log("Registration request body:", req.body);
    const { username, email, password, contact } = req.body

    // Validate required fields
    if (!username || !email || !password || !contact) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      })
    }

    // Fetch dynamic password policy
    let settings = await Settings.findOne();
    const minLength = settings ? settings.minPasswordLength : 6;

    if (password.length < minLength) {
      return res.status(400).json({ 
        success: false, 
        message: `Password must be at least ${minLength} characters long` 
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "User already exists with this email" 
      })
    }

    // Create new user with hashed password
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = new User({ username, email, password: hashedPassword, contact })
    console.log("User object created:", user);
    await user.save()
    console.log("User saved successfully");

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: "24h" }
    )

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        contact: user.contact,
        role: user.role
      }
    })
  } catch (error) {
    console.error("Registration error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      errors: error.errors
    });
    
    // Handle specific mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed: " + validationErrors.join(", ")
      });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error during registration: " + error.message
    })
  }
})

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      })
    }

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      })
    }

    // Compare password using the method
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      })
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ 
        success: false, 
        message: "Your account has been blocked by the administrator. Please contact support." 
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: "24h" }
    )

    res.json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        contact: user.contact,
        role: user.role
      }
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during login"
    })
  }
})

const { authenticateToken } = require("../middleware/auth")

// Verify token and get user data
router.get("/verify", async (req, res) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "No token provided" 
      });
    }

    console.log("Verifying token:", token.substring(0, 20) + "...");

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Token decoded successfully for user:", decoded.userId);
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log("User not found for ID:", decoded.userId);
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    console.log("User found:", user.email);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        contact: user.contact,
        role: user.role
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      console.log("JWT verification failed:", error.message);
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token" 
      });
    }
    if (error.name === 'TokenExpiredError') {
      console.log("Token expired:", error.message);
      return res.status(401).json({ 
        success: false, 
        message: "Token expired" 
      });
    }
    console.error("Token verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during token verification"
    });
  }
});

// Update user profile
router.put("/update-profile", authenticateToken, async (req, res) => {
  console.log("PUT /api/auth/update-profile hit with body:", req.body);
  try {
    const { username, email, contact } = req.body;
    const userId = req.user.userId;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Email already in use" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { username, email, contact } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        contact: updatedUser.contact,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    
    // Handle specific mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: validationErrors.join(", ")
      });
    }

    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
});

// Change password
router.put("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect current password" });
    }

    // Fetch dynamic password policy
    let settings = await Settings.findOne();
    const minLength = settings ? settings.minPasswordLength : 6;

    if (newPassword.length < minLength) {
      return res.status(400).json({ 
        success: false, 
        message: `New password must be at least ${minLength} characters long` 
      });
    }

    // Hash and update the password field directly
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await User.findByIdAndUpdate(userId, { $set: { password: hashedPassword } });

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ success: false, message: "Server error during password change" });
  }
});

module.exports = router
