const User = require('../models/userModel');
const catchAsync = require('../utiles/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utiles/errorApp');
const { promisify } = require('util');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIES_JWT_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  user.password = undefined;
  user.active = undefined;
  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const body = req.body;
  const newUser = await User.create({
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    password: body.password,
    confirmPassword: body.confirmPassword,
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // check if email and password are exist :
  if (!email || !password) {
    return next(new AppError('please provide email and password', 400));
  }

  // check if user exist && password is correct :
  const user = await User.findOne({ email }).select('+password');
  let correct;
  if (user) {
    correct = await user.correctPassword(password, user.password);
  }
  if (!user || !correct) {
    const message = 'incorrect email or password';
    return next(new AppError(message, 401));
  }
  //  send token :
  const token = createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // check if token exist and get it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError(`your aren't logged in .Please log in to gain access`, 401)
    );
  }
  //  verify that the token is valid :
  // promisify make the verify function returns promise :
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // check if user still exists:
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('the user belongs to this token is no longer exists', 401)
    );
  }

  // check if the user changed his password after the token was generated
  // if(currentUser)
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('user currently changed his password', 401));
  }

  // Pass the test and gain access
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`you don't have permission`, 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // check if email exists:
  if (!req.body.email) {
    return next(new AppError(`please provide email address`, 401));
  }
  // check if there is user with this email :
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    // return next(new AppError(`user not found`))
    return res.status(200).json({
      status: 'success',
      message: 'token was sent successfully!!',
    });
  }
  // generate random reset token :
  const resetToken = user.generateResetPasswordToken();
  user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    resetPassToken: resetToken,
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // hash the unhashed token :
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  // get user based on token :
  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError(`token is invalid or it has expired`, 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  // update change password property for the user :
  // done in the model

  // log the user in ,send jwt :
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // get the user from the collection
  const user = await User.findById(req.user._id).select('+password');

  // check if posted pass is correct:
  if (!user.correctPassword(req.body.currentPassword, user.password)) {
    next(new AppError(`the password you enter is incorrect`));
  }
  // update password:
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  user.save();

  // log the user in , and send jwt:
  createSendToken(user, 200, res);
});
