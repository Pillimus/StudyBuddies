const express = require('express');
const router = express.Router();
const upload = require('./upload-file');
const Note = require('./file-info');
const authMiddleware = require('../auth');

const textExtraction = require('./ai-integration/extract-text');
const contentSummary = require('./ai-integration/summarize');

// POST /api/notes/upload
router.post('/upload', authMiddleware, (req, res, next) => {
  upload.single('note')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const extractedText = await textExtraction(req.file.path, req.file.mimetype);
    const summary = await contentSummary(req.file.path, req.file.mimetype, extractedText);

    const note = await Note.create({
      user: req.user.id,
      title: req.body.title || req.file.originalname,
      filename: req.file.originalname,
      storedName: req.file.filename,
      fileType: req.file.mimetype,
      filePath: req.file.path,
      summary
    });

    res.status(201).json({ message: 'Note uploaded successfully.', note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notes: retrieve all notes for the user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ uploadedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notes/:id/download — stream a file back to the user
router.get('/:id/download', authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ error: 'Note not found.' });

    res.download(note.filePath, note.filename);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/notes/:id
const fs = require('fs');
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ error: 'Note not found.' });

    fs.unlink(note.filePath, err => {
      if (err) console.error('File deletion error:', err);
    });

    res.json({ message: 'Note deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;