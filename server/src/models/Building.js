const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  location:    { type: String, required: true },
  totalFloors: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Building', buildingSchema);