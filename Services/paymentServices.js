exports.createInvoiceValidations = [
  body('name').notEmpty().withMessage('Name is required'),
  body('brand').notEmpty().withMessage('Brand is required'),
  body('basePrice').notEmpty().withMessage('Base Price is required'),
  body('remainingBalance').notEmpty().withMessage('Remaining Balance is required'),
  body('totalAmount').notEmpty().withMessage('Total Amount is required'),
  body('features').notEmpty().withMessage('Features is required'),
  body('tax').notEmpty().withMessage('Tax is required'),
];
