const Car = require('../Model/car');
const errorMessages = require('../config/errors');

exports.createCar = async (carData) => {
  try {
    const car = new Car(carData);
    await car.save();
    return car;
  } catch (error) {
    if (error.code === 11000) {
      return { status: 400, error: errorMessages.CAR_ALREADY_EXISTS };
    }
    console.log(error.message);
    return { status: 500, error: errorMessages.CAR_NOT_CREATED };
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
