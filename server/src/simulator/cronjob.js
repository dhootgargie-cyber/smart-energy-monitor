const cron = require('node-cron');
const Room = require('../models/Room');
const EnergyReading = require('../models/EnergyReading');
const { generateReading } = require('../utils/simulator');
const startSimulator = (io) => {
  console.log('Sensor simulator started — firing every 30 seconds');
  cron.schedule('*/30 * * * * *', async () => {
    try {
      const rooms = await Room.find({}).populate('buildingId', 'name');
      if (rooms.length === 0) return;
      const readings = rooms.map(room => generateReading(room));
      await EnergyReading.insertMany(readings);
      readings.forEach((reading, i) => { io.emit('new-reading', { ...reading, roomName: rooms[i].name, buildingName: rooms[i].buildingId?.name }); });
      const anomalies = readings.filter(r => r.isAnomaly);
      if (anomalies.length) { anomalies.forEach((a, i) => { io.emit('anomaly-alert', { roomName: rooms[i].name, powerKW: a.powerKW, timestamp: a.timestamp }); }); }
      console.log(`[${new Date().toLocaleTimeString()}] Saved ${readings.length} readings${anomalies.length ? ` — ⚠ ${anomalies.length} ANOMALY detected!` : ''}`);
    } catch (err) { console.error('Simulator error:', err.message); }
  });
};
module.exports = { startSimulator };
