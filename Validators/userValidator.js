const { body } = require("express-validator");

const userValidations = [
  body("email").optional().isEmail().withMessage("Invalid email"),
  body("address").optional().notEmpty().withMessage("Address is Invalid"),
  body("phone")
    .optional()
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be exactly 10 digits"),
  body("role").optional().notEmpty().withMessage("Role is Invalid"),
];

const userRegisterValidations = [
  body("username").notEmpty().withMessage("Username is required"),
  body("password")
    .isLength({ min: 6, max: 25 })
    .withMessage("Password must be between 6 and 25 characters"),

  body("email").optional().isEmail().withMessage("Invalid email"),
  body("address").optional().notEmpty().withMessage("Address is Invalid"),
  body("phone")
    .optional()
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be exactly 10 digits"),
  body("role").optional().notEmpty().withMessage("Role is Invalid"),
];

const userLoginValidations = [
  body("username").optional().notEmpty().withMessage("Username is required"),
  body("email").optional().notEmpty().isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 6, max: 25 })
    .withMessage("Password must be between 6 and 25 characters"),
];

module.exports = {
  userValidations,
  userRegisterValidations,
  userLoginValidations,
};
