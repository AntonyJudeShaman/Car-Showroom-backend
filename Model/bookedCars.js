const mongoose = require('mongoose');

const bookedCarsSchema = new mongoose.Schema({
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
  },
  carName: {
    type: String,
    required: true,
  },
  carPrice: {
    type: Number,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const BookedCars = mongoose.model('BookedCars', bookedCarsSchema);

module.exports = BookedCars;
