const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  user: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  isAllDay: { type: Boolean, default: false },
  subject: { type: String, trim: true },
  location: { type: String, trim: true },
  eventType: {
    type: String,
    enum: ['exam', 'assignment', 'group', 'study'],
    required: true,
  },
}, { timestamps: true });

EventSchema.pre('save', async function () {
  if (this.endTime <= this.startTime && !this.isAllDay) {
    throw new Error('End time must be after start time.');
  }
});

module.exports = mongoose.model('Event', EventSchema);
