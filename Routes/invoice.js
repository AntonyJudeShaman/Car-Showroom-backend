const router = require('express').Router();

const invoiceController = require('../Controllers/invoiceController');

router.get('/view-all-invoices', invoiceController.viewAllInvoices);

router.get('/view-invoice/:id', invoiceController.viewInvoice);

router.get('/view-user-invoices', invoiceController.viewUserInvoices);

module.exports = router;
