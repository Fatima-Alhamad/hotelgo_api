const { Router } = require('express');
const router = Router();
const userControllers = require('../controllers/userControllers');
const authController = require('../controllers/authController');

// IMPLEMENT AUTHENTICATION ROUTES:
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);
// IMPLEMENT ROUTES :

router.patch('/updateMe', authController.protect, userControllers.updateMe);
router.delete('/deleteMe', authController.protect, userControllers.deleteMe);
router.get('/', authController.protect, userControllers.getAllUsers);
router.get(
  '/:id',
  authController.protect,
  authController.restrictTo('admin'),
  userControllers.getUser
);
router.patch(
  '/:id',
  authController.protect,
  authController.restrictTo('admin'),
  userControllers.updateUser
);
router.delete(
  '/:id',
  authController.protect,
  authController.restrictTo('admin'),
  userControllers.deleteUser
);
router.post('/', authController.protect, userControllers.addUser);

module.exports = router;
