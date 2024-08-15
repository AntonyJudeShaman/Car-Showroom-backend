const helpers = require('../lib/utils');
const User = require('../Model/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const errorMessages = require('../config/errors');
const Payment = require('../Model/payment');
const paymentServices = require('./paymentServices');
const Invoice = require('../Model/invoice');

exports.registerUser = async (username, email, password, address, phone, role) => {
  password = await helpers.passwordHasher(password);
  try {
    const user = new User({
      username,
      email,
      password,
      address,
      phone,
      role,
    });
    await user.save();
    return user;
  } catch (error) {
    if (error.code === 11000) {
      return { status: 400, error: errorMessages.ALREADY_EXISTS };
    }
    helpers.handleErrors(res, error);
  }
};

exports.loginUser = async (credential, password) => {
  const user = await User.findOne({
    $or: [{ username: credential }, { email: credential }],
  });
  if (!user) {
    return { status: 404, error: errorMessages.USER_NOT_FOUND };
  }
  const check = await bcrypt.compare(password, user.password);
  if (!check) {
    return { status: 400, error: errorMessages.INVALID_CREDENTIALS };
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  return { user, token };
};

exports.updateUser = async (userId, updateData) => {
  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });
  return updatedUser;
};

exports.checkToken = async (req) => {
  try {
    let authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    return user || null;
  } catch (err) {
    handleErrors(res, err);
  }
};

exports.getAllUsers = async () => {
  return await User.find();
};

exports.getUserById = async (userId) => {
  return await User.findById(userId);
};

exports.getUserByEmail = async (email) => {
  return await User.findOne({ email });
};

exports.getUserByUsername = async (username) => {
  return await User.findOne({ username });
};

exports.deleteUser = async (userId) => {
  return await User.findByIdAndDelete(userId);
};

exports.searchUser = async (searchQuery) => {
  if (!searchQuery) return { status: 400, error: errorMessages.NO_SEARCH_QUERY };
  return await User.find({
    $or: [
      { username: { $regex: searchQuery, $options: 'i' } },
      { email: { $regex: searchQuery, $options: 'i' } },
      { role: { $regex: searchQuery, $options: 'i' } },
      { address: { $regex: searchQuery, $options: 'i' } },
      {
        $or: [
          { 'carCollection.name': { $regex: searchQuery, $options: 'i' } },
          { 'carCollection.brand': { $regex: searchQuery, $options: 'i' } },
        ],
      },
    ],
  });
};

exports.buyCar = async (user, carId, selectedFeatures = [], paymentDetails) => {
  if (!user._id || !carId) return { error: errorMessages.INVALID_ID };
  try {
    const carResponse = await fetch(`http://localhost:3000/api/car/view-car/${carId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.JWT_TOKEN}`,
      },
    });
    if (!carResponse.ok) {
      return { error: errorMessages.FAILED_TO_FETCH_CAR };
    }
    const carData = await carResponse.json();
    console.log('car found');
    if (!carData || !carData.car) {
      return { error: errorMessages.INVALID_CAR_DATA };
    }
    if (carData.car.stock.quantity < 1 || carData.car.status === 'sold_out') {
      return { error: errorMessages.CAR_OUT_OF_STOCK };
    }

    console.log('car stock available');
    const { totalPrice, addedFeatures, discount } = helpers.calculateTotalPrice(
      carData.car.basePrice,
      selectedFeatures,
      carData.car.features,
      carData.car.tax,
    );

    console.log(
      'total price',
      totalPrice,
      'calculated with discount',
      discount,
      'and features',
      addedFeatures,
      'tax',
      carData.car.tax * 100,
    );
    if (user.wallet < totalPrice) {
      return { error: errorMessages.INSUFFICIENT_BALANCE };
    }

    console.log('user has enough balance');
    const invoice = await helpers.generateInvoice(user, {
      ...carData,
      totalPrice,
      addedFeatures,
      tax: carData.car.tax,
      discount,
    });
    if (!invoice) {
      return { error: errorMessages.FAILED_TO_GENERATE_INVOICE };
    }
    console.log('invoice generated');

    const savedPayment = await this.processPayment({
      user: user._id,
      car: carId,
      invoice: invoice._id,
      paymentMethod: paymentDetails.method,
      amount: totalPrice,
      status: 'completed',
      transactionId: paymentDetails.transactionId,
    });
    if (savedPayment.error) {
      return { error: savedPayment.error };
    }

    console.log('payment processed');
    const savedInvoice = await invoice.save();
    if (!savedInvoice) {
      await Payment.findByIdAndRemove(savedPayment._id);
      return { error: errorMessages.FAILED_TO_SAVE_INVOICE };
    }

    const verifyPayment = await this.verifyPayment(savedPayment._id);

    if (verifyPayment.error) {
      await Invoice.findByIdAndRemove(savedInvoice._id);
      await Payment.findByIdAndRemove(savedPayment._id);
      return { error: verifyPayment.error };
    }

    if (verifyPayment.success) {
      console.log('Payment verified successfully');
    }

    const updatedCar = await this.updateCar(carData);
    if (updatedCar.error) {
      await Invoice.findByIdAndRemove(savedInvoice._id);
      await Payment.findByIdAndRemove(savedPayment._id);
      return { error: updatedCar.error };
    }

    console.log('car quantity updated');
    const { stock, createdAt, updatedAt, ...carToBeAdded } = carData.car;
    carToBeAdded.features = addedFeatures;
    carToBeAdded.totalPrice = totalPrice;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $push: {
          carCollection: carToBeAdded,
          invoices: savedInvoice,
        },
        $set: { wallet: user.wallet - totalPrice, updatedAt: new Date() },
      },
      { new: true },
    );
    if (!updatedUser) {
      await Invoice.findByIdAndRemove(savedInvoice._id);
      await Payment.findByIdAndRemove(savedPayment._id);
      await this.updateCar({ ...carData, reverse: true });
      return { error: errorMessages.FAILED_TO_UPDATE_USER };
    }

    console.log('car added to collection');
    // console.log('savedInvoice:', savedInvoice);
    // console.log('savedPayment:', savedPayment);

    return {
      updatedUser,
      updatedCar,
      invoice: savedInvoice,
      payment: savedPayment,
    };
  } catch (error) {
    return { error: errorMessages.SOME_ERROR };
  }
};

exports.updateCar = async (carData) => {
  if (!carData || !carData.car || !carData.car._id) {
    return { error: errorMessages.INVALID_CAR_DATA };
  }

  const car = carData.car;

  const quantity = carData?.reverse ? 1 : -1;

  try {
    const response = await fetch(`http://localhost:3000/api/car/update-car/${car._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.JWT_TOKEN}`,
      },
      body: JSON.stringify({
        'stock.quantity': car.stock.quantity + quantity,
        status: car.stock.quantity - quantity === 0 ? 'sold_out' : 'available',
      }),
    });

    if (!response.ok) {
      return { error: errorMessages.CAR_NOT_UPDATED };
    }

    const updatedCar = await response.json();

    if (!updatedCar) {
      return { error: errorMessages.CAR_NOT_UPDATED };
    }

    return updatedCar;
  } catch (error) {
    return { error: errorMessages.CAR_NOT_UPDATED };
  }
};

exports.getCarCollection = async (userId) => {
  if (!userId) return { error: errorMessages.INVALID_ID };

  const user = await User.findById(userId).select('carCollection');

  if (!user) return { error: errorMessages.USER_NOT_FOUND };

  return user;
};

exports.processPayment = async (paymentInfo) => {
  const savedPayment = await fetch('http://localhost:3000/api/payment/create-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.JWT_TOKEN}`,
    },
    body: JSON.stringify(paymentInfo),
  });

  return savedPayment.json();
};

exports.verifyPayment = async (paymentId) => {
  const payment = await fetch('http://localhost:3000/api/payment/verify-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.JWT_TOKEN}`,
    },
    body: JSON.stringify({ id: paymentId }),
  });

  return payment.json();
};
