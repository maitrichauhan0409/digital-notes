require("dotenv").config();

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const app = express()


app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.send("Backend is Live 🚀");
});



const notesRoutes = require("./routes/notes")
const authRoutes = require("./routes/auth")
const adminRoutes = require("./routes/admin")
const { authenticateToken } = require("./middleware/auth")
const Note = require("./models/Note")



mongoose.connect("mongodb+srv://Maitri:maitri2005@cluster0.ipzdiqg.mongodb.net/digitalnotes")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err))

// Public routes
app.use("/api/auth", authRoutes)

// Public Shared Note Route
app.get("/api/public/notes/s/:shareableId", async (req, res) => {
  try {
    const note = await Note.findOne({ shareableId: req.params.shareableId, isPublic: true });
    if (!note) return res.status(404).json({ success: false, message: "Note not found or is no longer public" });
    res.json(note);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Protected routes
app.use("/api/notes", authenticateToken, notesRoutes)
app.use("/api/admin", adminRoutes)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});