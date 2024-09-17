const Availability = require('../models/availabilityModel');
const Booking = require('../models/bookingModel');
const Hotel = require('../models/hotelModel');
const Room = require('../models/roomModel');
const APIFeatures = require('../utiles/APIFeatures');
const catchAsync = require('../utiles/catchAsync');
const AppError = require('../utiles/errorApp');

exports.getAllBookingsAdmin = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Booking.find(), req.query)
    .filter()
    .limitingFields()
    .sort()
    .paginate();
  const bookings = await features.query;
  res.status(200).json({
    status: 'success',
    result: bookings.length,
    data: {
      bookings,
    },
  });
});

exports.getAllBookingsOwner = catchAsync(async (req, res, next) => {
  const { hotelId } = req.params;
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return next(new AppError(`hotel doesn't exist`));
  }
  if (req.user._id.toString() !== hotel.owner._id.toString()) {
    return next(new AppError(`you are not authorized to make this action`));
  }

  const features = new APIFeatures(Booking.find({ hotel: hotelId }), req.query)
    .filter()
    .limitingFields()
    .sort()
    .paginate();
  const bookings = await features.query;
  res.status(200).json({
    status: 'success',
    result: bookings.length,
    data: {
      bookings,
    },
  });
});

exports.bookRoom = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { roomId } = req.params;
  const { hotelId } = req.params;
  const hotel = await Hotel.findById(hotelId);
  const room = await Room.findById(roomId);
  if (!req.body.checkInDate || !req.body.checkOutDate) {
    return next(
      new AppError(
        `you should enter the checkin date and the checkout date`,
        400
      )
    );
  }
  if (!hotel) {
    return next(new AppError(`this hotel doesn't exist`));
  }
  if (!room) {
    return next(new AppError(`this room doesn't exist`));
  }
  // Parse the dates from the request body
  const checkInDateString = req.body.checkInDate; // Should be in YYYY-MM-DD format
  const checkOutDateString = req.body.checkOutDate; // Should be in YYYY-MM-DD format

  // Parse the dates
  const checkInDate = new Date(checkInDateString);

  const checkOutDate = new Date(checkOutDateString);

  // Set check-in time to start of the day
  checkInDate.setHours(3, 0, 0, 0);

  // Set check-out time to end of the day
  checkOutDate.setHours(23, 59, 59, 999);

  if (checkInDate < new Date() || checkInDate > checkOutDate) {
    return next(new AppError(`invalid checkIn date`, 400));
  }
  const availability = await Availability.find({
    room: roomId,
    date: { $gte: checkInDate, $lte: checkOutDate },
  });

  const AvailabilityDates = new Map(
    availability.map((obj) => [
      obj.date.toISOString().split('T')[0], //"2023-09-20T00:00:00.000Z"
      obj.available,
    ])
  );

  let available = true;
  let currentDate = new Date(checkInDate);
  while (currentDate <= checkOutDate) {
    const dateString = currentDate.toISOString().split('T')[0];
    if (
      !AvailabilityDates.has(dateString) ||
      !AvailabilityDates.get(dateString)
    ) {
      available = false;
      break;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (!available) {
    return next(new AppError(`this date is not available`, 400));
  }
  const totalDaysInMS = checkOutDate - checkInDate;
  const totalDays = Math.ceil(totalDaysInMS / (1000 * 60 * 60 * 24)); //Math.ceil make rounding  to the nearest whole number of days

  const newBooking = await Booking.create({
    user: userId,
    hotel: hotelId,
    room: roomId,
    checkInDate,
    checkOutDate,
    totalPrice: room.price * totalDays,
    status: 'pending',
  });
  // handle room to be unavailable :
  let startDate = new Date(checkInDate);
  while (startDate <= checkOutDate) {
    await Availability.findOneAndUpdate(
      { room: roomId, date: startDate },
      { available: false }
    );
    startDate.setDate(startDate.getDate() + 1);
  }
  res.status(200).json({
    status: 'success',
    message:
      'great! your booking is in pending state please pay to confirm your booking',
  });
});
exports.cancelBooking = catchAsync(async (req, res, next) => {});
