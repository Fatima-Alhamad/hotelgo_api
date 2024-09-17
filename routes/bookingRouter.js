const { Router } = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');
const router = Router({ mergeParams: true });
// routes:
router.get(
  '/',
  authController.protect,
  authController.restrictTo('admin'),
  bookingController.getAllBookingsAdmin
);
router.get(
  '/:hotelId',
  authController.protect,
  authController.restrictTo('admin', 'host'),
  bookingController.getAllBookingsOwner
);

router.post('/', authController.protect, bookingController.bookRoom);

module.exports = router;
