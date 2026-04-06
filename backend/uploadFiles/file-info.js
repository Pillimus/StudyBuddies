const mongoose = require('mongoose');

const NoteData = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  filename: { type: String, required: true },   // original file name
  storedName: { type: String, required: true },  // UUID-based name on disk
  fileType: { type: String, required: true },    // mimetype
  filePath: { type: String, required: true },    // path to file
  summary: { type: String, default: null }, 
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', NoteData);