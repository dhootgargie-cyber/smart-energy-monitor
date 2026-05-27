const cron = require('node-cron');
const Room = require('../models/Room');
const EnergyReading = require('../models/EnergyReading');
const { generateReading } = require('../utils/simulator');

const startSimulator = () => {
  console.log('Sensor simulator started — firing every 30 seconds');

  // Runs every 30 seconds
  cron.schedule('*/30 * * * * *', async () => {
    try {
      const rooms = await Room.find({});

      if (rooms.length === 0) {
        console.warn('No rooms found — run npm run seed first');
        return;
      }

      const readings = rooms.map(room => generateReading(room));
      await EnergyReading.insertMany(readings);

      const anomalies = readings.filter(r => r.isAnomaly);
      console.log(
        `[${new Date().toLocaleTimeString()}] Saved ${readings.length} readings` +
        (anomalies.length ? ` — ⚠ ${anomalies.length} ANOMALY detected!` : '')
      );

    } catch (err) {
      console.error('Simulator error:', err.message);
    }
  });
};

module.exports = { startSimulator };
