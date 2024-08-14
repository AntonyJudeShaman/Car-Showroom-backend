const { validationResult } = require('express-validator');
const helpers = require('../lib/utils');
const carServices = require('../Services/carServices');
const errorMessages = require('../config/errors');

exports.createCar = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errorMessages.DATA_NOT_VALID, details: errors.array() });
  }
  try {
    const { name, brand, price, color, fuel, engine, tyres, bodyType, quantity } = req.body;
    const isAdmin = await helpers.checkAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: errorMessages.FORBIDDEN });
    }
    const carExists = await carServices.getCarByName(name);
    if (carExists) {
      return res.status(400).json({ error: errorMessages.CAR_ALREADY_EXISTS });
    }
    const car = await carServices.createCar(
      name,
      brand,
      price,
      color,
      fuel,
      engine,
      tyres,
      bodyType,
      quantity,
    );
    if (!car) {
      return res.status(400).json({ error: errorMessages.CAR_NOT_CREATED });
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
      return res.status(400).json({ error: errorMessages.INVALID_ID });
    }
    const car = await carServices.getCarById(req.params.id);
    if (!car) {
      return res.status(404).json({ error: errorMessages.CAR_NOT_FOUND });
    }
    res.status(200).json({ car });
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.updateCar = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errorMessages.DATA_NOT_VALID, details: errors.array() });
  }
  if (!req.params.id || req.params.id.length !== 24) {
    return res.status(400).json({ error: errorMessages.INVALID_ID });
  }
  try {
    const isAdmin = await helpers.checkAdmin(req);
    if (!isAdmin) {
      return res.status(403).json({ error: errorMessages.FORBIDDEN });
    }
    const car = await carServices.getCarById(req.params.id);
    if (!car) {
      return res.status(404).json({ error: errorMessages.CAR_NOT_FOUND });
    }
    const { name, brand, price, color, fuel, engine, tyres, bodyType, quantity } = req.body;
    const updatedCar = await carServices.updateCar(req.params.id, {
      name,
      brand,
      price,
      color,
      fuel,
      engine,
      tyres,
      bodyType,
      quantity,
    });
    if (!updatedCar) {
      return res.status(400).json({ error: errorMessages.CAR_NOT_UPDATED });
    }
    res.status(200).json({ car: updatedCar });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: errorMessages.DATA_NOT_VALID });
    }
    helpers.handleErrors(res, err);
  }
};
