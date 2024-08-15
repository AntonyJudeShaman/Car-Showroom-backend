const Payment = require('../Model/payment');
const errorMessages = require('../config/errors');

exports.createPayment = async (paymentInfo) => {
  try {
    const payment = await Payment.create(paymentInfo);
    if (!payment) {
      return { error: errorMessages.INVALID_PAYMENT };
    }
    const savedPayment = await payment.save();
    if (!savedPayment) {
      return { error: errorMessages.FAILED_TO_SAVE_PAYMENT };
    }
    return payment;
  } catch {
    return { error: errorMessages.SOME_ERROR };
  }
};

exports.verifyPayment = async (paymentId) => {
  try {
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return { error: errorMessages.PAYMENT_NOT_FOUND };
    }

    if (payment.status !== 'completed') {
      return { error: errorMessages.PAYMENT_PENDING };
    }

    return payment.status !== 'completed' ? { success: false } : { success: true };
  } catch {
    return { error: errorMessages.SOME_ERROR };
  }
};
