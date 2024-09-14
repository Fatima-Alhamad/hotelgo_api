const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  date: { type: Date, required: true },
  available: { type: Boolean, required: true },
});

const Availability = mongoose.model('Availability', availabilitySchema);
module.exports = Availability;
