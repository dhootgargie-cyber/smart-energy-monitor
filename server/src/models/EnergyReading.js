const mongoose = require('mongoose');

const energyReadingSchema = new mongoose.Schema({
  roomId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  timestamp: { type: Date, default: Date.now },
  voltage:   { type: Number, required: true },
  current:   { type: Number, required: true },
  powerKW:   { type: Number, required: true },
  energyKWh: { type: Number, required: true },
  isAnomaly: { type: Boolean, default: false },
});

energyReadingSchema.index({ roomId: 1, timestamp: -1 });

module.exports = mongoose.model('EnergyReading', energyReadingSchema);