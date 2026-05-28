const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
const sendEmailAlert = async ({ roomName, buildingName, powerKW, maxCapacityKW, timestamp }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  try {
    await transporter.sendMail({ from: `"EnergyIQ Alert" <${process.env.EMAIL_USER}>`, to: process.env.EMAIL_USER, subject: `⚠ High Load Alert — ${roomName}`, html: `<div style="font-family:sans-serif"><h2 style="color:#ef4444">⚠ High Load Detected</h2><p>Room: <b>${roomName}</b></p><p>Building: ${buildingName}</p><p>Power: <b style="color:#ef4444">${powerKW.toFixed(2)} kW</b></p><p>Capacity: ${maxCapacityKW} kW</p><p>Time: ${new Date(timestamp).toLocaleString('en-IN')}</p></div>` });
    console.log(`Email alert sent for ${roomName}`);
  } catch (err) { console.error('Email alert failed:', err.message); }
};
const sendTelegramAlert = async ({ roomName, buildingName, powerKW, timestamp }) => {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return;
  try {
    const message = `⚡ *EnergyIQ Alert*\n⚠ High load in *${roomName}*\n🏢 Building: ${buildingName}\n🔌 Power: *${powerKW.toFixed(2)} kW*\n🕐 ${new Date(timestamp).toLocaleString('en-IN')}`;
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: message, parse_mode: 'Markdown' }) });
    console.log(`Telegram alert sent for ${roomName}`);
  } catch (err) { console.error('Telegram alert failed:', err.message); }
};
module.exports = { sendEmailAlert, sendTelegramAlert };
