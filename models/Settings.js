const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
  availableTags: { 
    type: [String], 
    default: ["students", "family", "travel", "Fitness", "love", "art", "fashion", "party", "fun", "nature", "food", "life", "music", "shopping"] 
  },
  minPasswordLength: { 
    type: Number, 
    default: 6 
  }
}, { timestamps: true });

// We ensure only one settings document exists
module.exports = mongoose.model("Settings", SettingsSchema);
