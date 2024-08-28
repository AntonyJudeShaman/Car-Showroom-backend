const router = require('express').Router();
const userController = require('../Controllers/userController');
const {
  userUpdateValidations,
  userRegisterValidations,
  userLoginValidations,
  resetPasswordValidations,
} = require('../Validators/userValidator');

router.post('/register', userRegisterValidations, userController.register);
router.post('/login', userLoginValidations, userController.login);
router.get('/view-all-users', userController.viewAllUser);
router.get('/view-user/:id', userController.viewUser);
router.delete('/delete-user/:id', userController.deleteUser);
router.put('/update-user', userUpdateValidations, userController.updateUser);
router.post('/verify-user', userController.checkToken);
router.post('/logout', userController.logout);
router.get('/search-user', userController.searchUser);

router.post('/buy-car', userController.buyCar);

router.get('/view-car-collection', userController.viewCarCollection);

router.get('/subscribe', userController.subscribe);

router.get('/unsubscribe', userController.unsubscribe);

router.post('/send-notification', userController.sendNotification);

router.post('/forgot-password', userController.forgotPassword);

router.post('/reset-password', resetPasswordValidations, userController.resetPassword);

router.get('/get-new-access-token', userController.getNewAccessToken);

router.put('/change-password', userController.changePassword);

router.get('/ping', (req, res) => {
  res.json('I am user route');
});

module.exports = router;
