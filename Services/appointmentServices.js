const Appointment = require('../Model/appointment');
// const AppointmentSlot = require('../Model/appointmentSlot');
const helpers = require('../lib/utils');
const logger = require('../config/winston');
const User = require('../Model/user');

const errorMessages = require('../config/errors');

exports.createAppointment = async (appointmentData, id) => {
  try {
    const dateKey = helpers.generateDateSlotKey(
      appointmentData.date,
      appointmentData.startTime,
      appointmentData.endTime,
    );

    appointmentData.user = appointmentData.user || id;

    appointmentData.appointmentId = helpers.generateTransactionId('APPT');
    appointmentData.dateKey = dateKey;

    const existingSlot = await helpers.checkAppointmentSlot(dateKey, Appointment);

    if (existingSlot.error) {
      return { error: existingSlot.error };
    }

    const appointment = new Appointment(appointmentData);
    const savedAppointment = await appointment.save();
    if (!savedAppointment) {
      return { error: errorMessages.FAILED_TO_SAVE_APPOINTMENT };
    }

    const user = await User.findByIdAndUpdate(appointmentData.user, {
      $push: { appointments: savedAppointment },
    });

    if (!user) {
      return { error: errorMessages.FAILED_TO_UPDATE_USER };
    }

    return { appointment: savedAppointment };
  } catch (error) {
    helpers.handleErrors(res, error);
    return { error: errorMessages.APPOINTMENT_NOT_CREATED };
  }
};

exports.getAppointment = async (id) => {
  try {
    const appointments = await Appointment.findById(id);
    if (!appointments) {
      logger.error(`[getAppointment service] Appointment not found: ${id}`);
      return { error: errorMessages.APPOINTMENT_NOT_FOUND };
    }
    return appointments;
  } catch (error) {
    helpers.handleErrors(res, error);
    return { error: errorMessages.APPOINTMENT_NOT_FOUND };
  }
};

exports.cancelAppointment = async (id) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true },
    );
    if (!appointment) {
      logger.error(`[cancelAppointment service] Appointment not found: ${id}`);
      return { error: errorMessages.APPOINTMENT_NOT_FOUND };
    }
    return appointment;
  } catch (error) {
    helpers.handleErrors(res, error);
    return { error: errorMessages.APPOINTMENT_NOT_CANCELED };
  }
};

exports.viewAllAppointments = async () => {
  try {
    const appointments = await Appointment.find();
    if (!appointments) {
      logger.error('[viewAllAppointments service] No appointments found');
      return { error: errorMessages.NO_APPOINTMENTS_FOUND };
    }
    return appointments;
  } catch (error) {
    helpers.handleErrors(res, error);
    return { error: errorMessages.NO_APPOINTMENTS_FOUND };
  }
};

exports.updateAppointment = async (id, appointmentData) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(id, appointmentData, { new: true });
    if (!appointment) {
      logger.error(`[updateAppointment service] Appointment not found: ${id}`);
      return { error: errorMessages.APPOINTMENT_NOT_FOUND };
    }
    return appointment;
  } catch (error) {
    helpers.handleErrors(res, error);
    return { error: errorMessages.APPOINTMENT_NOT_UPDATED };
  }
};

exports.searchAppointment = async (searchQuery) => {
  if (!searchQuery) {
    logger.error(`[searchAppointmenta service]  No search query`);
    return { error: errorMessages.NO_SEARCH_QUERY };
  }
  return await Appointment.find({
    $or: [
      { status: { $regex: searchQuery, $options: 'i' } },
      { date: { $regex: searchQuery, $options: 'i' } },
      { startTime: { $regex: searchQuery, $options: 'i' } },
      { endTime: { $regex: searchQuery, $options: 'i' } },
    ],
  });
};
