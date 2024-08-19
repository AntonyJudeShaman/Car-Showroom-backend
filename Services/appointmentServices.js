const Appointment = require('../Model/appointment');
// const AppointmentSlot = require('../Model/appointmentSlot');
const helpers = require('../lib/utils');
const User = require('../Model/user');

const errorMessages = require('../config/errors');

exports.createAppointment = async (appointmentData) => {
  try {
    const dateKey = helpers.generateDateSlotKey(
      appointmentData.date,
      appointmentData.startTime,
      appointmentData.endTime,
    );

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
    console.log(savedAppointment);

    const user = await User.findByIdAndUpdate(appointmentData.user, {
      $push: { appointments: savedAppointment },
    });

    if (!user) {
      return { error: errorMessages.FAILED_TO_UPDATE_USER };
    }

    // const savedSlot = await AppointmentSlot.create({
    //   date: dateKey,
    //   appointment: savedAppointment._id,
    // });

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
