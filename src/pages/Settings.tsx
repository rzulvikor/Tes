import { useState, useEffect } from 'react';
import { getSchoolInfo, updateSchoolInfo, getHolidays, removeHoliday } from '../data/store';
import { SchoolInfo } from '../types';

export default function Settings() {
  const [school, setSchool] = useState<SchoolInfo>({ name: '', address: '', academicYear: '' });
  const [holidays, setHolidays] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSchool(getSchoolInfo());
    setHolidays(getHolidays());
  }, []);

  function handleSave() {
    updateSchoolInfo(school);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleRemoveHoliday(date: string) {
    removeHoliday(date);
    setHolidays(getHolidays());
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">
        <i className="fas fa-cog text-blue-600 mr-2"></i>
        Pengaturan
      </h2>

      {/* School Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fas fa-school text-blue-600"></i>
          Informasi Sekolah
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Sekolah</label>
            <input
              type="text"
              value={school.name}
              onChange={e => setSchool({ ...school, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nama sekolah"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <input
              type="text"
              value={school.address}
              onChange={e => setSchool({ ...school, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Alamat sekolah"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran</label>
            <input
              type="text"
              value={school.academicYear}
              onChange={e => setSchool({ ...school, academicYear: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: 2024/2025"
            />
          </div>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-save mr-2"></i>Simpan Pengaturan
          </button>
          {saved && (
            <span className="text-green-600 text-sm ml-3">
              <i className="fas fa-check-circle mr-1"></i>Berhasil disimpan!
            </span>
          )}
        </div>
      </div>

      {/* Holidays */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fas fa-calendar-times text-orange-500"></i>
          Hari Libur
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Daftar tanggal yang ditetapkan sebagai hari libur. Pada tanggal ini, presensi tidak dapat dilakukan.
        </p>
        {holidays.length > 0 ? (
          <div className="space-y-2">
            {holidays.sort().map(date => (
              <div key={date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <i className="fas fa-calendar text-orange-500"></i>
                  <span className="text-sm text-gray-800">
                    {new Date(date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveHoliday(date)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  <i className="fas fa-trash mr-1"></i>Hapus
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">Belum ada hari libur yang ditetapkan</p>
        )}
      </div>

      {/* About */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fas fa-info-circle text-blue-500"></i>
          Tentang Aplikasi
        </h3>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-graduation-cap text-white text-2xl"></i>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-800">RuangHadir</h4>
              <p className="text-sm text-gray-600">Aplikasi Presensi Digital Siswa</p>
              <p className="text-xs text-gray-500">Versi 1.0</p>
            </div>
          </div>
          <div className="text-sm text-gray-700 space-y-2">
            <p>✨ Fitur RuangHadir:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
              <li>Dashboard informasi sekolah dan siswa</li>
              <li>Data jumlah siswa laki-laki & perempuan</li>
              <li>Statistik dan peringkat kehadiran siswa</li>
              <li>Tambah data siswa secara manual atau upload data</li>
              <li>Pembuatan kartu QR Code siswa secara otomatis</li>
              <li>Presensi manual: Hadir, Sakit, Izin & Alpa</li>
              <li>Presensi menggunakan Scan QR Code</li>
              <li>Mencegah presensi ganda dalam satu hari</li>
              <li>Rekap dan riwayat kehadiran siswa</li>
              <li>Download laporan dalam format Excel, CSV & PDF</li>
              <li>Pengiriman laporan kepada orang tua melalui Email & WhatsApp</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
