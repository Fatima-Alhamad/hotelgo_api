const express = require('express');
const app = express();
app.use(express.json({ limit: '10kb' }));
const usersRouter = require('./routes/usersRouter');
const hotelRouter = require('./routes/hotelRouter');
const reviewRouter = require('./routes/reviewRouter');

const AppError = require('./utiles/errorApp');
const errorController = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// set security HTTP headers:
app.use(helmet());
// express rate limit :
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Apply the rate limiter globally
app.use('/api', limiter);

// Protect against NO_SQL injection:
app.use(mongoSanitize());

// Protect against XXS attacks :
app.use(xss());
// Prevent Parameters Pollution:
app.use(hpp({}));
// ROUTERS:
//users:
app.use('/api/v1/users', usersRouter);
//hotels:
app.use('/api/v1/hotels', hotelRouter);
// reviews:
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //     status:'fail',
  //     message:`Can't find ${req.url} on this server`
  // })

  next(new AppError(`Can't find ${req.url} on this server`, 404));
});

app.use(errorController);

module.exports = app;
