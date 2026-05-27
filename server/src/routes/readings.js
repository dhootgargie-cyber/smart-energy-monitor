const express = require('express');
const EnergyReading = require('../models/EnergyReading');
const Room = require('../models/Room');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

// GET /api/readings/latest — all roles can view
router.get('/latest', protect, async (req, res) => {
  try {
    const readings = await EnergyReading.find({})
      .populate('roomId', 'name floor maxCapacityKW')
      .sort({ timestamp: -1 })
      .limit(20);
    res.json(readings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/readings/room/:roomId — readings for a specific room
router.get('/room/:roomId', protect, async (req, res) => {
  try {
    const { from, to, limit = 100 } = req.query;
    const filter = { roomId: req.params.roomId };

    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to)   filter.timestamp.$lte = new Date(to);
    }

    const readings = await EnergyReading.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(readings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/readings/anomalies — admin and technician only
router.get('/anomalies', protect, authorize('admin', 'technician'), async (req, res) => {
  try {
    const anomalies = await EnergyReading.find({ isAnomaly: true })
      .populate('roomId', 'name floor buildingId')
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(anomalies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
