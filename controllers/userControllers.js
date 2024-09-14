const User = require('../models/userModel');
const APIFeatures = require('../utiles/APIFeatures');
const catchAsync = require('../utiles/catchAsync');
const ErrorApp = require('../utiles/errorApp');

const filterObject = (obj, ...allowedFields) => {
  const newObject = {};
  Object.keys(obj).forEach((ele) => {
    if (allowedFields.includes(ele)) {
      newObject[ele] = obj[ele];
    }
  });

  return newObject;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitingFields()
    .paginate();
  const users = await features.query;

  res.status(200).json({
    status: 'success',
    result: users.length,
    users,
  });
});
exports.getUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);
  if (user) {
    res.status(200).json({
      status: 'success',
      user,
    });
  } else {
    res.status(404).json({
      status: 'fail',
      message: 'user not found',
    });
  }
});

exports.addUser = catchAsync(async (req, res, next) => {
  body = req.body;
  const newUser = new User(body);
  await newUser.save();
  // or:
  // const newUser=await User.create(body)
  res.status(201).json({
    status: 'success',
    newUser,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const updatedUser = await User.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(201).json({
    status: 'success',
    updatedUser,
  });
});
exports.deleteUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  await User.findByIdAndDelete(id);
  res.status(200).json({
    status: 'success',
    message: 'user was deleted',
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // get the user:
  const user = await User.findById(req.user._id);

  // check that the body didn't contain password:
  if (req.body.password) {
    return next(new ErrorApp(`this route isn't for updating password`, 400));
  }
  // filter the data the user send:
  const filteredData = filterObject(req.body, 'firstName', 'lastName', 'email');
  // update the user:
  const updatedUser = await User.findByIdAndUpdate(user._id, filteredData, {
    new: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'your data was updated',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).send({
    status: 'success',
    data: null,
  });
});
