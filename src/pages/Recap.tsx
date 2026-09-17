import { useState, useEffect } from 'react';
import { getStudents, getClasses, getMonthlyRecap } from '../data/store';
import { Student } from '../types';

export default function Recap() {
  const [classes, setClasses] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [recap, setRecap] = useState<Record<string, { hadir: number; sakit: number; izin: number; alpa: number }>>({});

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  useEffect(() => {
    setClasses(getClasses());
    setStudents(getStudents());
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const recapData = getMonthlyRecap(selectedMonth, parseInt(selectedYear), selectedClass);
      setRecap(recapData);
    }
  }, [selectedClass, selectedMonth, selectedYear]);

  const classStudents = students.filter(s => s.class === selectedClass);

  // Calculate totals
  const totals = classStudents.reduce((acc, student) => {
    const r = recap[student.id] || { hadir: 0, sakit: 0, izin: 0, alpa: 0 };
    acc.hadir += r.hadir;
    acc.sakit += r.sakit;
    acc.izin += r.izin;
    acc.alpa += r.alpa;
    return acc;
  }, { hadir: 0, sakit: 0, izin: 0, alpa: 0 });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">
        <i className="fas fa-chart-bar text-blue-600 mr-2"></i>
        Rekap Kehadiran Bulanan
      </h2>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Pilih Kelas --</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>Kelas {cls}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {months.map((m, i) => (
                <option key={i} value={(i + 1).toString()}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {selectedClass && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{totals.hadir}</p>
            <p className="text-sm text-green-700 mt-1">Total Hadir</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">{totals.sakit}</p>
            <p className="text-sm text-yellow-700 mt-1">Total Sakit</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{totals.izin}</p>
            <p className="text-sm text-blue-700 mt-1">Total Izin</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-600">{totals.alpa}</p>
            <p className="text-sm text-red-700 mt-1">Total Alpa</p>
          </div>
        </div>
      )}

      {/* Recap Table */}
      {selectedClass && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">
              Rekap Kelas {selectedClass} - {months[parseInt(selectedMonth) - 1]} {selectedYear}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-green-600 uppercase">Hadir</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-yellow-600 uppercase">Sakit</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-blue-600 uppercase">Izin</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-red-600 uppercase">Alpa</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">% Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {classStudents.map((student, index) => {
                  const r = recap[student.id] || { hadir: 0, sakit: 0, izin: 0, alpa: 0 };
                  const total = r.hadir + r.sakit + r.izin + r.alpa;
                  const percentage = total > 0 ? Math.round((r.hadir / total) * 100) : 0;
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-800">{student.name}</p>
                        <p className="text-xs text-gray-500">NIS: {student.nis}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex px-2 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-full">{r.hadir}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex px-2 py-1 text-sm font-medium bg-yellow-100 text-yellow-700 rounded-full">{r.sakit}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex px-2 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full">{r.izin}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex px-2 py-1 text-sm font-medium bg-red-100 text-red-700 rounded-full">{r.alpa}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">{percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {classStudents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Tidak ada data untuk ditampilkan</p>
            </div>
          )}
        </div>
      )}

      {!selectedClass && (
        <div className="text-center py-12 text-gray-500">
          <i className="fas fa-chart-bar text-5xl text-gray-300 mb-4"></i>
          <p>Pilih kelas untuk melihat rekap kehadiran</p>
        </div>
      )}
    </div>
  );
}
