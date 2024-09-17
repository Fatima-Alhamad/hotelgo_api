const Room = require('../models/roomModel');
const Hotel = require('../models/hotelModel');
const Availability = require('../models/availabilityModel');
const catchAsync = require('../utiles/catchAsync');
const AppError = require('../utiles/errorApp');
const APIFeatures = require('../utiles/APIFeatures');

const checkHotel = async (hotelId, next) => {};

exports.getAllRooms = catchAsync(async (req, res, next) => {
  const { hotelId } = req.params;
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return next(new AppError(`hotel doesn't exist`, 404));
  }
  const features = new APIFeatures(Room.find(), req.query)
    .filter()
    .sort()
    .limitingFields()
    .paginate();
  const rooms = await features.query;
  res.status(200).json({
    status: 'success',
    result: rooms.length,
    data: {
      rooms,
    },
  });
});

exports.addRoom = catchAsync(async (req, res, next) => {
  const { hotelId } = req.params;
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return next(new AppError(`hotel doesn't exist`, 404));
  }
  if (req.user._id.toString() !== hotel.owner._id.toString()) {
    return next(
      new AppError(`you are not authorized to make this action`, 403)
    );
  }
  req.body.hotel = hotelId;
  const newRoom = await Room.create(req.body);
  // add availability :
  const ParseAvailabilityDates = req.body.availabilityDates.map((date) => {
    return new Date(date);
  });
  const availabilityPromises = ParseAvailabilityDates.map((date) => {
    return Availability.create({
      room: newRoom._id,
      date: date,
      available: true,
    });
  });
  await Promise.all(availabilityPromises);
  res.status(201).json({
    status: 'success',
    data: {
      room: newRoom,
    },
  });
});

exports.deleteRoom = catchAsync(async (req, res, next) => {
  const { roomId } = req.params;
  const { hotelId } = req.params;
  const hotel = await Hotel.findById(hotelId);
  const room = await Room.findById(roomId);
  if (!hotel) {
    return next(new AppError(`hotel not found`, 404));
  }
  if (!room) {
    return next(new AppError(`room not found`, 404));
  }
  console.log(req.user._id.toString(), hotel.owner._id.toString());
  if (req.user._id.toString() !== hotel.owner._id.toString()) {
    return next(
      new AppError(`you are not authorized to make this action`, 403)
    );
  }
  if (room.hotel.toString() !== hotel._id.toString()) {
    return next(
      new AppError(`you are not authorized to make this action`, 403)
    );
  }

  await Availability.deleteMany({ room: roomId });
  await Room.findByIdAndDelete(roomId);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.updateRoom = catchAsync(async (req, res, next) => {
  const { roomId } = req.params;
  const { hotelId } = req.params;
  const hotel = await Hotel.findById(hotelId);
  const room = await Room.findById(roomId);
  if (!hotel) {
    return next(new AppError(`hotel not found`, 404));
  }
  if (!room) {
    return next(new AppError(`room not found`, 404));
  }
  if (req.user._id.toString() !== hotel.owner._id.toString()) {
    return next(
      new AppError(`you are not authorized to make this action`, 403)
    );
    6;
  }
  if (room.hotel.toString() !== hotel._id.toString()) {
    return next(
      new AppError(`you are not authorized to make this action`, 403)
    );
  }
  req.body.hotel = hotelId;
  const updatedRoom = await Room.findByIdAndUpdate(roomId, req.body, {
    new: true,
  });
  res.status(200).json({
    status: 'success',
    data: { room: updatedRoom },
  });
});

exports.getRoom = catchAsync(async (req, res, next) => {
  const { roomId } = req.params;
  const { hotelId } = req.params;
  const hotel = await Hotel.findById(hotelId);
  const room = await Room.findById(roomId);
  if (!hotel) {
    return next(new AppError(`hotel not found`, 404));
  }
  if (!room) {
    return next(new AppError(`No found room with this ID`, 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      room,
    },
  });
});
