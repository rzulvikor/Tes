import { useState, useEffect } from 'react';
import { getStudents, getClasses, getAttendanceByDate } from '../data/store';
import { Student, AttendanceRecord } from '../types';

export default function History() {
  const [classes, setClasses] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    setClasses(getClasses());
    setStudents(getStudents());
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const allRecords = getAttendanceByDate(selectedDate);
      if (selectedClass) {
        const classStudentIds = students.filter(s => s.class === selectedClass).map(s => s.id);
        setRecords(allRecords.filter(r => classStudentIds.includes(r.studentId)));
      } else {
        setRecords(allRecords);
      }
    }
  }, [selectedDate, selectedClass, students]);

  function getStudentName(studentId: string): string {
    const student = students.find(s => s.id === studentId);
    return student?.name || 'Unknown';
  }

  function getStudentNIS(studentId: string): string {
    const student = students.find(s => s.id === studentId);
    return student?.nis || '';
  }

  function getStudentClass(studentId: string): string {
    const student = students.find(s => s.id === studentId);
    return student?.class || '';
  }

  const statusColors: Record<string, string> = {
    hadir: 'bg-green-100 text-green-700',
    sakit: 'bg-yellow-100 text-yellow-700',
    izin: 'bg-blue-100 text-blue-700',
    alpa: 'bg-red-100 text-red-700',
  };

  const statusLabels: Record<string, string> = {
    hadir: 'Hadir',
    sakit: 'Sakit',
    izin: 'Izin',
    alpa: 'Alpa',
  };

  const summary = {
    hadir: records.filter(r => r.status === 'hadir').length,
    sakit: records.filter(r => r.status === 'sakit').length,
    izin: records.filter(r => r.status === 'izin').length,
    alpa: records.filter(r => r.status === 'alpa').length,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">
        <i className="fas fa-history text-blue-600 mr-2"></i>
        Riwayat Kehadiran
      </h2>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <i className="fas fa-info-circle mr-2"></i>
          Lihat data kehadiran siswa secara detail berdasarkan tanggal.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Kelas</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>Kelas {cls}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-green-600">{summary.hadir}</p>
          <p className="text-xs text-green-700">Hadir</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-yellow-600">{summary.sakit}</p>
          <p className="text-xs text-yellow-700">Sakit</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-blue-600">{summary.izin}</p>
          <p className="text-xs text-blue-700">Izin</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-red-600">{summary.alpa}</p>
          <p className="text-xs text-red-700">Alpa</p>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">
            Riwayat Tanggal: {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">NIS</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kelas</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((record, index) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{getStudentNIS(record.studentId)}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{getStudentName(record.studentId)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{getStudentClass(record.studentId)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[record.status]}`}>
                      {statusLabels[record.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(record.timestamp).toLocaleTimeString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {records.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-history text-4xl text-gray-300 mb-3"></i>
            <p>Tidak ada data kehadiran pada tanggal ini</p>
          </div>
        )}
      </div>
    </div>
  );
}
