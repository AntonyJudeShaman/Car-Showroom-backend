const mongoose = require('mongoose');
const invoiceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    remainingBalance: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    features: [
      {
        type: String,
        required: true,
      },
    ],
    discount: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0.1,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

invoiceSchema.index({ name: 1 });
invoiceSchema.index({ brand: 1 });
invoiceSchema.index({ date: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
