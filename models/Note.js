const mongoose = require("mongoose")

const NoteSchema = new mongoose.Schema({

title:String,
content:String,
date:String,
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true
},

favourite:{type:Boolean, default:false},
archived:{type:Boolean, default:false},
trash:{type:Boolean, default:false},
isPublic: { type: Boolean, default: false },
shareableId: { type: String, unique: true, sparse: true },
tags: [{ type: String }],
createdAt:{type:Date, default:Date.now},
updatedAt:{type:Date, default:Date.now}

})

module.exports = mongoose.model("Note",NoteSchema)