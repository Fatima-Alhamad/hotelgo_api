const AppError = require('../utiles/errorApp');
const mongoose = require('mongoose');

const handleErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    err: err,
    message: err.message,
    stack: err.stack,
  });
};
const handleErrorPro = (err, res) => {
  if (err.isOperational) {
   
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log(err);
    res.status(500).json({
      
      status: 'error',
      message: `something went wrong`,
    });
  }
};
const handleCastErrorDB = (err) => {
  message = `Invalid ${err.path}:  ${err.value}}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errorResponse.errmsg.match(/(["'])(?:\\.|[^\\])*?\1/)[0];
  const message = `duplicate field value ${value} .Please use another value`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((ele) => ele.message);
  const message = `invalid data input: ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleJWTError = () =>
  new AppError('invalid token ,please login again', 401);
const handleTokenExpiredError = () =>
  new AppError('your token has expired,please login again', 401);
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'development') {
    handleErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, message: err.message };  //because when destructuring the object the inherited properties will not be included
    if (error.kind === 'ObjectId') error = handleCastErrorDB(error, res);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error, res);
    if (err instanceof mongoose.Error.ValidationError)
      error = handleValidationErrorDB(error, res);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleTokenExpiredError();

    handleErrorPro(error, res);
  }
};
