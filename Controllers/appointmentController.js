const appointmentServices = require('../Services/appointmentServices');

const helpers = require('../lib/utils');
const logger = require('../config/winston');

exports.createAppointment = async (req, res) => {
  try {
    const result = await appointmentServices.createAppointment(req.body);
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
    const appointment = await appointmentServices.getAppointment(req.params.id);
    if (appointment.error) {
      return res.status(400).json({ error: appointment.error });
    }
    return res.status(200).json(appointment);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await appointmentServices.cancelAppointment(req.query.id);
    if (appointment.error) {
      return res.status(400).json({ error: appointment.error });
    }
    return res.status(200).json(appointment);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.viewAllAppointments = async (req, res) => {
  try {
    const appointments = await appointmentServices.viewAllAppointments();
    if (!appointments) {
      return res.status(400).json({ error: appointments.error });
    }
    return res.status(200).json(appointments);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};
