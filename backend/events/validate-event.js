const { body, validationResult } = require('express-validator');

const eventRules = [
  body('title').notEmpty().withMessage('Title is required.').trim(),
  body('startTime').isISO8601().withMessage('Start time must be a valid date.'),
  body('endTime').isISO8601().withMessage('End time must be a valid date.'),
  body('isAllDay').optional().isBoolean(),
  body('eventType')
    .isIn(['exam', 'quiz', 'assignment', 'lecture', 'study session', 'office hours', 'other'])
    .withMessage('Invalid event type.'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { eventRules, validate };