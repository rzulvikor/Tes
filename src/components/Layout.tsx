import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/', icon: 'fa-home', label: 'Beranda' },
    { path: '/siswa', icon: 'fa-users', label: 'Data Siswa' },
    { path: '/kartu-qr', icon: 'fa-qrcode', label: 'Kartu QR' },
    { path: '/presensi', icon: 'fa-clipboard-check', label: 'Presensi Manual' },
    { path: '/scan-qr', icon: 'fa-camera', label: 'Scan QR' },
    { path: '/rekap', icon: 'fa-chart-bar', label: 'Rekap' },
    { path: '/riwayat', icon: 'fa-history', label: 'Riwayat' },
    { path: '/unduh', icon: 'fa-download', label: 'Unduh Laporan' },
    { path: '/pengaturan', icon: 'fa-cog', label: 'Pengaturan' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-blue-700 to-blue-900 text-white transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-5 border-b border-blue-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <i className="fas fa-graduation-cap text-blue-700 text-xl"></i>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">RuangHadir</h1>
              <p className="text-blue-200 text-xs">Presensi Digital</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white text-blue-700 font-semibold shadow-md'
                    : 'text-blue-100 hover:bg-blue-600/50'
                }`
              }
            >
              <i className={`fas ${item.icon} w-5 text-center`}></i>
              <span className="text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-600">
          <p className="text-blue-200 text-xs text-center">© 2024 RuangHadir v1.0</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center gap-4 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-gray-600 hover:text-gray-800"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800">Aplikasi Presensi Digital Siswa</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
