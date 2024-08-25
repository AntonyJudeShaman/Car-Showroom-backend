const router = require('express').Router();

const appointmentController = require('../Controllers/appointmentController');

router.post('/create-appointment', appointmentController.createAppointment);

router.get('/view-all-appointments', appointmentController.viewAllAppointments);

router.get('/view-appointment/:id', appointmentController.viewAppointment);

router.get('/cancel-appointment', appointmentController.cancelAppointment);

router.put('/update-appointment/:id', appointmentController.updateAppointment);

router.get('/search-appointment', appointmentController.searchAppointment);

router.get('/ping', (req, res) => {
  res.json('I am appointment route');
});

module.exports = router;
