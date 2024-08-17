const Appointment = require('../Model/appointment');
const AppointmentSlot = require('../Model/appointmentSlot');
const helpers = require('../lib/utils');

const errorMessages = require('../config/errors');

exports.createAppointment = async (appointmentData) => {
  try {
    const dateKey = helpers.generateDateSlotKey(
      appointmentData.date,
      appointmentData.startTime,
      appointmentData.endTime,
    );
    appointmentData.appointmentId = helpers.generateTransactionId('APPT');
    const existingSlot = await AppointmentSlot.findOne({ date: dateKey });
    if (existingSlot) {
      return { error: errorMessages.SLOT_NOT_AVAILABLE };
    }

    const appointment = new Appointment(appointmentData);
    const savedAppointment = await appointment.save();
    if (!savedAppointment) {
      return { error: errorMessages.FAILED_TO_SAVE_APPOINTMENT };
    }

    const savedSlot = await AppointmentSlot.create({
      date: dateKey,
      appointment: savedAppointment._id,
    });

    return { appointment: savedAppointment, slot: savedSlot };
  } catch (error) {
    console.error('Error creating appointment:', error);
    return { error: errorMessages.APPOINTMENT_NOT_CREATED };
  }
};

exports.getAppointment = async (id) => {
  try {
    const appointments = await Appointment.findById(id);
    return appointments;
  } catch (error) {
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
      return { error: errorMessages.APPOINTMENT_NOT_FOUND };
    }
    return appointment;
  } catch (error) {
    return { error: errorMessages.APPOINTMENT_NOT_CANCELED };
  }
};

exports.viewAllAppointments = async () => {
  try {
    const appointments = await Appointment.find();
    // const res = await helpers.getFreeSlots('2024-08-16');
    // return res;
    return appointments;
  } catch (error) {
    return { error: errorMessages.NO_APPOINTMENTS_FOUND };
  }
};
