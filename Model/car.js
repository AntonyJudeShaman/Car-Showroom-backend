const mongoose = require('mongoose');

const featureList = require('../config/constants').featureList;

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
        'Porsche',
      ],
    },
    basePrice: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
      required: true,
      enum: ['red', 'blue', 'black', 'white', 'silver', 'matte black'],
    },
    fuelType: {
      type: String,
      required: true,
      enum: ['petrol', 'diesel', 'electric', 'hybrid'],
    },
    engine: {
      capacity: {
        type: Number,
        required: true,
      },
      cylinders: Number,
      horsepower: Number,
    },
    transmission: {
      type: String,
      required: true,
      enum: ['automatic', 'manual'],
    },
    features: [
      {
        name: {
          type: String,
          enum: featureList.map((f) => f.name),
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    tyres: {
      type: String,
      required: true,
      enum: ['tubeless', 'normal', 'bulletproof'],
    },
    bodyType: {
      type: String,
      required: true,
      enum: ['sedan', 'hatchback', 'SUV', 'coupe', 'convertible', 'truck', 'targa'],
    },
    bodyMaterial: {
      type: String,
      required: true,
      enum: ['steel', 'aluminium', 'carbon fiber', 'plastic'],
    },
    stock: {
      quantity: {
        type: Number,
        required: true,
        default: 5,
      },
    },
    status: {
      type: String,
      enum: ['available', 'sold_out', 'discontinued'],
      default: 'available',
    },
    tax: {
      type: Number,
      default: 0.1,
    },
  },
  {
    timestamps: true,
  },
);

carSchema.index({ brand: 1, name: 1 });
carSchema.index({ basePrice: 1 });

const Car = mongoose.model('Car', carSchema);

module.exports = Car;
