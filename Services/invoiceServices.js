const Invoice = require('../Model/invoice');
const errorMessages = require('../config/errors');

exports.viewInvoice = async (id) => {
  try {
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return { error: errorMessages.INVOICE_NOT_FOUND };
    }

    return invoice;
  } catch {
    return { error: errorMessages.SOME_ERROR };
  }
};

exports.viewAllInvoices = async () => {
  try {
    const invoices = await Invoice.find();
    if (!invoices.length) {
      return { error: errorMessages.NO_INVOICES };
    }
    return invoices;
  } catch {
    return { error: errorMessages.SOME_ERROR };
  }
};

exports.viewUserInvoices = async (id) => {
  try {
    const invoices = await Invoice.find({ user: id });
    if (!invoices.length) {
      return { error: errorMessages.NO_USER_INVOICES };
    }
    return invoices;
  } catch {
    return { error: errorMessages.SOME_ERROR };
  }
};
