const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const helpers = require('../lib/utils');
const userServices = require('../Services/userServices');
const errorMessages = require('../config/errors');
const logger = require('../config/winston');
const BookedCars = require('../Model/bookedCars');
const mongoose = require('mongoose');

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error('[register controller] Data not valid', errors.array());
    return res.status(400).json({ error: errorMessages.DATA_NOT_VALID, details: errors.array() });
  }
  try {
    const { username, email, password, address, phone, role } = req.body;

    const userExists =
      (await userServices.getUserByEmail(email)) ||
      (await userServices.getUserByUsername(username));

    if (userExists) {
      logger.error(`[register controller] User already exists: ${username} ${email}`);
      return res.status(400).json({ error: errorMessages.ALREADY_EXISTS });
    }

    const user = await userServices.registerUser(username, email, password, address, phone, role);
    if (user.error) {
      logger.error('[register controller] User not created', user.error);
      return res.status(400).json({ error: errorMessages.USER_NOT_CREATED });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    logger.info(`[register controller] User created: ${username} ${email}`);
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    return res.status(201).json({ user, token });
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error('[login controller] Data not valid', errors.array());
    return res.status(400).json({ error: errorMessages.DATA_NOT_VALID, details: errors.array() });
  }
  try {
    const { credential, password } = req.body;
    const login = await userServices.loginUser(credential, password);
    if (login.error) {
      return res.status(404).json({ error: login.error });
    }
    const { user, token } = login;
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ user, token });
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.updateUser = async (req, res) => {
  // if (!req.params.id) return res.status(400).json({ error: errorMessages.INVALID_ID });
  const user = await userServices.checkToken(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error('[updateUser controller] Data not valid', errors.array());
    return res.status(400).json({ error: errorMessages.DATA_NOT_VALID, details: errors.array() });
  }
  try {
    const { username, password, role, carCollection, ...updateData } = req.body;
    if (username || password || role) {
      logger.error('[updateUser controller] Cannot change credentials restricted values');
      return res.status(400).json({ error: errorMessages.CANNOT_CHANGE_CREDENTIALS });
    }

    const updatedUser = await userServices.updateUser(user._id, updateData);
    if (updatedUser.error) {
      logger.error(
        `[updateUser controller] User not updated: ${user._id}, Error: ${updatedUser.error}`,
      );
      console.log(
        `[updateUser controller] User not updated: ${user._id}, Error: ${updatedUser.error}`,
      );
      return res.status(400).json({ error: updatedUser.error });
    }
    return res.status(200).json({ user: updatedUser });
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.viewAllUser = async (req, res) => {
  try {
    const user = await userServices.checkToken(req);
    if (!user) {
      logger.error('[viewAllUser controller] Unauthorized');
      return res.status(401).json({ error: errorMessages.UNAUTHORIZED });
    }
    if (user.role !== 'admin') {
      logger.error('[viewAllUser controller] Forbidden');
      return res.status(403).json({ error: errorMessages.FORBIDDEN });
    }
    const users = await userServices.getAllUsers();
    return res.status(200).json(users);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.checkToken = async (req, res) => {
  try {
    const user = await userServices.checkToken(req);
    if (user.error) {
      return res.status(401).json({ error: errorMessages.TOKEN_NOT_VALID });
    }
    if (!user) {
      logger.error('[checkToken controller] Unauthorized');
      return res.status(401).json({ error: errorMessages.UNAUTHORIZED });
    }
    return res.status(200).json(user);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.viewUser = async (req, res) => {
  try {
    if (!req.params.id || req.params.id.length !== 24) {
      logger.error(`[viewUser controller] Invalid id: ${req.params.id}`);
      return res.status(400).json({ error: errorMessages.INVALID_ID });
    }
    const user = await userServices.checkToken(req);
    if (!user) {
      logger.error('[viewUser controller] Unauthorized');
      return res.status(401).json({ error: errorMessages.UNAUTHORIZED });
    }
    const viewedUser = await userServices.getUserById(req.params.id);
    if (!viewedUser) {
      logger.error(`[viewUser controller] User not found: ${req.params.id}`);
      return res.status(404).json({ error: errorMessages.USER_NOT_FOUND });
    }
    return res.status(200).json(viewedUser);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (!req.params.id || req.params.id.length !== 24) {
      logger.error(`[deleteUser controller] Invalid id: ${req.params.id}`);
      return res.status(400).json({ error: errorMessages.INVALID_ID });
    }
    const user = await userServices.checkToken(req);
    if (!user) {
      logger.error('[deleteUser controller] Unauthorized');
      return res.status(401).json({ error: errorMessages.UNAUTHORIZED });
    }

    console.log('User role:', user.role, 'User id:', user._id, 'Request id:', req.params.id);

    const userToDelete = await userServices.getUserById(req.params.id);

    if (!userToDelete) {
      logger.error(`[deleteUser controller] User not found: ${req.params.id}`);
      return res.status(404).json({ error: errorMessages.USER_NOT_FOUND });
    }

    if (user.role !== 'admin' && user._id.toString() !== req.params.id) {
      logger.error('[deleteUser controller] Forbidden. Cannot delete another user');
      return res
        .status(403)
        .json({ error: errorMessages.FORBIDDEN + '. Cannot delete another user' });
    }

    const deletedUser = await userServices.deleteUser(req.params.id);
    if (!deletedUser) {
      logger.error(`[deleteUser controller] User not deleted: ${req.params.id}`);
      return res.status(404).json({ error: errorMessages.USER_NOT_DELETED });
    }
    logger.info(
      `[deleteUser controller] User deleted: ${req.params.id} - ${deletedUser.email} - ${deletedUser.username}`,
    );
    return res.status(200).json({ message: errorMessages.USER_DELETED });
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.logout = async (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ message: errorMessages.LOGGED_OUT });
};

exports.searchUser = async (req, res) => {
  try {
    if (!req.query.q) {
      logger.error('[searchUser controller] No search query');
      return res.status(400).json({ error: errorMessages.NO_SEARCH_QUERY });
    }
    const user = await userServices.checkToken(req);
    if (!user) {
      logger.error('[searchUser controller] Unauthorized');
      return res.status(401).json({ error: errorMessages.UNAUTHORIZED });
    }
    const users = await userServices.searchUser(req.query.q);
    if (!users.length || !users) {
      logger.error('[searchUser controller] No search results');
      return res.status(404).json({ error: errorMessages.NO_RESULTS });
    }
    return res.status(200).json(users);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.buyCar = async (req, res) => {
  try {
    const carId = req.body.id;
    const selectedFeatures = req.body.features || [];
    const paymentDetails = req.body.paymentDetails;
    const user = await userServices.checkToken(req);

    console.log(
      'User:',
      user,
      'Car id:',
      carId,
      'Selected features:',
      selectedFeatures,
      'Payment details:',
      paymentDetails,
    );

    console.log('Buying process started');

    paymentDetails.transactionId = helpers.generateTransactionId('AJS');

    console.log('Transaction id generated');

    if (!user) {
      logger.error('[buyCar controller] Unauthorized');
      return res.status(401).json({ error: errorMessages.UNAUTHORIZED });
    }

    if (!paymentDetails || !paymentDetails.method || !paymentDetails.transactionId) {
      logger.error('[buyCar controller] Missing payment details');
      return res.status(400).json({ error: errorMessages.MISSING_PAYMENT_DETAILS });
    }

    const result = await userServices.buyCar(user, carId, selectedFeatures, paymentDetails);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    if (!result) {
      logger.error('[buyCar controller] Car not found');
      return res.status(404).json({ error: errorMessages.CAR_NOT_FOUND });
    }

    const { updatedUser, updatedCar, invoice, payment } = result;

    const updateBookedCars = new BookedCars({
      carId: updatedCar.car._id,
      carName: updatedCar.car.name,
      carPrice: invoice.totalAmount,
      userId: user._id,
    });

    if (!updateBookedCars) {
      logger.error('[buyCar controller] Car booking record not created');
    }

    updateBookedCars.save();

    console.log('Car booking record created');

    return res.status(200).json({
      user: updatedUser,
      car: updatedCar.car,
      totalPrice: invoice.totalAmount,
      invoice,
      payment,
    });
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.viewCarCollection = async (req, res) => {
  try {
    const id = req.query.id;
    if (!id || id.length !== 24) {
      logger.error(`[viewCarCollection controller] Invalid id: ${id}`);
      return res.status(400).json({ error: errorMessages.INVALID_ID });
    }
    // const user = await userServices.checkToken(req);
    // if (!user) {
    //   return res.status(401).json({ error: errorMessages.UNAUTHORIZED });
    // }
    const collection = await userServices.getCarCollection(id);
    if (collection.error) {
      return res.status(400).json({ error: collection.error });
    }
    return res.status(200).json(collection.carCollection);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const user = await userServices.checkToken(req);
    if (!user) {
      logger.error('[createAppointment controller] Unauthorized');
      return res.status(401).json({ error: errorMessages.UNAUTHORIZED });
    }
    const appointment = await userServices.createAppointment(req.body, user);
    if (appointment.error) {
      return res.status(400).json({ error: appointment.error });
    }
    return res.status(201).json(appointment);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.subscribe = async (req, res) => {
  try {
    const user = await userServices.checkToken(req);
    if (!user) {
      logger.error('[subscribe controller] Unauthorized');
      return res.status(401).json({ error: errorMessages.UNAUTHORIZED });
    }
    const subscribe = await userServices.subscribe(user._id);
    if (subscribe.error) {
      return res.status(400).json({ error: subscribe.error });
    }
    return res.status(200).json(subscribe);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.unsubscribe = async (req, res) => {
  try {
    const user = await userServices.checkToken(req);
    if (!user) return res.status(401).json({ error: errorMessages.UNAUTHORIZED });
    const unsubscribe = await userServices.unsubscribe(user._id);
    if (unsubscribe.error) {
      return res.status(400).json({ error: unsubscribe.error });
    }
    return res.status(200).json(unsubscribe);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.sendNotification = async (req, res) => {
  try {
    const notification = await userServices.sendNotification(req.body.car);
    if (notification.error) {
      return { error: notification.error };
    }
    return res.status(200).json('Notification sent successfully');
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};
