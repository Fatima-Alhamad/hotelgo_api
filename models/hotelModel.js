const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    description: { type: String },
    rating: { type: Number, min: 0, max: 5 },
    amenities: [String],
    images: [String],
    contactInformation: {
      phone: { type: String },
      email: { type: String },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'hotel owner is required'],
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//virtual populate:
hotelSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'hotel',
  localField: '_id',
});

// populate
hotelSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'owner',
    select: 'firstName lastName email phoneNumber role',
  });
  next();
});
hotelSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'reviews',
  });
  next();
});

const Hotel = mongoose.model('Hotel', hotelSchema);
module.exports = Hotel;
