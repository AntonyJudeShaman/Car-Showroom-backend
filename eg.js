const { parse, format, addHours, setHours, setMinutes, isBefore, isAfter } = require('date-fns');
const Appointment = require('./Model/appointment');

exports.findFreeSlots = async (date) => {
  try {
    const startTime = setMinutes(setHours(parse(date, 'yyyy-MM-dd', new Date()), 9), 0);
    const endTime = setMinutes(setHours(parse(date, 'yyyy-MM-dd', new Date()), 18), 0);

    const appointments = await Appointment.find({
      date: parse(date, 'yyyy-MM-dd', new Date()),
      status: { $ne: 'cancelled' },
    }).sort('startTime');

    let availableSlots = [];
    let currentSlot = startTime;

    while (isBefore(currentSlot, endTime)) {
      const slotEnd = addHours(currentSlot, 2);
      const conflictingAppointment = appointments.find(
        (appointment) =>
          isBefore(parse(appointment.startTime, 'HH:mm', new Date()), format(slotEnd, 'HH:mm')) &&
          isAfter(parse(appointment.endTime, 'HH:mm', new Date()), format(currentSlot, 'HH:mm')),
      );

      if (!conflictingAppointment) {
        availableSlots.push({
          start: format(currentSlot, 'HH:mm'),
          end: format(slotEnd, 'HH:mm'),
        });
      }
      currentSlot = addHours(currentSlot, 2);
    }

    return availableSlots;
  } catch (error) {
    console.error('Error finding free slots:', error);
    return [];
  }
};

exports.getFreeSlots = async (date) => {
  try {
    if (!date) {
      throw new Error('Date is required');
    }
    const freeSlots = await exports.findFreeSlots(date);
    console.log(freeSlots);
    return freeSlots;
  } catch (error) {
    console.error('Failed to fetch free slots:', error);
    return { error: 'Failed to fetch free slots' };
  }
};

exports.getFreeSlots('2024-08-16');
