import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { connectSocket, disconnectSocket } from '../api/socket';

const StatCard = ({ label, value, unit, color, warning }) => (
  <div className={`bg-gray-900 border rounded-xl p-5 ${warning ? 'border-red-500/50' : 'border-gray-800'}`}>
    <p className="text-gray-400 text-xs font-medium mb-2">{label}</p>
    <p className={`text-2xl font-bold ${color || 'text-white'}`}>{value ?? '—'} <span className="text-sm font-normal text-gray-400">{unit}</span></p>
    {warning && <p className="text-red-400 text-xs mt-1">⚠ High load detected</p>}
  </div>
);
const Dashboard = () => {
  const { user } = useAuth();
  const [liveData, setLiveData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [totalKW, setTotalKW] = useState(null);
  const [anomalyCount, setAnomalyCount] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const [liveRes, totalRes, hourlyRes, dailyRes, anomalyRes] = await Promise.all([
        api.get('/stats/live'),
        api.get('/stats/total-power'),
        api.get('/stats/hourly'),
        api.get('/stats/daily'),
        api.get('/stats/anomaly-count'),
      ]);
      setLiveData(liveRes.data);
      setTotalKW(totalRes.data.totalKW);
      setChartData(hourlyRes.data.map(r => ({
        time: new Date(r.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        powerKW: parseFloat(r.powerKW?.toFixed(2)),
      })));
      setDailyData(dailyRes.data);
      setAnomalyCount(anomalyRes.data.count);
    } catch (err) {
      console.error('Stats fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchStats();
    const socket = connectSocket();
    socket.on('new-reading', (reading) => {
      setChartData(prev => {
        const newPoint = {
          time: new Date(reading.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          powerKW: parseFloat(reading.powerKW?.toFixed(2)),
        };
        return [...prev, newPoint].slice(-30);
      });
    });
    socket.on('anomaly-alert', (alert) => {
      setAlerts(prev => [{
        id: Date.now(),
        message: `⚠ High load in ${alert.roomName} — ${alert.powerKW?.toFixed(1)} kW`,
        time: new Date().toLocaleTimeString(),
      }, ...prev].slice(0, 5));
      setAnomalyCount(prev => (prev || 0) + 1);
    });
    return () => disconnectSocket();
  }, [fetchStats]);
  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Dashboard" />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-white text-lg font-semibold">Welcome back, {user?.name} 👋</h2>
            <p className="text-gray-400 text-sm mt-1">Live campus energy overview — updates every 30s</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Buildings" value="3" unit="blocks" color="text-blue-400" />
            <StatCard label="Active Rooms" value="10" unit="rooms" color="text-green-400" />
            <StatCard label="Live Campus Load" value={totalKW} unit="kW" color="text-yellow-400" warning={totalKW > 80} />
            <StatCard label="Alerts Today" value={anomalyCount} unit="alerts" color="text-red-400" />
          </div>
          {alerts.length > 0 && (
            <div className="mb-6 space-y-2">
              {alerts.map(a => (
                <div key={a.id} className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 flex justify-between items-center">
                  <span className="text-red-400 text-sm">{a.message}</span>
                  <span className="text-gray-500 text-xs">{a.time}</span>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">Live Power Feed (kW)</h3>
              {loading ? <div className="h-48 flex items-center justify-center text-gray-500 text-sm">Loading...</div> : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 11 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="powerKW" stroke="#22c55e" strokeWidth={2} dot={false} name="Power (kW)" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">Daily Energy — Last 7 Days (kWh)</h3>
              {loading ? <div className="h-48 flex items-center justify-center text-gray-500 text-sm">Loading...</div> : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Bar dataKey="totalKWh" fill="#3b82f6" radius={[4,4,0,0]} name="Energy (kWh)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Room-wise Live Power</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs border-b border-gray-800">
                    <th className="text-left pb-3">Room</th>
                    <th className="text-left pb-3">Building</th>
                    <th className="text-left pb-3">Floor</th>
                    <th className="text-left pb-3">Power (kW)</th>
                    <th className="text-left pb-3">Capacity</th>
                    <th className="text-left pb-3">Load %</th>
                    <th className="text-left pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {liveData.map(room => {
                    const loadPct = ((room.powerKW / room.maxCapacityKW) * 100).toFixed(0);
                    const isHigh = room.isAnomaly || loadPct > 85;
                    return (
                      <tr key={room.roomId} className="text-gray-300">
                        <td className="py-3 font-medium">{room.roomName}</td>
                        <td className="py-3 text-gray-400">{room.buildingName}</td>
                        <td className="py-3 text-gray-400">{room.floor}</td>
                        <td className={`py-3 font-semibold ${isHigh ? 'text-red-400' : 'text-green-400'}`}>{room.powerKW?.toFixed(2)}</td>
                        <td className="py-3 text-gray-400">{room.maxCapacityKW} kW</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${isHigh ? 'bg-red-400' : 'bg-green-400'}`} style={{ width: `${Math.min(loadPct, 100)}%` }} />
                            </div>
                            <span className="text-xs text-gray-400">{loadPct}%</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${isHigh ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                            {isHigh ? 'High Load' : 'Normal'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
