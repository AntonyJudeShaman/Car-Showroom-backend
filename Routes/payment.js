const router = require('express').Router();

const paymentController = require('../Controllers/paymentController');

router.post('/create-payment', paymentController.createPayment);

router.post('/verify-payment', paymentController.verifyPayment);

router.get('/ping', (req, res) => {
  res.json('I am payment route');
});

module.exports = router;
