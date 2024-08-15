const router = require('express').Router();

const paymentController = require('../Controllers/paymentController');

router.post('/create-payment', paymentController.createPayment);

router.post('/verify-payment', paymentController.verifyPayment);

module.exports = router;
