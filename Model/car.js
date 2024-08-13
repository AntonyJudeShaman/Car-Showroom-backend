const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
    enum: [
      "Toyota",
      "KIA",
      "Hyundai",
      "Audi",
      "BMW",
      "Mercedes",
      "Koenigsegg",
      "Tesla",
      "Ferrari",
      "Lamborghini",
      "Bugatti",
    ],
  },
  price: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    required: true,
    enum: ["red", "blue", "black", "white", "silver", "matte black"],
  },
  fuel: {
    type: String,
    required: true,
    enum: ["petrol", "diesel", "electric", "hybrid"],
  },
  engine: {
    type: String,
    required: true,
  },
  tyres: {
    type: String,
    required: true,
    enum: ["tubeless", "normal", "Bulletproof"],
  },
  bodyType: {
    type: String,
    required: true,
    enum: ["plain", "armored", "bulletproof", "carbon fiber"],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

const Car = mongoose.model("Car", carSchema);

module.exports = Car;
