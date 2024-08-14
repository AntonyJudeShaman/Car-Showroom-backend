const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    brand: {
      type: String,
      required: true,
      enum: [
        'Toyota',
        'KIA',
        'Hyundai',
        'Audi',
        'BMW',
        'Mercedes',
        'Koenigsegg',
        'Tesla',
        'Ferrari',
        'Lamborghini',
        'Bugatti',
      ],
    },
    price: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
      required: true,
      enum: ['red', 'blue', 'black', 'white', 'silver', 'matte black'],
    },
    fuel: {
      type: String,
      required: true,
      enum: ['petrol', 'diesel', 'electric', 'hybrid'],
    },
    engine: {
      type: String,
      required: true,
    },
    tyres: {
      type: String,
      required: true,
      enum: ['tubeless', 'normal', 'bulletproof'],
    },
    bodyType: {
      type: String,
      required: true,
      enum: ['plain', 'armored', 'bulletproof', 'carbon fiber'],
    },
    quantity: {
      type: Number,
      required: true,
      default: 5,
    },
  },
  { timestamps: true },
);

const Car = mongoose.model('Car', carSchema);

module.exports = Car;
