const { validationResult } = require("express-validator");
const { handleErrors } = require("../lib/utils");

const carServices = require("../Services/carServices");

exports.createCar = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, brand, price, color, fuel, engine, tyres, bodyType } =
      req.body;
    const car = await carServices.createCar(
      name,
      brand,
      price,
      color,
      fuel,
      engine,
      tyres,
      bodyType
    );
    if (car.status === 400) {
      return res.status(400).json({ error: car.error });
    }
    res.status(200).json({ car });
  } catch (err) {
    handleErrors(res, err);
  }
};
