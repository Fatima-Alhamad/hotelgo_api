const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  amount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal'],
    required: true,
  },
  transactionId: { type: String },
  paymentStatus: {
    type: String,
    enum: ['completed', 'pending', 'failed'],
    default: 'pending',
  },
});
const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
