const router = require("express").Router();

const carController = require("../Controllers/carController");

const {
  createCarValidations,
  carUpdateValidations,
} = require("../Validators/carValidator");

router.post("/create-car", createCarValidations, carController.createCar);

module.exports = router;
