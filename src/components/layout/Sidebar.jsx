import { NavLink, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, Utensils, Settings, LogOut, BrainCircuit, History, X } from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Workouts', path: '/workouts', icon: Dumbbell },
    { name: 'Workout History', path: '/workouts/history', icon: History },
    { name: 'Meals', path: '/meals', icon: Utensils },
    { name: 'Meal History', path: '/meals/history', icon: History },
  ];

  const handleLogout = async () => {
    try {
      await import('../../utils/api').then(({ api }) => api.post('/auth/logout'));
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      navigate('/login');
      if (onClose) onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/5 bg-black/90 p-6 backdrop-blur-2xl shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-7 w-7 text-white shrink-0" />
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              AIFit
            </span>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-3 overflow-y-auto pr-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/10 text-white shadow-[inset_4px_0_0_rgba(255,255,255,1)]' 
                    : 'text-zinc-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-2 border-t border-white/5 pt-6 shrink-0">
          <Link 
            to="/profile" 
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white hover:translate-x-1 transition-all duration-300"
          >
            <Settings className="h-5 w-5 shrink-0" />
            Settings
          </Link>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-zinc-400 hover:bg-red-500/10 hover:text-red-400 hover:translate-x-1 transition-all duration-300 cursor-pointer"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}