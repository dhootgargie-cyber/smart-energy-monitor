const EnergyReading = require('../models/EnergyReading');
const detectAnomaly = async (roomId, currentPowerKW) => {
  try {
    const readings = await EnergyReading.find({ roomId }).sort({ timestamp: -1 }).limit(30).select('powerKW');
    if (readings.length < 10) return false;
    const values = readings.map(r => r.powerKW);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
    if (std === 0) return false;
    return Math.abs((currentPowerKW - mean) / std) > 2.5;
  } catch (err) { console.error('Anomaly detection error:', err.message); return false; }
};
module.exports = { detectAnomaly };
