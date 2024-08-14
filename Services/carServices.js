const helpers = require('../lib/utils');
const Car = require('../Model/car');

exports.createCar = async (name, brand, price, color, fuel, engine, tyres, bodyType) => {
  try {
    const car = new Car({
      name,
      brand,
      price,
      color,
      fuel,
      engine,
      tyres,
      bodyType,
    });
    await car.save();
    return car;
  } catch (error) {
    if (error.code === 11000) {
      return { status: 400, error: 'Car already exists' };
    }
    console.log(error.message);
    return { status: 500, error: 'Internal server error' };
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
  if (!id || data.length <= 0) return null;
  const car = await Car.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  return car;
};
