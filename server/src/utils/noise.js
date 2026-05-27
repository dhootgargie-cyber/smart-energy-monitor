// Box-Muller transform — generates realistic random variation
// Returns a random number with mean=0, std=1
const gaussianRandom = () => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

// Returns a value near `mean` with ±`stdPercent`% variation
const withNoise = (mean, stdPercent = 8) => {
  const std = (stdPercent / 100) * mean;
  const value = mean + gaussianRandom() * std;
  return Math.max(0, parseFloat(value.toFixed(3)));
};

module.exports = { gaussianRandom, withNoise };