const { Router } = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const router = Router({ mergeParams: true });

router.get(
  '/',

  reviewController.getAllReviews
);
router.post(
  '/',
  authController.protect,
  authController.restrictTo('user'),
  reviewController.createReview
);
// router.delete('/:reviewId', reviewController.deleteReview);
// router.patch('/:reviewId', reviewController.updateReview);
// router.delete('/:reviewId', reviewController.deleteReview);
router.patch('/:reviewId', reviewController.createReview);
router.delete('/:reviewId', reviewController.deleteReview);
module.exports = router;
