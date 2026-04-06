const express = require('express');
const router = express.Router();
const Event = require('./event-info');
const authMiddleware = require('../auth');
const { eventRules, validate } = require('./validate-event');

// POST /api/events: create event
router.post('/', authMiddleware, eventRules, validate, async (req, res) => {
  
  console.log('POST handler reached');
  
  try {
    const { title, description, startTime, endTime, isAllDay, subject, eventType } = req.body;

console.log('attempting Event.create with user:', req.user.id);

    const event = await Event.create({
      user: req.user.id,
      title,
      description,
      startTime,
      endTime,
      isAllDay,
      subject,
      eventType,
    });

    console.log('event created:', event);

    res.status(201).json({ message: 'Event created.', event });
  } catch (err) {


    console.error('error name:', err.name);
    console.error('error message:', err.message);
    console.error('full error:', err);

    res.status(500).json({ error: err.message });
  }
});

// GET /api/events: fetch all events for the user
// can also filter by ?start=<date>&end=<date>&eventType=exam&subject=Math
router.get('/', authMiddleware, async (req, res) => {
  try {
    const filter = { user: req.user.id };

    if (req.query.start && req.query.end) {
      filter.startTime = {
        $gte: new Date(req.query.start),
        $lte: new Date(req.query.end)
      };
    }
    if (req.query.eventType) filter.eventType = req.query.eventType;
    if (req.query.subject) filter.subject = req.query.subject;

    const events = await Event.find(filter).sort({ startTime: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/:id — get a single event
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, user: req.user.id });
    if (!event) return res.status(404).json({ error: 'Event not found.' });

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/events/:id — update an event's info
router.put('/:id', authMiddleware, eventRules, validate, async (req, res) => {
  try {
    const { title, description, startTime, endTime, isAllDay, subject, eventType } = req.body;

    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title, description, startTime, endTime, isAllDay, subject, eventType },
      { new: true, runValidators: true }
    );

    if (!event) return res.status(404).json({ error: 'Event not found.' });
    res.json({ message: 'Event updated.', event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:id — delete an event
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!event) return res.status(404).json({ error: 'Event not found.' });

    res.json({ message: 'Event deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;