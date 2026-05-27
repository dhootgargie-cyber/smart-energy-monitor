import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ label, value, unit, color }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
    <p className="text-gray-400 text-xs font-medium mb-2">{label}</p>
    <p className={`text-2xl font-bold ${color || 'text-white'}`}>
      {value} <span className="text-sm font-normal text-gray-400">{unit}</span>
    </p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title="Dashboard" />
        <main className="flex-1 p-6">

          <div className="mb-6">
            <h2 className="text-white text-lg font-semibold">
              Welcome back, {user?.name} 👋
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Here's your campus energy overview
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Buildings"  value="3"      unit="blocks"  color="text-blue-400" />
            <StatCard label="Active Rooms"     value="10"     unit="rooms"   color="text-green-400" />
            <StatCard label="Live Power"       value="—"      unit="kW"      color="text-yellow-400" />
            <StatCard label="Alerts Today"     value="—"      unit="alerts"  color="text-red-400" />
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-2">Real-time Charts</h3>
            <p className="text-gray-400 text-sm">
              Coming in Phase 2 — live kWh charts, heatmaps, and peak load detection will appear here.
            </p>
          </div>

        </main>
      </div>
    </div>
  );
};

export default Dashboard;
