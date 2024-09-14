const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  roomType: { type: String, required: true },
  description: { type: String },
  capacity: { type: Number, required: true },
  price: { type: Number, required: true },
  availability: [{ type: Date }],
  amenities: [String],
  images: [String],
});

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
