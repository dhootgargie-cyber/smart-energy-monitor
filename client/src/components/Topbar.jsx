import { useAuth } from '../context/AuthContext';

const Topbar = ({ title }) => {
  const { user } = useAuth();

  return (
    <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
      <h1 className="text-white font-semibold text-base">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400">Smart Campus Energy Monitor</span>
        <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold">
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
