const cron = require('node-cron');
const Room = require('../models/Room');
const EnergyReading = require('../models/EnergyReading');
const { generateReading } = require('../utils/simulator');
const { detectAnomaly } = require('../utils/anomalyDetection');
const { sendEmailAlert, sendTelegramAlert } = require('../utils/alertService');
const startSimulator = (io) => {
  console.log('Sensor simulator started — firing every 30 seconds');
  cron.schedule('*/30 * * * * *', async () => {
    try {
      const rooms = await Room.find({}).populate('buildingId', 'name');
      if (!rooms.length) return;
      const readings = [];
      for (const room of rooms) {
        const raw = generateReading(room);
        const isRealAnomaly = await detectAnomaly(room._id, raw.powerKW);
        raw.isAnomaly = raw.isAnomaly || isRealAnomaly;
        readings.push({ ...raw, room });
      }
      const docs = readings.map(({ room, ...r }) => r);
      await EnergyReading.insertMany(docs);
      readings.forEach(({ room, ...reading }) => {
        io.emit('new-reading', { ...reading, roomName: room.name, buildingName: room.buildingId?.name });
        if (reading.isAnomaly) {
          io.emit('anomaly-alert', { roomName: room.name, buildingName: room.buildingId?.name, powerKW: reading.powerKW, timestamp: reading.timestamp });
          if (reading.powerKW > (parseFloat(process.env.ALERT_THRESHOLD_KW) || 10)) {
            sendEmailAlert({ roomName: room.name, buildingName: room.buildingId?.name, powerKW: reading.powerKW, maxCapacityKW: room.maxCapacityKW, timestamp: reading.timestamp });
            sendTelegramAlert({ roomName: room.name, buildingName: room.buildingId?.name, powerKW: reading.powerKW, timestamp: reading.timestamp });
          }
        }
      });
      const anomalies = readings.filter(r => r.isAnomaly);
      console.log(`[${new Date().toLocaleTimeString()}] Saved ${readings.length} readings${anomalies.length ? ` — ⚠ ${anomalies.length} ANOMALY` : ''}`);
    } catch (err) { console.error('Simulator error:', err.message); }
  });
};
module.exports = { startSimulator };
