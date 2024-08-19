const bcrypt = require('bcrypt');
const userServices = require('../Services/userServices');
const errorMessages = require('../config/errors');
const Invoice = require('../Model/invoice');
const featureList = require('../config/constants').featureList;
const crypto = require('crypto');
const logger = require('../config/winston');

exports.passwordHasher = async (password) => {
  return await bcrypt.hash(password, 10);
};

exports.handleErrors = (res, err) => {
  logger.error(err);
  return res.status(500).json({ error: err.message });
};

exports.checkAdmin = async (req) => {
  if (!req.headers['authorization']) {
    return { error: errorMessages.UNAUTHORIZED };
  }
  const user = await userServices.checkToken(req);
  if (!user) {
    return { error: errorMessages.UNAUTHORIZED };
  }
  if (user.role !== 'admin') {
    return { error: errorMessages.FORBIDDEN };
  }
  return { user };
};

exports.generateInvoice = async (user, carData) => {
  return new Invoice({
    user: user._id,
    car: carData.car._id,
    name: carData.car.name,
    brand: carData.car.brand,
    basePrice: carData.car.basePrice,
    features: carData.addedFeatures || [],
    totalAmount: carData.totalPrice,
    tax: carData.tax * 100,
    discount: carData.discount,
    remainingBalance: user.wallet - carData.totalPrice,
    date: new Date(),
  });
};

exports.calculateTotalPrice = (basePrice, selectedFeatures, carFeatures, taxRate) => {
  let totalPrice = basePrice;
  const addedFeatures = [];

  selectedFeatures.forEach((featureName) => {
    const carFeature = carFeatures.find((f) => f.name === featureName);
    if (carFeature) {
      const originalFeatures = featureList.find((f) => f.name === featureName);
      if (originalFeatures) {
        totalPrice += originalFeatures.price;
        addedFeatures.push(featureName);
      } else {
        console.log(`${featureName} not found`);
      }
    } else {
      console.log(`${featureName} feature not found`);
    }
  });

  const { discountPrice, discount } = this.getDiscount(totalPrice);

  return { totalPrice: discountPrice + discountPrice * taxRate, addedFeatures, discount };
};

exports.generateTransactionId = (prefix) => {
  const timestamp = Date.now().toString();

  const randomString = crypto.randomBytes(6).toString('hex');

  const transactionId = `${prefix}-${timestamp}-${randomString}`;

  return transactionId;
};

exports.getDiscount = (totalPrice) => {
  const index = Math.floor(Math.random() * 10);

  const discounts = [0, 5, 10, 0, 20, 0, 30, 0, 40, 50];

  return {
    discountPrice: totalPrice - (totalPrice * discounts[index]) / 100,
    discount: discounts[index],
  };
};

exports.generateDateSlotKey = (date, start, end) => {
  return `${date}-${start}-${end}`;
};

exports.checkAppointmentSlot = async (dateKey, Appointment) => {
  // mm-dd-yyyy-hh:00-hh:00
  if (!/^\d{2}\/\d{2}\/\d{4}-\d{2}:00-\d{2}:00$/.test(dateKey)) {
    return { error: errorMessages.INVALID_TIME_FORMAT };
  }

  const [datePart, startTime, endTime] = dateKey.split('-');
  const [start] = startTime.split(':');
  const [end] = endTime.split(':');

  // console.log(datePart, parseInt(start), end);

  if (parseInt(end) - parseInt(start) !== 1) {
    return { error: errorMessages.INVALID_TIME_SLOT_DIFF };
  }

  const prefix = `${datePart}-${startTime}`;
  const existingSlot = await Appointment.findOne({
    $and: [{ dateKey: { $regex: `^${prefix}` } }, { status: { $ne: 'cancelled' } }],
  });

  if (existingSlot) {
    return { error: errorMessages.SLOT_NOT_AVAILABLE };
  }

  return true;
};
