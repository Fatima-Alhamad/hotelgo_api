const Hotel = require('../models/hotelModel');
const Review = require('../models/reviewModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utiles/catchAsync');
const AppError = require('../utiles/errorApp');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const { hotelId } = req.params;
  const reviews = await Review.find({ hotel: hotelId });

  res.status(200).json({
    status: 'success',
    result: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const { hotelId } = req.params;
  const userId = req.user._id;
  req.body.user = userId;
  req.body.hotel = hotelId;
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return next(new AppError(`hotel not found`, 404));
  }
  const booking = await Booking.findOne({ hotel: hotelId, user: userId });
  // if (!booking || booking.status !== 'confirmed') {
  //   return next(
  //     new AppError(
  //       'you cannot make reviews if you did not make booking for this hotel',
  //       403
  //     )
  //   );
  // }

  hotel.reviewsCount += 1;
  hotel.save();
  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});
exports.deleteReview = catchAsync(async (req, res, next) => {
  // review id
  const { reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review) {
    return next(new AppError('review does not exist ', 404));
  }
  if (review.user.toString() !== req.user._id.toString()) {
    const user = await User.findById(req.user._id);
    if (user.role !== 'admin') {
      return next(new AppError('you are not authorized', 403));
    }
  }
  const hotel = await Hotel.findById(review.hotel);
  await Review.findByIdAndDelete(reviewId);
  hotel.reviewsCount -= 1;
  await hotel.save();
  res.status(200).json({
    status: 'success',
    message: 'review deleted',
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);
  if (review.user.toString() !== req.user._id.toString()) {
    return next(new AppError('your are not authorized', 401));
  }

  review.comment = req.body.comment || review.comment;
  review.rating = req.body.rating || review.rating;
  await review.save();

  res.status(200).json({
    status: 'success',
    message: 'review updated',
  });
});
