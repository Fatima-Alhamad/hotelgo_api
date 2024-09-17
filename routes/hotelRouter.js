const { Router } = require('express');
const hotelController = require('../controllers/HotelController');
const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRouter');
const roomRouter = require('../routes/roomRouter');

const router = Router();
// routes:

//hotels:
router.get('/', hotelController.getAllHotels);
router.get('/:hotelId', hotelController.getHotel);
router.post(
  '/',
  authController.protect,
  authController.restrictTo('admin', 'host'),
  hotelController.addHotel
);
router.delete(
  '/:hotelId',
  authController.protect,
  authController.restrictTo('admin', 'host'),
  hotelController.deleteHotel
);

router.patch(
  '/:hotelId',
  authController.protect,
  authController.restrictTo('host'),
  hotelController.UpdateHotel
);
// reviews :
router.use('/:hotelId/reviews', reviewRouter);

// rooms:
router.use('/:hotelId/rooms', roomRouter);

module.exports = router;
