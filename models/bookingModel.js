const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookingSchema = new mongoose.Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  hotel: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
  room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['confirmed', 'canceled', 'pending'],
    default: 'pending',
  },
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
