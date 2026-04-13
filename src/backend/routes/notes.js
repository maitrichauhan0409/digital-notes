const express = require("express")
const router = express.Router()
const Note = require("../models/Note")

// GET all notes for authenticated user
router.get("/", async(req,res)=>{
  console.log("Fetching notes for user ID:", req.user?.userId);
  
  try {
    const notes = await Note.find({userId: req.user.userId, trash:false, archived:false})
    console.log("Found notes:", notes.length);
    res.json(notes)
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// CREATE note for authenticated user
router.post("/", async(req,res)=>{
const { title, content } = req.body;
if (!title?.trim() && !content?.trim()) {
  return res.status(400).json({ success: false, message: "Title or Content is required" });
}
const noteData = { ...req.body, userId: req.user.userId }
const note = new Note(noteData)
await note.save()
res.json(note)
})

// UPDATE note (only if belongs to authenticated user)
router.put("/:id", async(req,res)=>{
const { title, content } = req.body;
// Optional: Only validate if title and content are actually provided in req.body
if (title !== undefined && content !== undefined) {
  if (!title?.trim() && !content?.trim()) {
    return res.status(400).json({ success: false, message: "Title or Content cannot be empty" });
  }
}
const note = await Note.findOneAndUpdate(
  { _id: req.params.id, userId: req.user.userId }, 
  req.body, 
  { new: true }
)
if (!note) {
  return res.status(404).json({ success: false, message: "Note not found" })
}
res.json(note)
})

// DELETE -> move to trash (only if belongs to authenticated user)
router.put("/trash/:id", async(req,res)=>{
const note = await Note.findOneAndUpdate(
  { _id: req.params.id, userId: req.user.userId },
  {trash:true},
  { new: true }
)
if (!note) {
  return res.status(404).json({ success: false, message: "Note not found" })
}
res.json({ success: true, message: "Moved to Trash" })
})

// FAVOURITE (only if belongs to authenticated user)
router.put("/favourite/:id", async(req,res)=>{
const note = await Note.findOne({ _id: req.params.id, userId: req.user.userId })
if (!note) {
  return res.status(404).json({ success: false, message: "Note not found" })
}
note.favourite = !note.favourite
await note.save()
res.json(note)
})

// ARCHIVE (only if belongs to authenticated user)
router.put("/archive/:id", async(req,res)=>{
const note = await Note.findOneAndUpdate(
  { _id: req.params.id, userId: req.user.userId },
  {archived:true},
  { new: true }
)
if (!note) {
  return res.status(404).json({ success: false, message: "Note not found" })
}
res.json({ success: true, message: "Archived" })
})

// GET FAVOURITES for authenticated user
router.get("/favourites/all", async(req,res)=>{
const notes = await Note.find({userId: req.user.userId, favourite:true, trash:false})
res.json(notes)
})

// GET ARCHIVED for authenticated user
router.get("/archived/all", async(req,res)=>{
const notes = await Note.find({userId: req.user.userId, archived:true})
res.json(notes)
})

// GET TRASH for authenticated user
router.get("/trash/all", async(req,res)=>{
const notes = await Note.find({userId: req.user.userId, trash:true})
res.json(notes)
})

// TOGGLE SHARE status
router.put("/share/:id", async(req,res)=>{
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!note) return res.status(404).json({ success: false, message: "Note not found" });

    note.isPublic = !note.isPublic;
    
    // Generate unique shareableId if it doesn't exist
    if (note.isPublic && !note.shareableId) {
      const crypto = require("crypto");
      note.shareableId = crypto.randomBytes(16).toString("hex");
    }

    await note.save();
    res.json({ success: true, isPublic: note.isPublic, shareableId: note.shareableId });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
})

// DELETE -> permanently remove from DB (only if belongs to authenticated user)
router.delete("/:id", async(req,res)=>{
try {
  const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.userId })
  if (!note) {
    return res.status(404).json({ success: false, message: "Note not found" })
  }
  res.json({ success: true, message: "Note permanently deleted" })
} catch (error) {
  console.error("Error deleting note permanently:", error);
  res.status(500).json({ success: false, message: "Server error" })
}
})

module.exports = router