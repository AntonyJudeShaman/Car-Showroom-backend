const { validationResult } = require('express-validator');
const helpers = require('../lib/utils');
const carServices = require('../Services/carServices');
const errorMessages = require('../config/errors');

exports.createCar = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errorMessages.DATA_NOT_VALID, details: errors.array() });
  }
  try {
    const isAdmin = await helpers.checkAdmin(req);
    if (!isAdmin) {
      res.status(403).json({ error: errorMessages.FORBIDDEN });
    }
    const carExists = await carServices.getCarByName(req.body.name);
    if (carExists) {
      res.status(400).json({ error: errorMessages.CAR_ALREADY_EXISTS });
    }
    const car = await carServices.createCar(req.body);
    if (!car) {
      res.status(400).json({ error: errorMessages.CAR_NOT_CREATED });
    }
    const notification = await fetch('http://localhost:3000/api/user/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.JWT_TOKEN}`,
      },
      body: JSON.stringify({ car }),
    });

    if (!notification.ok) {
      console.log(notification);
      console.log('Notification not sent');
    }

    if (notification.error) {
      res.status(400).json({ error: errorMessages.error });
    }

    res.status(201).json({ car });
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.getAllCars = async (req, res) => {
  try {
    const cars = await carServices.getAllCars();
    res.status(200).json({ cars });
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.getCar = async (req, res) => {
  try {
    if (!req.params.id || req.params.id.length !== 24) {
      res.status(400).json({ error: errorMessages.INVALID_ID });
    }
    const car = await carServices.getCarById(req.params.id);
    if (!car) {
      res.status(404).json({ error: errorMessages.CAR_NOT_FOUND });
    }
    res.status(200).json({ car });
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.updateCar = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errorMessages.DATA_NOT_VALID, details: errors.array() });
  }
  if (!req.params.id || req.params.id.length !== 24) {
    res.status(400).json({ error: errorMessages.INVALID_ID });
  }
  try {
    const isAdmin = await helpers.checkAdmin(req);
    if (!isAdmin) {
      res.status(403).json({ error: errorMessages.FORBIDDEN });
    }
    const car = await carServices.getCarById(req.params.id);
    if (!car) {
      res.status(404).json({ error: errorMessages.CAR_NOT_FOUND });
    }
    const updatedCar = await carServices.updateCar(req.params.id, req.body);
    if (!updatedCar) {
      res.status(400).json({ error: errorMessages.CAR_NOT_UPDATED });
    }
    res.status(200).json({ car: updatedCar });
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json({ error: errorMessages.DATA_NOT_VALID });
    }
    helpers.handleErrors(res, err);
  }
};
