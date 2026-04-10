const express = require('express');
const router = express.Router();
const upload = require('./upload-file');
const Note = require('./file-info');
const authMiddleware = require('../auth');
const fs = require('fs');
const path = require('path');

const textExtraction = require('./ai-integration/extract-text');
const contentSummary = require('./ai-integration/summarize');

router.post('/upload', authMiddleware, (req, res, next) => {
  upload.single('note')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      const fallbackName = String(req.body.filename || req.body.title || '').trim();
      if (!fallbackName) return res.status(400).json({ error: 'No file uploaded.' });

      const safeFilename = fallbackName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const uploadsRoot = path.resolve(__dirname, '..', 'uploaded_file_list');
      if (!fs.existsSync(uploadsRoot)) {
        fs.mkdirSync(uploadsRoot, { recursive: true });
      }

      const storedName = `${Date.now()}-${safeFilename.endsWith('.txt') ? safeFilename : `${safeFilename}.txt`}`;
      const filePath = path.join(uploadsRoot, storedName);
      const content = String(req.body.content || '').trim() || `Placeholder content for ${fallbackName}`;
      fs.writeFileSync(filePath, content, 'utf8');

      const note = await Note.create({
        user: String(req.user.id),
        title: req.body.title || fallbackName,
        filename: fallbackName,
        storedName,
        fileType: 'text/plain',
        filePath,
        group: req.body.group || null,
        summary: content,
      });

      return res.status(201).json({ message: 'Note uploaded successfully.', note });
    }

    const extractedText = await textExtraction(req.file.path, req.file.mimetype);
    const summary = await contentSummary(req.file.path, req.file.mimetype, extractedText);

    const note = await Note.create({
      user: String(req.user.id),
      title: req.body.title || req.file.originalname,
      filename: req.file.originalname,
      storedName: req.file.filename,
      fileType: req.file.mimetype,
      filePath: req.file.path,
      group: req.body.group || null,
      summary,
    });

    res.status(201).json({ message: 'Note uploaded successfully.', note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ user: String(req.user.id) }).sort({ uploadedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/download', authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: String(req.user.id) });
    if (!note) return res.status(404).json({ error: 'Note not found.' });

    res.download(note.filePath, note.filename);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: String(req.user.id) });
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
