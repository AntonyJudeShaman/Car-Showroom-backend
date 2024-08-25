const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'customer'],
      default: 'customer',
    },
    address: {
      type: String,
    },
    phone: {
      type: Number,
    },
    wallet: {
      type: Number,
      required: true,
      default: 100000,
    },
    carCollection: [
      {
        type: Object,
        ref: 'Car',
      },
    ],
    invoices: [
      {
        type: Object,
        ref: 'Invoice',
      },
    ],
    appointments: [
      {
        type: Object,
        ref: 'Appointment',
      },
    ],
    subscribed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
