import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Users, Package, ShoppingBag, BarChart3, Settings } from 'lucide-react';

export default function AdminDashboard({ setActiveTab }) {
  const { currentUser } = useApp();

  // Double check authorization
  if (!currentUser || currentUser.email !== 'tnklf@icloud.com') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="w-20 h-20 text-red-500 mb-6" />
        <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-wider">Access Denied</h2>
        <p className="text-gray-400 mb-8 max-w-md">
          You do not have the required permissions to view the Admin Dashboard.
        </p>
        <button 
          onClick={() => setActiveTab('home')}
          className="bg-[var(--cmyk-magenta)] hover:bg-fuchsia-600 text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider transition-all transform hover:scale-105"
        >
          Return Home
        </button>
      </div>
    );
  }

  const stats = [
    { label: 'Total Orders', value: '0', icon: ShoppingBag, color: 'text-[var(--cmyk-cyan)]' },
    { label: 'Total Revenue', value: 'R 0.00', icon: BarChart3, color: 'text-[var(--cmyk-magenta)]' },
    { label: 'Total Users', value: '1', icon: Users, color: 'text-[var(--cmyk-yellow)]' },
    { label: 'Inventory Items', value: '192', icon: Package, color: 'text-white' },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl animate-fade-in pb-32">
      <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--cmyk-cyan)] via-white to-[var(--cmyk-magenta)] uppercase tracking-tight">
            Admin HQ
          </h1>
          <p className="text-gray-400 mt-2 font-mono text-sm uppercase tracking-widest">
            Welcome back, Commander
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
          <ShieldAlert className="w-5 h-5 text-[var(--cmyk-cyan)]" />
          <span className="text-white font-bold text-sm tracking-widest uppercase">Secured</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">
              <stat.icon className={`w-24 h-24 ${stat.color}`} />
            </div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl bg-black/50 border border-white/10 shadow-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-gray-400 font-bold uppercase tracking-wider text-sm">{stat.label}</h3>
              </div>
              <div>
                <p className={`text-4xl font-black tracking-tighter ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <h2 className="text-xl font-black text-white uppercase tracking-wider mb-6 flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-[var(--cmyk-cyan)]" />
            Recent Orders
          </h2>
          <div className="text-center py-12 bg-black/30 rounded-xl border border-white/5">
            <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 font-mono text-sm uppercase">No orders placed yet.</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <h2 className="text-xl font-black text-white uppercase tracking-wider mb-6 flex items-center gap-3">
            <Settings className="w-6 h-6 text-[var(--cmyk-magenta)]" />
            Quick Actions
          </h2>
          <div className="space-y-4">
            <button className="w-full bg-black/50 hover:bg-[var(--cmyk-cyan)]/20 border border-[var(--cmyk-cyan)]/30 text-[var(--cmyk-cyan)] font-bold py-4 px-6 rounded-xl text-left flex justify-between items-center transition-all">
              <span className="uppercase tracking-wider text-sm">Manage Inventory</span>
              <Package className="w-5 h-5" />
            </button>
            <button className="w-full bg-black/50 hover:bg-[var(--cmyk-magenta)]/20 border border-[var(--cmyk-magenta)]/30 text-[var(--cmyk-magenta)] font-bold py-4 px-6 rounded-xl text-left flex justify-between items-center transition-all">
              <span className="uppercase tracking-wider text-sm">Manage Users</span>
              <Users className="w-5 h-5" />
            </button>
            <button className="w-full bg-black/50 hover:bg-white/10 border border-white/10 text-white font-bold py-4 px-6 rounded-xl text-left flex justify-between items-center transition-all">
              <span className="uppercase tracking-wider text-sm">Store Settings</span>
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
