import { useState, useEffect } from 'react';
import { getStudents, getClasses, getAttendanceByDateAndClass, setAttendance, updateAttendance, isHoliday, setHoliday } from '../data/store';
import { Student, AttendanceRecord } from '../types';

export default function Attendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'warning' | 'info'>('success');

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
      setMessageType('warning');
      return;
    }

    const currentStatus = getStatus(studentId);
    
    if (currentStatus) {
      // Edit existing attendance
      const success = updateAttendance(studentId, selectedDate, status);
      if (success) {
        setAttendanceRecords(getAttendanceByDateAndClass(selectedDate, selectedClass));
        const student = students.find(s => s.id === studentId);
        setMessage(`✅ Status ${student?.name} berhasil diubah dari "${currentStatus}" menjadi "${status}"`);
        setMessageType('success');
      }
    } else {
      // Set new attendance
      const success = setAttendance(studentId, selectedDate, status);
      if (success) {
        setAttendanceRecords(getAttendanceByDateAndClass(selectedDate, selectedClass));
        const student = students.find(s => s.id === studentId);
        setMessage(`✅ ${student?.name} - ${status.toUpperCase()} berhasil dicatat`);
        setMessageType('success');
      }
    }
  }

  function handleSetHoliday() {
    if (confirm(`Jadikan tanggal ${selectedDate} sebagai hari libur?`)) {
      setHoliday(selectedDate);
      setMessage(`${selectedDate} telah ditetapkan sebagai hari libur.`);
      setMessageType('info');
    }
  }

  const holiday = isHoliday(selectedDate);
  
  // Summary
  const summary = {
    hadir: attendanceRecords.filter(a => a.status === 'hadir').length,
    sakit: attendanceRecords.filter(a => a.status === 'sakit').length,
    izin: attendanceRecords.filter(a => a.status === 'izin').length,
    alpa: attendanceRecords.filter(a => a.status === 'alpa').length,
    belum: students.length - attendanceRecords.length,
  };

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
          <i className="fas fa-calendar-times mr-2"></i>Liburkan Tanggal Ini
        </button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <i className="fas fa-info-circle mr-2"></i>
          Klik status untuk mengisi atau <strong>mengedit</strong> kehadiran siswa. Status yang sudah tercatat bisa diubah kapan saja.
        </p>
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
        <div className={`rounded-lg p-4 ${
          messageType === 'success' ? 'bg-green-50 border border-green-200' :
          messageType === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
          'bg-blue-50 border border-blue-200'
        }`}>
          <p className={`text-sm ${
            messageType === 'success' ? 'text-green-800' :
            messageType === 'warning' ? 'text-yellow-800' :
            'text-blue-800'
          }`}>
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

      {/* Summary Cards */}
      {selectedClass && !holiday && (
        <div className="grid grid-cols-5 gap-3">
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
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-gray-600">{summary.belum}</p>
            <p className="text-xs text-gray-700">Belum</p>
          </div>
        </div>
      )}

      {/* Attendance List */}
      {selectedClass && !holiday && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              <i className="fas fa-edit mr-1 text-blue-500"></i>
              Klik tombol status untuk mengisi atau mengubah kehadiran
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status Kehadiran</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status Saat Ini</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student, index) => {
                  const currentStatus = getStatus(student.id);
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-800">{student.name}</p>
                        <p className="text-xs text-gray-500">NIS: {student.nis}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          <button
                            onClick={() => handleSetStatus(student.id, 'hadir')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                              currentStatus === 'hadir'
                                ? 'bg-green-600 text-white shadow-md ring-2 ring-green-300'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            <i className="fas fa-check mr-1"></i>Hadir
                          </button>
                          <button
                            onClick={() => handleSetStatus(student.id, 'sakit')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                              currentStatus === 'sakit'
                                ? 'bg-yellow-500 text-white shadow-md ring-2 ring-yellow-300'
                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            }`}
                          >
                            <i className="fas fa-thermometer-half mr-1"></i>Sakit
                          </button>
                          <button
                            onClick={() => handleSetStatus(student.id, 'izin')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                              currentStatus === 'izin'
                                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            <i className="fas fa-envelope mr-1"></i>Izin
                          </button>
                          <button
                            onClick={() => handleSetStatus(student.id, 'alpa')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                              currentStatus === 'alpa'
                                ? 'bg-red-600 text-white shadow-md ring-2 ring-red-300'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            <i className="fas fa-times mr-1"></i>Alpa
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {currentStatus ? (
                          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full ${
                            currentStatus === 'hadir' ? 'bg-green-100 text-green-700' :
                            currentStatus === 'sakit' ? 'bg-yellow-100 text-yellow-700' :
                            currentStatus === 'izin' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            <i className={`fas ${
                              currentStatus === 'hadir' ? 'fa-check-circle' :
                              currentStatus === 'sakit' ? 'fa-thermometer-half' :
                              currentStatus === 'izin' ? 'fa-envelope' :
                              'fa-times-circle'
                            } mr-1`}></i>
                            {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Belum diisi</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
