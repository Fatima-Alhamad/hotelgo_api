const { Router } = require('express');
const roomController = require('../controllers/roomController');
const authController = require('../controllers/authController');
const bookingRouter = require('../routes/bookingRouter');
const router = Router({ mergeParams: true });

router.get('/', roomController.getAllRooms);
router.get('/:roomId', roomController.getRoom);
router.post(
  '/',
  authController.protect,
  authController.restrictTo('host'),
  roomController.addRoom
);
router.delete(
  '/:roomId',
  authController.protect,
  authController.restrictTo('host'),
  roomController.deleteRoom
);
router.patch(
  '/:roomId',
  authController.protect,
  authController.restrictTo('host'),
  roomController.updateRoom
);

// bookings:
router.use('/:roomId/bookings', bookingRouter);
module.exports = router;
