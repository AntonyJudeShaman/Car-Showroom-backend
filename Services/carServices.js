const Car = require('../Model/car');
const errorMessages = require('../config/errors');
const logger = require('../config/winston');
const helpers = require('../lib/utils');

exports.createCar = async (carData) => {
  try {
    const car = new Car(carData);
    if (!car) {
      logger.error(`[createCar service] Car not created: ${carData}`);
      return null;
    }
    await car.save();

    return car;
  } catch (error) {
    helpers.handleErrors(res, error);
    return { error: errorMessages.CAR_NOT_CREATED };
  }
};

exports.getAllCars = async () => {
  const cars = await Car.find();
  return cars;
};

exports.getCarById = async (id) => {
  if (!id) return null;
  const car = await Car.findById(id);
  return car;
};

exports.getCarByName = async (name) => {
  if (!name) return null;
  const car = await Car.findOne({ name });
  return car;
};

exports.updateCar = async (id, data) => {
  if (!id) return null;
  const car = await Car.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  return car;
};
