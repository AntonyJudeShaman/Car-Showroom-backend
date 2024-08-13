const { handleErrors } = require("../lib/utils");
const Car = require("../Model/car");

exports.createCar = async (
  name,
  brand,
  price,
  color,
  fuel,
  engine,
  tyres,
  bodyType
) => {
  return await this.createCarInDB(
    name,
    brand,
    price,
    color,
    fuel,
    engine,
    tyres,
    bodyType
  );
};

exports.createCarInDB = async (
  name,
  brand,
  price,
  color,
  fuel,
  engine,
  tyres,
  bodyType
) => {
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
      return { status: 400, error: "Car already exists" };
    }
    console.log(error.message);
    return { status: 500, error: "Internal server error" };
  }
};

exports.getAllCars = async () => {
  const cars = await Car.find();
  return cars;
};

exports.getCarById = async (id) => {
  const car = await Car.findById(id);
  return car;
};
