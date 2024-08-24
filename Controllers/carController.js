const { validationResult } = require('express-validator');
const helpers = require('../lib/utils');
const carServices = require('../Services/carServices');
const errorMessages = require('../config/errors');
const logger = require('../config/winston');

exports.createCar = async (req, res) => {
  const errors = validationResult(req);
  const token = req.headers.authorization.split(' ')[1];
  if (!errors.isEmpty()) {
    logger.error(`[createCar controller] Data not valid: ${errors.array()}`);
    return res.status(400).json({ error: errorMessages.DATA_NOT_VALID, details: errors.array() });
  }
  try {
    const admin = await helpers.checkAdmin(req);
    if (admin.error) {
      logger.error('[createCar controller] User is not an admin');
      return res.status(403).json({ error: errorMessages.FORBIDDEN });
    }
    const carExists = await carServices.getCarByName(req.body.name);
    if (carExists) {
      logger.error(`[createCar controller] Car already exists: ${req.body.name}`);
      return res.status(400).json({ error: errorMessages.CAR_ALREADY_EXISTS });
    }
    const car = await carServices.createCar(req.body);
    if (!car || car.error) {
      logger.error(`[createCar controller] Car not created: ${req.body}`);
      return res.status(400).json({ error: errorMessages.CAR_NOT_CREATED });
    }
    const notification = await fetch('http://localhost:3000/api/user/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ car }),
    });

    if (notification.error) {
      logger.error('[createCar controller] Notification not sent');
      return res.status(400).json({ error: errorMessages.error });
    }

    logger.info(`[createCar controller] Car created: ${car.name} and notification sent`);

    return res.status(201).json({ car, sent: !notification.error ? true : false });
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.getAllCars = async (req, res) => {
  try {
    const cars = await carServices.getAllCars();
    if (!cars) {
      logger.error('[getAllCars controller] No cars found');
      return res.status(404).json({ error: errorMessages.CARS_NOT_FOUND });
    }
    return res.status(200).json({ cars });
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.getCar = async (req, res) => {
  try {
    if (!req.params.id || req.params.id.length !== 24) {
      logger.error(`[getCar controller] Invalid ID: ${req.params.id}`);
      return res.status(400).json({ error: errorMessages.INVALID_ID });
    }
    const car = await carServices.getCarById(req.params.id);
    if (!car) {
      logger.error(`[getCar controller] Car not found: ${req.params.id}`);
      return res.status(404).json({ error: errorMessages.CAR_NOT_FOUND });
    }
    return res.status(200).json({ car });
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.updateCar = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(`[updateCar controller] Data not valid: ${errors.array()}`);
    return res.status(400).json({ error: errorMessages.DATA_NOT_VALID, details: errors.array() });
  }
  if (!req.params.id || req.params.id.length !== 24) {
    logger.error(`[updateCar controller] Invalid ID: ${req.params.id}`);
    return res.status(400).json({ error: errorMessages.INVALID_ID });
  }
  try {
    const isAdmin = await helpers.checkAdmin(req);
    if (!isAdmin) {
      logger.error('[updateCar controller] User is not an admin');
      return res.status(403).json({ error: errorMessages.FORBIDDEN });
    }
    const car = await carServices.getCarById(req.params.id);
    if (!car) {
      logger.error(`[updateCar controller] Car not found: ${req.params.id}`);
      return res.status(404).json({ error: errorMessages.CAR_NOT_FOUND });
    }
    const updatedCar = await carServices.updateCar(req.params.id, req.body);
    if (!updatedCar) {
      logger.error(`[updateCar controller] Car not updated: ${req.params.id}`);
      return res.status(400).json({ error: errorMessages.CAR_NOT_UPDATED });
    }
    return res.status(200).json({ car: updatedCar });
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};
