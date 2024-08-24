const { check } = require('express-validator');

const userUpdateValidations = [
  check('email').optional().isEmail().withMessage('Invalid email'),
  check('address').optional().notEmpty().withMessage('Address is Invalid'),
  check('phone')
    .optional()
    .matches(/^\d{10}$/)
    .withMessage('Phone number must be exactly 10 digits'),
  check('role').optional().notEmpty().withMessage('Role is Invalid'),
];

const userRegisterValidations = [
  check('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 4, max: 25 })
    .withMessage('Username is invalid'),
  check('password')
    .isLength({ min: 6, max: 25 })
    .withMessage('Password must be between 6 and 25 characters'),

  check('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email is invalid'),
  check('address').optional().notEmpty().withMessage('Address is Invalid'),
  check('phone')
    .optional()
    .matches(/^\d{10}$/)
    .withMessage('Phone number must be exactly 10 digits'),
  check('role').optional().notEmpty().withMessage('Role is Invalid'),
];

const userLoginValidations = [
  check('credential')
    .notEmpty()
    .withMessage('Username/Email is required')
    .isLength({ min: 4, max: 25 })
    .withMessage('Username/Email must be between 4 and 25 characters'),
  check('password')
    .notEmpty()
    .isLength({ min: 6, max: 25 })
    .withMessage('Password must be between 6 and 25 characters'),
];

module.exports = {
  userUpdateValidations,
  userRegisterValidations,
  userLoginValidations,
};
