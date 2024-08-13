const { body } = require("express-validator");

const userValidations = {
  email: body("email").optional().isEmail().withMessage("Invalid email"),
  address: body("address")
    .optional()
    .notEmpty()
    .withMessage("Address is Invalid"),
  phone: body("phone")
    .optional()
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be exactly 10 digits"),
  role: body("role").optional().notEmpty().withMessage("Role is Invalid"),
};

const userRegisterValidations = {
  username: body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters"),
  email: body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email"),
  password: body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6, max: 25 })
    .withMessage("Password must be between 6 and 25 characters")
    .isStrongPassword()
    .withMessage("Password is not strong enough"),
  address: body("address")
    .optional()
    .isString()
    .withMessage("Address is Invalid"),
  phone: body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid phone number"),
  role: body("role").optional().withMessage("Invalid role"),
};

module.exports = { userValidations, userRegisterValidations };
const userController = require("../Controllers/userController");

const handleErrors = require("../lib/utils");
const { userRegisterValidations } = require("../lib/constants");

router.post(
  "/register",
  [...Object.values(userRegisterValidations)],
  userController.register
);
