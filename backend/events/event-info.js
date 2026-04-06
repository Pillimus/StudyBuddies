const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },      // optional field
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  isAllDay: { type: Boolean, default: false },
  subject: { type: String, trim: true },          // optional field
  eventType: {
    type: String,
    enum: ['exam', 'assignment', 'lecture', 'study session', 'office hours', 'other'],
    required: true
  },
}, { timestamps: true });

// make sure end time is always after start time
EventSchema.pre('save', async function () {
  if (this.endTime <= this.startTime && !this.isAllDay) {
    throw new Error('End time must be after start time.');
  }
});

module.exports = mongoose.model('Event', EventSchema);