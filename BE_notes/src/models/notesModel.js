const mongoose = require('mongoose')

const notesSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  fileKey: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
})

module.exports = mongoose.model('Notes', notesSchema)
