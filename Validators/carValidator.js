const { check } = require('express-validator');

const createCarValidations = [
  check('name').notEmpty().withMessage('Name is required'),
  check('brand')
    .notEmpty()
    .isIn([
      'Toyota',
      'KIA',
      'Hyundai',
      'Audi',
      'BMW',
      'Mercedes',
      'Koenigsegg',
      'Tesla',
      'Ferrari',
      'Lamborghini',
      'Bugatti',
      'Porsche',
    ])
    .withMessage('Invalid brand'),
  check('basePrice')
    .notEmpty()
    .isNumeric()
    .withMessage('Base price is required and must be a number'),
  check('color')
    .notEmpty()
    .isIn(['red', 'blue', 'black', 'white', 'silver', 'matte black'])
    .withMessage('Invalid color'),
  check('fuelType')
    .notEmpty()
    .isIn(['petrol', 'diesel', 'electric', 'hybrid'])
    .withMessage('Invalid fuel type'),
  check('engine.capacity')
    .notEmpty()
    .isNumeric()
    .withMessage('Engine capacity is required and must be a number'),
  check('engine.cylinders').optional().isNumeric().withMessage('Engine cylinders must be a number'),
  check('engine.horsepower')
    .optional()
    .isNumeric()
    .withMessage('Engine horsepower must be a number'),
  check('transmission')
    .notEmpty()
    .isIn(['automatic', 'manual'])
    .withMessage('Invalid transmission type'),
  check('features').optional().isArray().withMessage('Features must be an array'),
  check('features.*.name')
    .optional()
    .isIn([
      'sunroof',
      'leather seats',
      'heated seats',
      'backup camera',
      'bluetooth',
      'keyless entry',
      'remote start',
      'adaptive cruise control',
      'lane departure warning',
      'navigation system',
      'parking sensors',
      'blind spot monitoring',
      'automatic parking',
      'carplay',
      'android auto',
      'premium sound system',
    ])
    .withMessage('Invalid feature'),
  check('tyres')
    .notEmpty()
    .isIn(['tubeless', 'normal', 'bulletproof'])
    .withMessage('Invalid tyre type'),
  check('bodyType')
    .notEmpty()
    .isIn(['sedan', 'hatchback', 'SUV', 'coupe', 'convertible', 'truck', 'targa'])
    .withMessage('Invalid body type'),
  check('bodyMaterial')
    .notEmpty()
    .isIn(['steel', 'aluminium', 'carbon fiber', 'plastic'])
    .withMessage('Invalid body material'),
  check('stock.quantity')
    .notEmpty()
    .isInt({ min: 0 })
    .withMessage('Stock quantity is required and must be a non-negative integer'),
  check('status')
    .optional()
    .isIn(['available', 'out_of_stock', 'discontinued'])
    .withMessage('Invalid status'),
];

const carUpdateValidations = [
  check('name').optional().notEmpty().withMessage('Name cannot be empty'),
  check('brand')
    .optional()
    .isIn([
      'Toyota',
      'KIA',
      'Hyundai',
      'Audi',
      'BMW',
      'Mercedes',
      'Koenigsegg',
      'Tesla',
      'Ferrari',
      'Lamborghini',
      'Bugatti',
      'Porsche',
    ])
    .withMessage('Invalid brand'),
  check('basePrice').optional().isNumeric().withMessage('Base price must be a number'),
  check('color')
    .optional()
    .isIn(['red', 'blue', 'black', 'white', 'silver', 'matte black'])
    .withMessage('Invalid color'),
  check('fuelType')
    .optional()
    .isIn(['petrol', 'diesel', 'electric', 'hybrid'])
    .withMessage('Invalid fuel type'),
  check('engine.capacity').optional().isNumeric().withMessage('Engine capacity must be a number'),
  check('engine.cylinders').optional().isNumeric().withMessage('Engine cylinders must be a number'),
  check('engine.horsepower')
    .optional()
    .isNumeric()
    .withMessage('Engine horsepower must be a number'),
  check('transmission')
    .optional()
    .isIn(['automatic', 'manual'])
    .withMessage('Invalid transmission type'),
  check('features').optional().isArray().withMessage('Features must be an array'),
  check('features.*.name')
    .optional()
    .isIn([
      'sunroof',
      'leather seats',
      'heated seats',
      'backup camera',
      'bluetooth',
      'keyless entry',
      'remote start',
      'adaptive cruise control',
      'lane departure warning',
      'navigation system',
      'parking sensors',
      'blind spot monitoring',
      'automatic parking',
      'carplay',
      'android auto',
      'premium sound system',
    ])
    .withMessage('Invalid feature'),
  check('tyres')
    .optional()
    .isIn(['tubeless', 'normal', 'bulletproof'])
    .withMessage('Invalid tyre type'),
  check('bodyType')
    .optional()
    .isIn(['sedan', 'hatchback', 'SUV', 'coupe', 'convertible', 'truck', 'targa'])
    .withMessage('Invalid body type'),
  check('bodyMaterial')
    .optional()
    .isIn(['steel', 'aluminium', 'carbon fiber', 'plastic'])
    .withMessage('Invalid body material'),
  check('stock.quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  check('status')
    .optional()
    .isIn(['available', 'sold_out', 'discontinued'])
    .withMessage('Invalid status'),
];

module.exports = {
  createCarValidations,
  carUpdateValidations,
};
