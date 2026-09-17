import { useEffect, useState } from 'react';
import { getStudents, getSchoolInfo, getAttendance, getClasses } from '../data/store';
import { Student, AttendanceRecord, SchoolInfo } from '../types';

export default function Dashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [school, setSchool] = useState<SchoolInfo>({ name: '', address: '', academicYear: '' });
  const [classes, setClasses] = useState<string[]>([]);

  useEffect(() => {
    setStudents(getStudents());
    setAttendance(getAttendance());
    setSchool(getSchoolInfo());
    setClasses(getClasses());
  }, []);

  const maleStudents = students.filter(s => s.gender === 'L').length;
  const femaleStudents = students.filter(s => s.gender === 'P').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === todayStr);
  const todayHadir = todayAttendance.filter(a => a.status === 'hadir').length;
  const todaySakit = todayAttendance.filter(a => a.status === 'sakit').length;
  const todayIzin = todayAttendance.filter(a => a.status === 'izin').length;
  const todayAlpa = todayAttendance.filter(a => a.status === 'alpa').length;

  // Get top students by attendance
  const studentStats = students.map(s => {
    const records = attendance.filter(a => a.studentId === s.id);
    const hadir = records.filter(a => a.status === 'hadir').length;
    const total = records.length;
    const percentage = total > 0 ? Math.round((hadir / total) * 100) : 0;
    return { ...s, hadir, total, percentage };
  }).sort((a, b) => b.percentage - a.percentage);

  const topStudents = studentStats.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* School Info Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{school.name}</h1>
            <p className="text-blue-100 mt-1">{school.address}</p>
            <p className="text-blue-200 text-sm mt-1">Tahun Ajaran: {school.academicYear}</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
              <p className="text-2xl font-bold">{students.length}</p>
              <p className="text-xs text-blue-100">Total Siswa</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
              <p className="text-2xl font-bold">{classes.length}</p>
              <p className="text-xs text-blue-100">Kelas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-male text-blue-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{maleStudents}</p>
              <p className="text-xs text-gray-500">Siswa Laki-laki</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-female text-pink-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{femaleStudents}</p>
              <p className="text-xs text-gray-500">Siswa Perempuan</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-check-circle text-green-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{todayHadir}</p>
              <p className="text-xs text-gray-500">Hadir Hari Ini</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-times-circle text-red-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{todayAlpa}</p>
              <p className="text-xs text-gray-500">Alpa Hari Ini</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Attendance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fas fa-calendar-day text-blue-600"></i>
            Presensi Hari Ini
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-800">Hadir</span>
              <span className="text-lg font-bold text-green-600">{todayHadir}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium text-yellow-800">Sakit</span>
              <span className="text-lg font-bold text-yellow-600">{todaySakit}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-800">Izin</span>
              <span className="text-lg font-bold text-blue-600">{todayIzin}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium text-red-800">Alpa</span>
              <span className="text-lg font-bold text-red-600">{todayAlpa}</span>
            </div>
          </div>
        </div>

        {/* Top Students */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fas fa-trophy text-yellow-500"></i>
            Peringkat Kehadiran
          </h3>
          <div className="space-y-3">
            {topStudents.length > 0 ? (
              topStudents.map((student, index) => (
                <div key={student.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-blue-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.class} • {student.hadir}x hadir</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">{student.percentage}%</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Belum ada data kehadiran</p>
            )}
          </div>
        </div>
      </div>

      {/* Class Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fas fa-school text-purple-600"></i>
          Ringkasan Per Kelas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(cls => {
            const classStudents = students.filter(s => s.class === cls);
            const classAttendance = attendance.filter(a => 
              classStudents.some(s => s.id === a.studentId) && a.date === todayStr
            );
            return (
              <div key={cls} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-2">Kelas {cls}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-500">Siswa: <span className="font-medium text-gray-700">{classStudents.length}</span></p>
                  <p className="text-gray-500">Hadir: <span className="font-medium text-green-600">{classAttendance.filter(a => a.status === 'hadir').length}</span></p>
                  <p className="text-gray-500">L: <span className="font-medium text-blue-600">{classStudents.filter(s => s.gender === 'L').length}</span></p>
                  <p className="text-gray-500">P: <span className="font-medium text-pink-600">{classStudents.filter(s => s.gender === 'P').length}</span></p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
