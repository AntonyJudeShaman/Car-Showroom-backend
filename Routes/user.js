const router = require('express').Router();
const userController = require('../Controllers/userController');
const {
  userUpdateValidations,
  userRegisterValidations,
  userLoginValidations,
} = require('../Validators/userValidator');

router.post('/register', userRegisterValidations, userController.register);
router.post('/login', userLoginValidations, userController.login);
router.get('/view-all-users', userController.viewAllUser);
router.get('/view-user/:id', userController.viewUser);
router.delete('/delete-user/:id', userController.deleteUser);
router.put('/update-user/:id', userUpdateValidations, userController.updateUser);
router.post('/verify-user', userController.checkToken);
router.post('/logout', userController.logout);
router.get('/search-user', userController.searchUser);

router.post('/buy-car', userController.buyCar);

router.get('/view-car-collection', userController.viewCarCollection);

router.get('/create-appointment', userController.createAppointment);

router.get('/subscribe', userController.subscribe);

router.get('/unsubscribe', userController.unsubscribe);

router.post('/send-notification', userController.sendNotification);

module.exports = router;
