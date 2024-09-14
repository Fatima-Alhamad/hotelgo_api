const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  discountPercentage: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  termsAndConditions: { type: String },
});

const Offer = mongoose.model('Offer', offerSchema);
module.exports = Offer;
