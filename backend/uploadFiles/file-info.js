const mongoose = require('mongoose');

const NoteData = new mongoose.Schema({
  user: { type: String, required: true },
  title: { type: String, required: true },
  filename: { type: String, required: true },
  storedName: { type: String, required: true },
  fileType: { type: String, required: true },
  filePath: { type: String, required: true },
  group: { type: String, default: null },
  summary: { type: String, default: null },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Note', NoteData);
