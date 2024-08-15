const bcrypt = require('bcrypt');
const userServices = require('../Services/userServices');
const errorMessages = require('../config/errors');
const Invoice = require('../Model/invoice');
const featureList = require('../config/constants').featureList;
const crypto = require('crypto');

exports.passwordHasher = async (password) => {
  return await bcrypt.hash(password, 10);
};

exports.handleErrors = (res, err) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
};

exports.checkAdmin = async (req) => {
  if (!req.headers['authorization'])
    return res.status(401).json({ error: errorMessages.UNAUTHORIZED });
  const user = await userServices.checkToken(req);
  if (!user) {
    return { status: 401, error: errorMessages.UNAUTHORIZED };
  }
  if (user.role !== 'admin') {
    return { status: 403, error: errorMessages.FORBIDDEN };
  }
  return { status: 200, user };
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
    tax: carData.tax * 100 + '%',
    discount: carData.discount,
    remainingBalance: user.wallet - carData.totalPrice,
    date: new Date(),
  });
};

exports.calculateTotalPrice = (basePrice, selectedFeatures, carFeatures, taxRate) => {
  let totalPrice = basePrice;
  let addedFeatures = [];

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
