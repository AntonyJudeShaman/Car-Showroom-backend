const helpers = require('../lib/utils');
const User = require('../Model/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const errorMessages = require('../config/errors');

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

exports.buyCar = async (user, carId) => {
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

    if (!carData || !carData.car) {
      return { error: errorMessages.INVALID_CAR_DATA };
    }

    if (carData.car.quantity < 1) {
      return { error: errorMessages.CAR_OUT_OF_STOCK };
    }

    if (user.wallet < carData.car.price) {
      return { error: errorMessages.INSUFFICIENT_BALANCE };
    }

    const { quantity, createdAt, updatedAt, ...car } = carData.car;

    const updatedCar = await this.updateCar(carData);
    if (updatedCar.error) {
      return { error: updatedCar.error };
    }

    const invoice = await helpers.generateInvoice(user, carData);

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $push: {
          carCollection: car,
          invoices: invoice,
        },
        $inc: { wallet: -carData.car.price },
      },
      { new: true },
    );

    if (!updatedUser) {
      return { error: errorMessages.FAILED_TO_UPDATE_USER };
    }

    const saved = await invoice.save();

    if (!saved) {
      return { error: errorMessages.FAILED_TO_SAVE_INVOICE };
    }

    return { updatedUser, updatedCar };
  } catch (error) {
    console.error('Error in buyCar:', error);
    return { error: errorMessages.SOME_ERROR };
  }
};

exports.updateCar = async (carData) => {
  if (!carData || !carData.car || !carData.car._id) {
    return { error: errorMessages.INVALID_CAR_DATA };
  }

  const car = carData.car;

  try {
    const response = await fetch(`http://localhost:3000/api/car/update-car/${car._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.JWT_TOKEN}`,
      },
      body: JSON.stringify({ quantity: car.quantity - 1 }),
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
