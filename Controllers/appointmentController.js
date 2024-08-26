const appointmentServices = require('../Services/appointmentServices');
const userServices = require('../Services/userServices');

const helpers = require('../lib/utils');
const logger = require('../config/winston');
const errorMessages = require('../config/errors');

exports.createAppointment = async (req, res) => {
  try {
    const user = await userServices.checkToken(req);
    if (!user) {
      logger.error('[appointment controller] Unauthorized');
      return res.status(401).json({ error: errorMessages.UNAUTHORIZED });
    }
    const result = await appointmentServices.createAppointment(req.body, user._id);
    if (result.error) {
      logger.error(`[createAppointment controller] Appointment not created: ${req.body}`);
      return res.status(400).json({ error: result.error });
    }
    return res.status(201).json({ appointment: result.appointment });
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.viewAppointment = async (req, res) => {
  try {
    if (!req.params.id) {
      logger.error('[viewAppointment controller] Invalid ID');
      return res.status(400).json({ error: errorMessages.INVALID_ID });
    }
    const appointment = await appointmentServices.getAppointment(req.params.id);
    if (appointment.error) {
      logger.error(`[viewAppointment controller] Appointment not found: ${req.params.id}`);
      return res.status(404).json({ error: appointment.error });
    }
    return res.status(200).json(appointment);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    if (!req.query.id) {
      logger.error('[cancelAppointment controller] Invalid ID');
      return res.status(400).json({ error: errorMessages.INVALID_ID });
    }
    const appointment = await appointmentServices.cancelAppointment(req.query.id);
    if (appointment.error === errorMessages.APPOINTMENT_NOT_FOUND) {
      return res.status(404).json({ error: errorMessages.APPOINTMENT_NOT_FOUND });
    } else if (appointment.error) {
      logger.error(`[cancelAppointment controller] Appointment not cancelled: ${req.query.id}`);
      return res.status(400).json({ error: appointment.error });
    }
    return res.status(200).json({ message: 'Appointment Cancelled' });
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.viewAllAppointments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const appointments = await appointmentServices.viewAllAppointments(page, limit);
    if (!appointments) {
      logger.error('[viewAllAppointments controller] No appointments found');
      return res.status(400).json({ error: appointments.error });
    }
    return res.status(200).json(appointments);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    if (!req.params.id) {
      logger.error('[updateAppointment controller] Invalid ID');
      return res.status(400).json({ error: errorMessages.INVALID_ID });
    }
    const appointment = await appointmentServices.updateAppointment(req.params.id, req.body);
    if (appointment.error === errorMessages.APPOINTMENT_NOT_FOUND) {
      logger.error(`[updateAppointment controller] Appointment not found: ${req.params.id}`);
      return res.status(404).json({ error: appointment.error });
    } else if (appointment.error) {
      logger.error(`[updateAppointment controller] Appointment not updated: ${req.params.id}`);
      return res.status(400).json({ error: appointment.error });
    }
    return res.status(200).json(appointment);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.searchAppointment = async (req, res) => {
  try {
    if (!req.query.q) {
      logger.error('[searchAppointment controller] No search query');
      return res.status(400).json({ error: errorMessages.NO_SEARCH_QUERY });
    }
    const user = await userServices.checkToken(req);
    if (!user) {
      logger.error('[searchAppointment controller] Unauthorized');
      return res.status(401).json({ error: errorMessages.UNAUTHORIZED });
    }
    const appointments = await appointmentServices.searchAppointment(req.query.q);
    if (!appointments.length || !appointments) {
      logger.error('[searchAppointment controller] No search results');
      return res.status(404).json({ error: errorMessages.NO_RESULTS });
    }
    return res.status(200).json(appointments);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.viewUserAppointments = async (req, res) => {
  try {
    const user = await userServices.checkToken(req);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    if (!user) {
      logger.error('[viewUserAppointments controller] Unauthorized');
      return res.status(401).json({ error: errorMessages.UNAUTHORIZED });
    }
    const appointments = await appointmentServices.viewUserAppointments(user._id, page, limit);
    if (appointments.error) {
      logger.error(`[viewUserAppointments controller] No appointments found for user: ${user._id}`);
      return res.status(404).json({ error: appointments.error });
    }
    return res.status(200).json(appointments);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};
