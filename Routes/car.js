const router = require('express').Router();

const carController = require('../Controllers/carController');

const { createCarValidations, carUpdateValidations } = require('../Validators/carValidator');

router.post('/create-car', carController.createCar);

router.get('/view-all-cars', carController.getAllCars);

router.get('/view-car/:id', carController.getCar);

router.put('/update-car/:id', carUpdateValidations, carController.updateCar);

module.exports = router;
