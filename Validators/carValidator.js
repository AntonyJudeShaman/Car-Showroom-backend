const { check } = require("express-validator");

const createCarValidations = [
  check("name").notEmpty().withMessage("Name is required"),
  check("brand").notEmpty().withMessage("Brand is required"),
  check("price").notEmpty().withMessage("Price is required"),
  check("color").notEmpty().withMessage("Color is required"),
  check("fuel").notEmpty().withMessage("Fuel is required"),
  check("engine").notEmpty().withMessage("Engine is required"),
  check("tyres").notEmpty().withMessage("Tyres is required"),
  check("bodyType").notEmpty().withMessage("BodyType is required"),
];

const carUpdateValidations = [
  check("name").optional().notEmpty().withMessage("Name is required"),
  check("brand").optional().notEmpty().withMessage("Brand is required"),
  check("price").optional().notEmpty().withMessage("Price is required"),

  check("color").optional().notEmpty().withMessage("Color is required"),
  check("fuel").optional().notEmpty().withMessage("Fuel is required"),
  check("engine").optional().notEmpty().withMessage("Engine is required"),
  check("tyres").optional().notEmpty().withMessage("Tyres is required"),
  check("bodyType").optional().notEmpty().withMessage("BodyType is required"),
];

module.exports = {
  createCarValidations,
  carUpdateValidations,
};
