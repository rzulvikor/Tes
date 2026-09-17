import { useState, useEffect } from 'react';
import { getStudents, getClasses, getAttendanceByDateAndClass, setAttendance, isHoliday, setHoliday } from '../data/store';
import { Student, AttendanceRecord } from '../types';

export default function Attendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setClasses(getClasses());
  }, []);

  useEffect(() => {
    if (selectedClass) {
      setStudents(getStudents().filter(s => s.class === selectedClass));
      setAttendanceRecords(getAttendanceByDateAndClass(selectedDate, selectedClass));
    }
  }, [selectedClass, selectedDate]);

  function getStatus(studentId: string): string {
    const record = attendanceRecords.find(a => a.studentId === studentId);
    return record?.status || '';
  }

  function handleSetStatus(studentId: string, status: 'hadir' | 'sakit' | 'izin' | 'alpa') {
    if (isHoliday(selectedDate)) {
      setMessage('Hari ini adalah hari libur. Tidak bisa melakukan presensi.');
      return;
    }
    const success = setAttendance(studentId, selectedDate, status);
    if (success) {
      setAttendanceRecords(getAttendanceByDateAndClass(selectedDate, selectedClass));
      setMessage('');
    } else {
      setMessage('Presensi sudah tercatat untuk siswa ini hari ini (mencegah presensi ganda).');
    }
  }

  function handleSetHoliday() {
    if (confirm(`Jadikan tanggal ${selectedDate} sebagai hari libur?`)) {
      setHoliday(selectedDate);
      setMessage(`${selectedDate} telah ditetapkan sebagai hari libur.`);
    }
  }

  const holiday = isHoliday(selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">
          <i className="fas fa-clipboard-check text-blue-600 mr-2"></i>
          Presensi Manual
        </h2>
        <button
          onClick={handleSetHoliday}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          <i className="fas fa-calendar-times mr-2"></i>Liburkan Hari Ini
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kelas</label>
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
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            {message}
          </p>
        </div>
      )}

      {holiday && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 font-medium">
            <i className="fas fa-calendar-times mr-2"></i>
            Tanggal {selectedDate} adalah hari libur. Presensi tidak dapat dilakukan.
          </p>
        </div>
      )}

      {/* Attendance List */}
      {selectedClass && !holiday && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">{student.name}</p>
                      <p className="text-xs text-gray-500">NIS: {student.nis}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2 justify-center">
                        <button
                          onClick={() => handleSetStatus(student.id, 'hadir')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            getStatus(student.id) === 'hadir'
                              ? 'bg-green-600 text-white shadow-md'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          Hadir
                        </button>
                        <button
                          onClick={() => handleSetStatus(student.id, 'sakit')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            getStatus(student.id) === 'sakit'
                              ? 'bg-yellow-500 text-white shadow-md'
                              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          }`}
                        >
                          Sakit
                        </button>
                        <button
                          onClick={() => handleSetStatus(student.id, 'izin')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            getStatus(student.id) === 'izin'
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          Izin
                        </button>
                        <button
                          onClick={() => handleSetStatus(student.id, 'alpa')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            getStatus(student.id) === 'alpa'
                              ? 'bg-red-600 text-white shadow-md'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          Alpa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {students.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Tidak ada siswa di kelas ini</p>
            </div>
          )}
        </div>
      )}

      {!selectedClass && (
        <div className="text-center py-12 text-gray-500">
          <i className="fas fa-clipboard-check text-5xl text-gray-300 mb-4"></i>
          <p>Pilih kelas terlebih dahulu untuk memulai presensi</p>
        </div>
      )}
    </div>
  );
}
