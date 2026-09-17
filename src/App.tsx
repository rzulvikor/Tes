import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import QRCard from './pages/QRCard';
import Attendance from './pages/Attendance';
import QRScan from './pages/QRScan';
import Recap from './pages/Recap';
import History from './pages/History';
import Download from './pages/Download';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="siswa" element={<Students />} />
          <Route path="kartu-qr" element={<QRCard />} />
          <Route path="presensi" element={<Attendance />} />
          <Route path="scan-qr" element={<QRScan />} />
          <Route path="rekap" element={<Recap />} />
          <Route path="riwayat" element={<History />} />
          <Route path="unduh" element={<Download />} />
          <Route path="pengaturan" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
