import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api/axios';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [bill, setBill] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [alertsRes, billRes, summaryRes] = await Promise.all([
          api.get('/alerts?limit=20'),
          api.get('/alerts/bill'),
          api.get('/alerts/summary'),
        ]);
        setAlerts(alertsRes.data.alerts);
        setBill(billRes.data);
        setSummary(summaryRes.data);
      } catch (err) {
        console.error('Alerts fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Alerts & Bill Prediction" />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-xs mb-2">Alerts Today</p>
              <p className="text-2xl font-bold text-red-400">{summary?.totalToday ?? '—'}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-xs mb-2">Energy This Month</p>
              <p className="text-2xl font-bold text-blue-400">{bill?.totalKWh ?? '—'} <span className="text-sm font-normal text-gray-400">kWh</span></p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-xs mb-2">Projected Monthly</p>
              <p className="text-2xl font-bold text-yellow-400">{bill?.projectedKWh ?? '—'} <span className="text-sm font-normal text-gray-400">kWh</span></p>
            </div>
            <div className="bg-gray-900 border border-green-500/20 rounded-xl p-5">
              <p className="text-gray-400 text-xs mb-2">Estimated Bill</p>
              <p className="text-2xl font-bold text-green-400">₹{bill?.estimatedBill ?? '—'}</p>
              <p className="text-gray-500 text-xs mt-1">@ ₹{bill?.ratePerKWh}/kWh</p>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Recent Anomaly Alerts</h3>
            {loading ? (
              <p className="text-gray-500 text-sm">Loading alerts...</p>
            ) : alerts.length === 0 ? (
              <p className="text-gray-500 text-sm">No anomalies detected yet.</p>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert._id} className="flex items-center justify-between bg-red-500/5 border border-red-500/10 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-white text-sm font-medium">⚠ {alert.roomId?.name || 'Unknown Room'}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{alert.powerKW?.toFixed(2)} kW — {alert.voltage?.toFixed(1)} V — {alert.current?.toFixed(2)} A</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-400 text-xs font-medium">High Load</p>
                      <p className="text-gray-500 text-xs mt-0.5">{new Date(alert.timestamp).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Alerts;

  