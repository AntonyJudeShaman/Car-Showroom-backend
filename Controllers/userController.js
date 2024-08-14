const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const helpers = require('../lib/utils');
const userServices = require('../Services/userServices');
const errorMessages = require('../config/errors');

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errorMessages.DATA_NOT_VALID, details: errors.array() });
  }
  try {
    const { username, email, password, address, phone, role } = req.body;

    const userExists =
      (await userServices.getUserByEmail(email)) ||
      (await userServices.getUserByUsername(username));

    if (userExists) {
      return res.status(400).json({ error: errorMessages.ALREADY_EXISTS });
    }

    const user = await userServices.registerUser(username, email, password, address, phone, role);
    if (!user) {
      return res.status(400).json({ error: errorMessages.USER_NOT_CREATED });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({ user, token });
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errorMessages.DATA_NOT_VALID, details: errors.array() });
  }
  try {
    const { credential, password } = req.body;
    const login = await userServices.loginUser(credential, password);
    if (login.error) {
      return res.status(401).json({ error: login.error });
    }
    const { user, token } = login;
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ user, token });
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.updateUser = async (req, res) => {
  if (!req.params.id) return res.status(400).json({ error: errorMessages.INVALID_ID });
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errorMessages.DATA_NOT_VALID, details: errors.array() });
  }
  try {
    const { username, password, role, ...updateData } = req.body;
    if (username || password || role) {
      return res.status(400).json({ error: errorMessages.CANNOT_CHANGE_CREDENTIALS });
    }

    const updatedUser = await userServices.updateUser(req.params.id, updateData);
    if (!updatedUser) return res.status(404).json({ error: errorMessages.USER_NOT_FOUND });
    res.status(200).json({ message: errorMessages.USER_UPDATED, user: updatedUser });
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.viewAllUser = async (req, res) => {
  try {
    const user = await userServices.checkToken(req);
    if (!user) {
      return res.status(401).json({ error: errorMessages.UNAUTHORIZED });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ error: errorMessages.FORBIDDEN });
    }
    const users = await userServices.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.checkToken = async (req, res) => {
  try {
    const user = await userServices.checkToken(req);
    if (!user) return res.status(401).json({ error: errorMessages.UNAUTHORIZED });
    res.status(200).json(user);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.viewUser = async (req, res) => {
  try {
    if (!req.params.id || req.params.id.length !== 24) {
      return res.status(400).json({ error: errorMessages.INVALID_ID });
    }
    const user = await userServices.checkToken(req);
    if (!user) {
      return res.status(401).json({ error: errorMessages.UNAUTHORIZED });
    }
    const viewedUser = await userServices.getUserById(req.params.id);
    if (!viewedUser) return res.status(404).json({ error: errorMessages.USER_NOT_FOUND });
    res.status(200).json(viewedUser);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).json({ error: errorMessages.INVALID_ID });
    const user = await userServices.checkToken(req);
    if (!user) {
      return res.status(401).json({ error: errorMessages.UNAUTHORIZED });
    }
    const deletedUser = await userServices.deleteUser(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: errorMessages.USER_NOT_FOUND });
    res.status(200).json({ message: errorMessages.USER_DELETED });
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.logout = async (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: errorMessages.LOGGED_OUT });
};

exports.searchUser = async (req, res) => {
  try {
    if (!req.query.q) return res.status(400).json({ error: errorMessages.NO_SEARCH_QUERY });
    const user = await userServices.checkToken(req);
    if (!user) {
      return res.status(401).json({ error: errorMessages.UNAUTHORIZED });
    }
    const users = await userServices.searchUser(req.query.q);
    if (!users.length) return res.status(404).json({ error: errorMessages.NO_RESULTS });
    res.status(200).json(users);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.buyCar = async (req, res) => {
  try {
    const carId = req.body.id;
    const user = await userServices.checkToken(req);

    if (!user) {
      return res.status(401).json({ error: errorMessages.UNAUTHORIZED });
    }

    const result = await userServices.buyCar(user, carId);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    if (!result) {
      return res.status(404).json({ error: errorMessages.CAR_NOT_FOUND });
    }

    const { updatedUser, updatedCar } = result;

    res.status(200).json({ user: updatedUser, car: updatedCar.car });
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.viewCarCollection = async (req, res) => {
  try {
    const id = req.query.id;
    // const user = await userServices.checkToken(req);
    // if (!user) {
    //   return res.status(401).json({ error: errorMessages.UNAUTHORIZED });
    // }
    const collection = await userServices.getCarCollection(id);
    if (collection.error) {
      return res.status(400).json({ error: collection.error });
    }
    res.status(200).json(collection.carCollection);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};
