const express = require('express');
const EnergyReading = require('../models/EnergyReading');
const { protect } = require('../middleware/auth');
const { predictMonthlyBill } = require('../utils/billPrediction');
const router = express.Router();
router.get('/', protect, async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const alerts = await EnergyReading.find({ isAnomaly: true }).populate('roomId', 'name floor').sort({ timestamp: -1 }).skip((page-1)*limit).limit(parseInt(limit));
    const total = await EnergyReading.countDocuments({ isAnomaly: true });
    res.json({ alerts, total, page: parseInt(page), pages: Math.ceil(total/limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/bill', protect, async (req, res) => {
  try { res.json(await predictMonthlyBill()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/summary', protect, async (req, res) => {
  try {
    const start = new Date(); start.setHours(0,0,0,0);
    const totalToday = await EnergyReading.countDocuments({ isAnomaly: true, timestamp: { $gte: start } });
    const recent = await EnergyReading.find({ isAnomaly: true, timestamp: { $gte: start } }).populate('roomId', 'name').sort({ timestamp: -1 }).limit(10);
    res.json({ totalToday, recent });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
