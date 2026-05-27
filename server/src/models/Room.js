const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  floor:         { type: Number, required: true },
  buildingId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Building', required: true },
  deviceId:      { type: String, required: true, unique: true },
  maxCapacityKW: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);