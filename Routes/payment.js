const router = require('express').Router();

const invoiceController = require('../Controllers/invoiceController');

const { createInvoiceValidations } = require('../Validators/invoiceValidator');

router.post('/create-invoice', createInvoiceValidations, invoiceController.createInvoice);

router.get('/view-all-invoices', invoiceController.getAllInvoices);

router.get('/view-invoice/:id', invoiceController.getInvoice);

module.exports = router;
