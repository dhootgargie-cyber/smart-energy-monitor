const { withNoise } = require('./noise');

// Returns a base load multiplier (0-1) based on hour of day
// Models real campus usage: low at night, peak during working hours
const getLoadMultiplier = (hour) => {
  if (hour >= 0  && hour < 6)  return 0.10; // midnight–6am: minimal
  if (hour >= 6  && hour < 9)  return 0.40; // 6–9am: ramp up
  if (hour >= 9  && hour < 12) return 0.85; // 9am–12pm: peak
  if (hour >= 12 && hour < 14) return 0.70; // 12–2pm: lunch dip
  if (hour >= 14 && hour < 18) return 0.90; // 2–6pm: afternoon peak
  if (hour >= 18 && hour < 21) return 0.50; // 6–9pm: evening
  return 0.15;                               // 9pm–midnight: wind down
};

// Generates one energy reading for a room
const generateReading = (room) => {
  const hour = new Date().getHours();
  const multiplier = getLoadMultiplier(hour);

  // Base power using room's max capacity and time-of-day multiplier
  const basePowerKW = room.maxCapacityKW * multiplier;

  // 5% chance of fault spike (2x–3x normal load) — for anomaly detection
  const isFaultSpike = Math.random() < 0.05;
  const spikeMultiplier = isFaultSpike
    ? 2 + Math.random()         // 2x to 3x
    : 1;

  const powerKW    = withNoise(basePowerKW * spikeMultiplier, 8);
  const voltage    = withNoise(230, 3);           // Indian standard: ~230V
  const current    = parseFloat((powerKW * 1000 / voltage).toFixed(3));
  const energyKWh  = parseFloat((powerKW * (30 / 3600)).toFixed(4)); // 30s interval

  return {
    roomId:    room._id,
    timestamp: new Date(),
    voltage,
    current,
    powerKW,
    energyKWh,
    isAnomaly: isFaultSpike,
  };
};

module.exports = { generateReading };
