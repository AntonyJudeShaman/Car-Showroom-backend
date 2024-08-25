const router = require('express').Router();

const invoiceController = require('../Controllers/invoiceController');

router.get('/view-all-invoices', invoiceController.viewAllInvoices);

router.get('/view-invoice/:id', invoiceController.viewInvoice);

router.get('/view-user-invoices', invoiceController.viewUserInvoices);

router.get('/ping', (req, res) => {
  res.json('I am invoice route');
});

module.exports = router;
