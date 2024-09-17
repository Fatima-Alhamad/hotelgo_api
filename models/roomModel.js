const mongoose = require('mongoose');
const { matches } = require('validator');

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    roomType: { type: String, required: true },
    description: { type: String },
    capacity: { type: Number, required: true },
    price: { type: Number, required: true },
    amenities: [String],
    images: [String],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// to see if room is available :
roomSchema.virtual('availability', {
  ref: 'Availability',
  foreignField: 'room',
  localField: '_id',
});

// to populate the availabilty:
roomSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'availability',
    match: { date: { $gte: new Date() } },
  });
  next();
});

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
