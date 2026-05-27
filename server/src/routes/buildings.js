const express = require('express');
const Building = require('../models/Building');
const Room = require('../models/Room');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

// GET /api/buildings — all roles
router.get('/', protect, async (req, res) => {
  try {
    const buildings = await Building.find({});
    res.json(buildings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/buildings/:id/rooms — get all rooms in a building
router.get('/:id/rooms', protect, async (req, res) => {
  try {
    const rooms = await Room.find({ buildingId: req.params.id });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/buildings — admin only
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const building = await Building.create(req.body);
    res.status(201).json(building);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;