const appointmentServices = require('../Services/appointmentServices');

const helpers = require('../lib/utils');

exports.createAppointment = async (req, res) => {
  try {
    const result = await appointmentServices.createAppointment(req.body);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.status(201).json({ appointment: result.appointment });
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
    res.status(200).json(appointment);
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
    res.status(200).json(appointment);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};

exports.viewAllAppointments = async (req, res) => {
  try {
    const appointments = await appointmentServices.viewAllAppointments();
    if (appointments.error) {
      return res.status(400).json({ error: appointments.error });
    }
    res.status(200).json(appointments);
  } catch (err) {
    helpers.handleErrors(res, err);
  }
};
