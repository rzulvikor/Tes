import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { getStudents, setAttendance, isHoliday } from '../data/store';
import { Student } from '../types';

export default function QRScan() {
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<Student | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'warning'>('success');
  const [scanLog, setScanLog] = useState<{ student: Student; time: string; status: string }[]>([]);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().split('T')[0];

  async function startScan() {
    if (isHoliday(today)) {
      setMessage('Hari ini adalah hari libur. Tidak bisa melakukan presensi.');
      setMessageType('warning');
      return;
    }

    setScanning(true);
    setMessage('');
    
    try {
      const html5Qrcode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5Qrcode;
      
      await html5Qrcode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleQRScan(decodedText);
        },
        () => {} // ignore errors during scanning
      );
    } catch (err) {
      setMessage('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.');
      setMessageType('error');
      setScanning(false);
    }
  }

  async function stopScan() {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        // ignore
      }
      scannerRef.current = null;
    }
    setScanning(false);
  }

  async function handleQRScan(qrData: string) {
    const students = getStudents();
    const student = students.find(s => s.qrData === qrData);
    
    if (!student) {
      setMessage(`QR Code "${qrData}" tidak dikenali. Bukan data siswa yang terdaftar.`);
      setMessageType('error');
      return;
    }

    setLastScanned(student);
    
    const success = setAttendance(student.id, today, 'hadir');
    if (success) {
      setMessage(`✅ ${student.name} (${student.class}) - HADIR tercatat!`);
      setMessageType('success');
      setScanLog(prev => [{
        student,
        time: new Date().toLocaleTimeString('id-ID'),
        status: 'hadir'
      }, ...prev]);
    } else {
      setMessage(`⚠️ ${student.name} sudah tercatat hadir hari ini (mencegah presensi ganda).`);
      setMessageType('warning');
    }
  }

  // Manual input for testing
  const [manualInput, setManualInput] = useState('');
  
  function handleManualSubmit() {
    if (manualInput.trim()) {
      handleQRScan(manualInput.trim());
      setManualInput('');
    }
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">
        <i className="fas fa-camera text-blue-600 mr-2"></i>
        Presensi Scan QR Code
      </h2>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <i className="fas fa-info-circle mr-2"></i>
          Arahkan kamera ke QR Code kartu siswa untuk mencatat kehadiran secara otomatis. 
          Sistem akan mencegah presensi ganda dalam satu hari.
        </p>
      </div>

      {/* Scanner Area */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col items-center">
          {!scanning ? (
            <div className="text-center">
              <div className="w-48 h-48 mx-auto bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                <i className="fas fa-qrcode text-6xl text-gray-300"></i>
              </div>
              <button
                onClick={startScan}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-camera mr-2"></i>Mulai Scan QR
              </button>
            </div>
          ) : (
            <div className="w-full">
              <div id="qr-reader" ref={containerRef} className="mx-auto max-w-md rounded-lg overflow-hidden"></div>
              <div className="text-center mt-4">
                <button
                  onClick={stopScan}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  <i className="fas fa-stop mr-2"></i>Hentikan Scan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual Input */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-3">
          <i className="fas fa-keyboard text-gray-500 mr-2"></i>
          Input Manual (untuk testing)
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={e => setManualInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
            placeholder="Masukkan kode QR (contoh: RH-2024001)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleManualSubmit}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
          >
            Proses
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Format QR Code: RH-[NIS]. Contoh: RH-2024001, RH-2024002, dst.
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-lg p-4 ${
          messageType === 'success' ? 'bg-green-50 border border-green-200' :
          messageType === 'error' ? 'bg-red-50 border border-red-200' :
          'bg-yellow-50 border border-yellow-200'
        }`}>
          <p className={`text-sm font-medium ${
            messageType === 'success' ? 'text-green-800' :
            messageType === 'error' ? 'text-red-800' :
            'text-yellow-800'
          }`}>
            {message}
          </p>
        </div>
      )}

      {/* Last Scanned */}
      {lastScanned && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h3 className="font-semibold text-green-800 mb-2">
            <i className="fas fa-user-check mr-2"></i>
            Siswa Terakhir Discan
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
              <i className="fas fa-user text-green-700 text-xl"></i>
            </div>
            <div>
              <p className="font-bold text-green-800">{lastScanned.name}</p>
              <p className="text-sm text-green-600">NIS: {lastScanned.nis} | Kelas: {lastScanned.class}</p>
            </div>
          </div>
        </div>
      )}

      {/* Scan Log */}
      {scanLog.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3">
            <i className="fas fa-list text-gray-500 mr-2"></i>
            Log Presensi Hari Ini ({scanLog.length} siswa)
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {scanLog.map((log, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-check text-green-600 text-xs"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{log.student.name}</p>
                    <p className="text-xs text-gray-500">{log.student.class}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
