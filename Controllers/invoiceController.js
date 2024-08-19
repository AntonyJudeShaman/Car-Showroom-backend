const invoiceServices = require('../Services/invoiceServices');
const helpers = require('../lib/utils');
const errorMessages = require('../config/errors');
const logger = require('../config/winston');

exports.viewInvoice = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || id.length !== 24) {
      logger.error(`[viewInvoice controller] Invalid ID: ${id}`);
      return res.status(400).json({ error: errorMessages.INVALID_ID });
    }
    const invoice = await invoiceServices.viewInvoice(id);
    if (invoice.error) {
      logger.error(`[viewInvoice controller] Invoice not found: ${id}`);
      return res.status(404).json({ error: invoice.error });
    }

    return res.status(200).json(invoice);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.viewAllInvoices = async (req, res) => {
  try {
    const invoices = await invoiceServices.viewAllInvoices();
    if (invoices.error) {
      logger.error('[viewAllInvoices controller] No invoices found');
      return res.status(404).json({ error: invoices.error });
    }
    return res.status(200).json(invoices);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.viewUserInvoices = async (req, res) => {
  try {
    const userId = req.query.id;
    if (!userId || userId.length !== 24) {
      logger.error(`[viewUserInvoices controller] Invalid ID: ${userId}`);
      return res.status(400).json({ error: errorMessages.INVALID_ID });
    }
    const invoices = await invoiceServices.viewUserInvoices(userId);
    if (invoices.error) {
      logger.error(`[viewUserInvoices controller] No invoices found for user: ${userId}`);
      return res.status(404).json({ error: invoices.error });
    }
    return res.status(200).json(invoices);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};
