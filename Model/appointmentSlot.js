const mongoose = require('mongoose');

const appointmentSlotSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true,
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
});

const AppointmentSlot = mongoose.model('AppointmentSlot', appointmentSlotSchema);

module.exports = AppointmentSlot;
