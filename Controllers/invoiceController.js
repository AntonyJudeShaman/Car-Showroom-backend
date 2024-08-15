const invoiceServices = require('../Services/invoiceServices');
const helpers = require('../lib/utils');

exports.viewInvoice = async (req, res) => {
  try {
    const id = req.params.id;
    const invoice = await invoiceServices.viewInvoice(id);
    if (invoice.error) {
      return res.status(404).json({ error: invoice.error });
    }

    res.status(200).json(invoice);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.viewAllInvoices = async (req, res) => {
  try {
    const invoices = await invoiceServices.viewAllInvoices();
    if (invoices.error) {
      return res.status(404).json({ error: invoices.error });
    }
    res.status(200).json(invoices);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.viewUserInvoices = async (req, res) => {
  try {
    const userId = req.query.id;
    const invoices = await invoiceServices.viewUserInvoices(userId);
    if (invoices.error) {
      return res.status(404).json({ error: invoices.error });
    }
    res.status(200).json(invoices);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};
