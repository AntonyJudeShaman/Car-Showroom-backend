const bcrypt = require('bcrypt');
const userServices = require('../Services/userServices');
const errorMessages = require('../config/errors');
const Invoice = require('../Model/invoice');
const featureList = require('../config/constants').featureList;
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
        console.log(`${featureName} price not found`);
      }
    } else {
      console.log(`${featureName} feature not found`);
    }
  });

  const tax = totalPrice * taxRate;
  console.log(totalPrice, tax);

  return { totalPrice: totalPrice + tax, addedFeatures };
};
