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

exports.getAllCars = async (page, limit) => {
  try {
    const skip = (page - 1) * limit;

    const cars = await Car.find().skip(skip).limit(limit);

    if (!cars) {
      logger.error('[getAllCars service] No cars found');
      return null;
    }

    return cars;
  } catch (error) {
    return null;
  }
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

exports.searchCar = async (searchQuery) => {
  if (!searchQuery) {
    logger.error(`[searchCar service]  No search query`);
    return { error: errorMessages.NO_SEARCH_QUERY };
  }
  return await Car.find({
    $or: [
      { name: { $regex: searchQuery, $options: 'i' } },
      { brand: { $regex: searchQuery, $options: 'i' } },
      { fuelType: { $regex: searchQuery, $options: 'i' } },
      { bodyType: { $regex: searchQuery, $options: 'i' } },
    ],
  });
};
