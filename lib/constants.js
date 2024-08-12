const { body, validationResult } = require("express-validator");

const userValidations = {
  password: body("password")
    .optional()
    .isLength({ min: 6, max: 25 })
    .withMessage("Password must be between 6 and 25 characters"),
  email: body("email").optional().isEmail().withMessage("Invalid email"),
  address: body("address")
    .optional()
    .notEmpty()
    .withMessage("Address cannot be empty"),
  phone: body("phone")
    .optional()
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be exactly 10 digits"),
  role: body("role").optional().notEmpty().withMessage("Role cannot be empty"),
};

module.exports = { userValidations };
