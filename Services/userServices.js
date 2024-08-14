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

exports.buyCar = async (userId, carId) => {
  if (!userId || !carId) return null;
  console.log(carId);
  const car = await fetch(`http://localhost:3000/api/car/view-car/${carId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YmM0ZDFiMDc3NDc2ZTA5NTMwNjdlYSIsImlhdCI6MTcyMzYxODg4MX0.grv8uwqKnrwHF5JuKUOH1W45rq1e9Ye8J746JqNdySc`,
    },
  });
  const user = await User.findByIdAndUpdate(
    userId,
    { $push: { carCollection: car } },
    { new: true },
  );

  return { user, car };
};

exports.updateCar = async (carId, quantity) => {
  const res = await fetch(`http://localhost:3000/api/car/update-car/${carId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YmM0ZDFiMDc3NDc2ZTA5NTMwNjdlYSIsImlhdCI6MTcyMzYxODg4MX0.grv8uwqKnrwHF5JuKUOH1W45rq1e9Ye8J746JqNdySc`,
    },
    body: JSON.stringify({ quantity: quantity - 1 }),
  });

  return await res.json();
};
