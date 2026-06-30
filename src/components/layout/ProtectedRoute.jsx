import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Menu, BrainCircuit } from 'lucide-react';
import Sidebar from './Sidebar';

export default function ProtectedRoute() {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('accessToken');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex flex-col lg:flex-row h-dvh bg-zinc-950 text-zinc-50 overflow-hidden">
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between border-b border-white/5 bg-black/60 px-6 py-4 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-white shrink-0" />
          <span className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">AIFit</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white cursor-pointer"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 overflow-y-auto bg-zinc-950 p-4 md:p-8">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}