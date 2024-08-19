const paymentServices = require('../Services/paymentServices');
const helpers = require('../lib/utils');
const logger = require('../config/winston');

exports.createPayment = async (req, res) => {
  try {
    console.log('Payment process started');
    const payment = await paymentServices.createPayment(req.body);
    if (payment.error) {
      logger.error(`[createPayment controller] Payment not created: ${req.body}`);
      return res.status(400).json({ error: payment.error });
    }
    return res.status(201).json(payment);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    console.log('Payment verification started');
    const payment = await paymentServices.verifyPayment(req.body.id);
    if (payment.error) {
      logger.error(`[verifyPayment controller] Payment not verified: ${req.body.id}`);
      return res.status(400).json({ error: payment.error });
    }
    return res.status(200).json(payment);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};
