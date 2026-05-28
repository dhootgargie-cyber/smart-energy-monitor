const EnergyReading = require('../models/EnergyReading');
const RATE_PER_KWH = 8.5;
const predictMonthlyBill = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const result = await EnergyReading.aggregate([{ $match: { timestamp: { $gte: thirtyDaysAgo } } }, { $group: { _id: null, totalKWh: { $sum: '$energyKWh' } } }]);
    if (!result.length) return { totalKWh: 0, projectedKWh: 0, estimatedBill: 0, daysOfData: 0 };
    const totalKWh = result[0].totalKWh;
    const daysOfData = Math.min(30, Math.ceil((Date.now() - thirtyDaysAgo) / (1000*60*60*24)));
    const dailyAvg = totalKWh / daysOfData;
    const projectedKWh = dailyAvg * 30;
    return { totalKWh: parseFloat(totalKWh.toFixed(2)), projectedKWh: parseFloat(projectedKWh.toFixed(2)), estimatedBill: parseFloat((projectedKWh * RATE_PER_KWH).toFixed(2)), dailyAvgKWh: parseFloat(dailyAvg.toFixed(2)), daysOfData, ratePerKWh: RATE_PER_KWH };
  } catch (err) { console.error('Bill prediction error:', err.message); return null; }
};
module.exports = { predictMonthlyBill };
