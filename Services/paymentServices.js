const Payment = require('../Model/payment');
const errorMessages = require('../config/errors');
const logger = require('../config/winston');
const helpers = require('../lib/utils');

exports.createPayment = async (paymentInfo) => {
  try {
    const payment = await Payment.create(paymentInfo);
    if (!payment) {
      logger.error(`[createPayment service] Payment not created: ${paymentInfo}`);
      return { error: errorMessages.INVALID_PAYMENT };
    }
    const savedPayment = await payment.save();
    if (!savedPayment) {
      logger.error(`[createPayment service] Payment not saved: ${paymentInfo}`);
      return { error: errorMessages.FAILED_TO_SAVE_PAYMENT };
    }
    return payment;
  } catch (error) {
    helpers.handleErrors(res, error);
    return { error: errorMessages.SOME_ERROR };
  }
};

exports.verifyPayment = async (paymentId) => {
  try {
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      logger.error(`[verifyPayment service] Payment not found: ${paymentId}`);
      return { error: errorMessages.PAYMENT_NOT_FOUND };
    }

    if (payment.status !== 'completed') {
      logger.error(`[verifyPayment service] Payment pending: ${paymentId}`);
      return { error: errorMessages.PAYMENT_PENDING };
    }

    return payment.status !== 'completed' ? { success: false } : { success: true };
  } catch (error) {
    helpers.handleErrors(res, error);
    return { error: errorMessages.SOME_ERROR };
  }
};
