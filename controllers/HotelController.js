const Hotel = require('../models/hotelModel');
const Room = require('../models/roomModel');
const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
const Offer = require('../models/offerModel');
const Availability = require('../models/availabilityModel');
const catchAsync = require('../utiles/catchAsync');
const AppError = require('../utiles/errorApp');
const ApiFeatures = require('../utiles/APIFeatures');

exports.getAllHotels = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Hotel.find(), req.query)
    .filter()
    .sort()
    .limitingFields()
    .paginate();
  const hotels = await features.query;
  res.status(200).json({
    status: 'success',
    result: hotels.length,

    data: {
      hotels,
    },
  });
});
exports.getHotel = catchAsync(async (req, res, next) => {
  const { hotelId } = req.params;
  const hotel = await Hotel.findById(hotelId)
  if (!hotel) {
    return next(new AppError(`No found hotel with this ID`, 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      hotel,
    },
  });
});

exports.addHotel = catchAsync(async (req, res, next) => {
  const newHotel = await Hotel.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      hotel: newHotel,
    },
  });
});

exports.deleteHotel = catchAsync(async (req, res, next) => {
  const { hotelId } = req.params;
  const hotel = await Hotel.findById(hotelId);
  if (req.user._id.toString() !== hotel.owner.toString()) {
    if (req.user.role !== 'admin') {
      next(new AppError('your are not authorized to make this action', 403));
    }
  }
  const rooms = await Room.find({ hotel: hotel._id });
  await Promise.all(
    rooms.map((room) => Availability.deleteMany({ room: room._id }))
  );
  //  Promise.all takes an array of promises and returns a new promise.
  // This new promise resolves when all of the promises in the array have resolved, or rejects if any of them reject.
  // In this case, it's waiting for all the deletion operations to complete

  await Room.deleteMany({ hotel: hotel._id });
  await Offer.deleteMany({ hotel: hotel._id });
  await Booking.deleteMany({ hotel: hotel._id });
  await Review.deleteMany({ hotel: hotel._id });
  await Hotel.findByIdAndDelete(hotelId);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
