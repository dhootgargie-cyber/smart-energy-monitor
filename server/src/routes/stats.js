const express = require('express');
const EnergyReading = require('../models/EnergyReading');
const Room = require('../models/Room');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.get('/live', protect, async (req, res) => {
  try {
    const rooms = await Room.find({}).populate('buildingId', 'name');
    const liveData = await Promise.all(rooms.map(async (room) => {
      const latest = await EnergyReading.findOne({ roomId: room._id }).sort({ timestamp: -1 });
      return { roomId: room._id, roomName: room.name, buildingName: room.buildingId?.name, floor: room.floor, maxCapacityKW: room.maxCapacityKW, powerKW: latest?.powerKW || 0, voltage: latest?.voltage || 0, current: latest?.current || 0, isAnomaly: latest?.isAnomaly || false, timestamp: latest?.timestamp };
    }));
    res.json(liveData);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/total-power', protect, async (req, res) => {
  try {
    const rooms = await Room.find({});
    let totalKW = 0;
    for (const room of rooms) {
      const latest = await EnergyReading.findOne({ roomId: room._id }).sort({ timestamp: -1 });
      if (latest) totalKW += latest.powerKW;
    }
    res.json({ totalKW: parseFloat(totalKW.toFixed(2)) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/hourly', protect, async (req, res) => {
  try {
    const { roomId } = req.query;
    const filter = roomId ? { roomId } : {};
    const readings = await EnergyReading.find(filter).sort({ timestamp: -1 }).limit(48).populate('roomId', 'name');
    res.json(readings.reverse());
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/daily', protect, async (req, res) => {
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0,0,0,0));
      const end = new Date(date.setHours(23,59,59,999));
      const result = await EnergyReading.aggregate([{ $match: { timestamp: { $gte: start, $lte: end } } }, { $group: { _id: null, totalKWh: { $sum: '$energyKWh' } } }]);
      days.push({ date: start.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }), totalKWh: parseFloat((result[0]?.totalKWh || 0).toFixed(2)) });
    }
    res.json(days);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/anomaly-count', protect, async (req, res) => {
  try {
    const start = new Date(); start.setHours(0,0,0,0);
    const count = await EnergyReading.countDocuments({ isAnomaly: true, timestamp: { $gte: start } });
    res.json({ count });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
