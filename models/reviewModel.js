const mongoose = require('mongoose');
const { Schema } = mongoose;
const reviewSchema = new mongoose.Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hotel: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    date: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// populate:
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'firstName lastName ',
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
