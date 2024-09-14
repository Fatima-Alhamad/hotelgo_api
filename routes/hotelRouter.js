const { Router } = require('express');
const hotelController = require('../controllers/HotelController');
const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRouter');

const router = Router();

// routes:
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
  authController.restrictTo('admin', 'host')
);

// reviews :

router.use(':hotelId/reviews', reviewRouter);

module.exports = router;
