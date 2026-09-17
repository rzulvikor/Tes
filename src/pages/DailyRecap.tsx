import { useState, useEffect } from 'react';
import { getStudents, getClasses, getDailyRecap, getHolidays } from '../data/store';
import { Student } from '../types';

export default function DailyRecap() {
  const [classes, setClasses] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [dailyRecap, setDailyRecap] = useState<Record<string, Record<string, string>>>({});
  const [holidays, setHolidays] = useState<string[]>([]);

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  useEffect(() => {
    setClasses(getClasses());
    setHolidays(getHolidays());
  }, []);

  useEffect(() => {
    if (selectedClass) {
      setStudents(getStudents().filter(s => s.class === selectedClass));
      const recap = getDailyRecap(selectedMonth, parseInt(selectedYear), selectedClass);
      setDailyRecap(recap);
      setHolidays(getHolidays());
    }
  }, [selectedClass, selectedMonth, selectedYear]);

  // Get all days in the selected month
  function getDaysInMonth(month: number, year: number): number[] {
    const days: number[] = [];
    const numDays = new Date(year, month, 0).getDate();
    for (let i = 1; i <= numDays; i++) {
      days.push(i);
    }
    return days;
  }

  function getDayOfWeek(day: number): number {
    const date = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, day);
    return date.getDay();
  }

  function isSunday(day: number): boolean {
    return getDayOfWeek(day) === 0;
  }

  function isSaturday(day: number): boolean {
    return getDayOfWeek(day) === 6;
  }

  function isHolidayDate(day: number): boolean {
    const dateStr = `${selectedYear}-${selectedMonth.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return holidays.includes(dateStr);
  }

  function getDateStr(day: number): string {
    return `${selectedYear}-${selectedMonth.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  const days = getDaysInMonth(parseInt(selectedMonth), parseInt(selectedYear));

  // Summary per student
  function getStudentSummary(studentId: string) {
    const studentRecap = dailyRecap[studentId] || {};
    let hadir = 0, sakit = 0, izin = 0, alpa = 0;
    Object.values(studentRecap).forEach(status => {
      if (status === 'hadir') hadir++;
      else if (status === 'sakit') sakit++;
      else if (status === 'izin') izin++;
      else if (status === 'alpa') alpa++;
    });
    const total = hadir + sakit + izin + alpa;
    const percentage = total > 0 ? Math.round((hadir / total) * 100) : 0;
    return { hadir, sakit, izin, alpa, total, percentage };
  }

  const statusColors: Record<string, string> = {
    hadir: 'bg-green-500 text-white',
    sakit: 'bg-yellow-400 text-white',
    izin: 'bg-blue-500 text-white',
    alpa: 'bg-red-500 text-white',
  };

  const statusShort: Record<string, string> = {
    hadir: 'H',
    sakit: 'S',
    izin: 'I',
    alpa: 'A',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">
          <i className="fas fa-calendar-alt text-blue-600 mr-2"></i>
          Rekap Kehadiran Harian
        </h2>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <i className="fas fa-info-circle mr-2"></i>
          Rekap detail kehadiran siswa per hari dalam satu bulan. Setiap cell menunjukkan status kehadiran pada tanggal tertentu.
        </p>
      </div>

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

      {/* Legend */}
      {selectedClass && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Keterangan:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 bg-green-500 text-white rounded flex items-center justify-center text-xs font-bold">H</span>
              <span className="text-xs text-gray-600">Hadir</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 bg-yellow-400 text-white rounded flex items-center justify-center text-xs font-bold">S</span>
              <span className="text-xs text-gray-600">Sakit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 bg-blue-500 text-white rounded flex items-center justify-center text-xs font-bold">I</span>
              <span className="text-xs text-gray-600">Izin</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center text-xs font-bold">A</span>
              <span className="text-xs text-gray-600">Alpa</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">-</span>
              <span className="text-xs text-gray-600">Libur/Minggu</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 bg-gray-100 border border-gray-300 rounded flex items-center justify-center text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-600">Belum diisi</span>
            </div>
          </div>
        </div>
      )}

      {/* Daily Recap Table */}
      {selectedClass && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-800">
              Rekap Harian Kelas {selectedClass} - {months[parseInt(selectedMonth) - 1]} {selectedYear}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="sticky left-0 bg-gray-50 z-10 border-b border-r border-gray-200 px-2 py-2 text-left font-semibold text-gray-600 min-w-[150px]">Nama Siswa</th>
                  {days.map(day => {
                    const isWeekend = isSunday(day) || isSaturday(day);
                    const isHolidayDay = isHolidayDate(day);
                    return (
                      <th 
                        key={day} 
                        className={`border-b border-gray-200 px-1 py-1 text-center font-medium min-w-[32px] ${
                          isWeekend || isHolidayDay ? 'bg-gray-100 text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        <div className="text-[10px]">{dayNames[getDayOfWeek(day)]}</div>
                        <div className="font-bold">{day}</div>
                      </th>
                    );
                  })}
                  <th className="border-b border-l border-gray-200 bg-green-50 px-2 py-2 text-center font-semibold text-green-700 min-w-[36px]">H</th>
                  <th className="border-b border-l border-gray-200 bg-yellow-50 px-2 py-2 text-center font-semibold text-yellow-700 min-w-[36px]">S</th>
                  <th className="border-b border-l border-gray-200 bg-blue-50 px-2 py-2 text-center font-semibold text-blue-700 min-w-[36px]">I</th>
                  <th className="border-b border-l border-gray-200 bg-red-50 px-2 py-2 text-center font-semibold text-red-700 min-w-[36px]">A</th>
                  <th className="border-b border-l border-gray-200 bg-purple-50 px-2 py-2 text-center font-semibold text-purple-700 min-w-[45px]">%</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => {
                  const summary = getStudentSummary(student.id);
                  return (
                    <tr key={student.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="sticky left-0 z-10 border-r border-gray-200 px-2 py-2 font-medium text-gray-800 bg-inherit">
                        <div className="truncate max-w-[140px]" title={student.name}>
                          {student.name}
                        </div>
                      </td>
                      {days.map(day => {
                        const dateStr = getDateStr(day);
                        const status = dailyRecap[student.id]?.[dateStr] || '';
                        const isWeekend = isSunday(day) || isSaturday(day);
                        const isHolidayDay = isHolidayDate(day);
                        
                        return (
                          <td 
                            key={day} 
                            className={`border border-gray-100 px-0.5 py-1 text-center ${
                              isWeekend || isHolidayDay ? 'bg-gray-100' : ''
                            }`}
                          >
                            {status ? (
                              <span className={`inline-flex w-5 h-5 items-center justify-center rounded text-[10px] font-bold ${statusColors[status]}`}>
                                {statusShort[status]}
                              </span>
                            ) : isWeekend || isHolidayDay ? (
                              <span className="text-gray-300 text-[10px]">-</span>
                            ) : (
                              <span className="text-gray-300 text-[10px]">·</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="border-l border-gray-200 px-1 py-2 text-center font-bold text-green-600">{summary.hadir}</td>
                      <td className="border-l border-gray-200 px-1 py-2 text-center font-bold text-yellow-600">{summary.sakit}</td>
                      <td className="border-l border-gray-200 px-1 py-2 text-center font-bold text-blue-600">{summary.izin}</td>
                      <td className="border-l border-gray-200 px-1 py-2 text-center font-bold text-red-600">{summary.alpa}</td>
                      <td className="border-l border-gray-200 px-1 py-2 text-center">
                        <span className={`font-bold ${
                          summary.percentage >= 80 ? 'text-green-600' : 
                          summary.percentage >= 60 ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {summary.percentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {students.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Tidak ada data siswa untuk kelas ini</p>
            </div>
          )}
        </div>
      )}

      {/* Daily Summary per Day */}
      {selectedClass && students.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-800">
              <i className="fas fa-chart-line text-blue-500 mr-2"></i>
              Ringkasan Per Hari
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2 text-left font-semibold text-gray-600">Tanggal</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600">Hari</th>
                  <th className="px-3 py-2 text-center font-semibold text-green-600">Hadir</th>
                  <th className="px-3 py-2 text-center font-semibold text-yellow-600">Sakit</th>
                  <th className="px-3 py-2 text-center font-semibold text-blue-600">Izin</th>
                  <th className="px-3 py-2 text-center font-semibold text-red-600">Alpa</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600">Belum</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600">% Hadir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {days.map(day => {
                  const isWeekend = isSunday(day) || isSaturday(day);
                  const isHolidayDay = isHolidayDate(day);
                  const dateStr = getDateStr(day);
                  
                  let hadir = 0, sakit = 0, izin = 0, alpa = 0;
                  students.forEach(student => {
                    const status = dailyRecap[student.id]?.[dateStr];
                    if (status === 'hadir') hadir++;
                    else if (status === 'sakit') sakit++;
                    else if (status === 'izin') izin++;
                    else if (status === 'alpa') alpa++;
                  });
                  
                  const totalRecorded = hadir + sakit + izin + alpa;
                  const belum = students.length - totalRecorded;
                  const percentage = totalRecorded > 0 ? Math.round((hadir / totalRecorded) * 100) : 0;
                  
                  return (
                    <tr key={day} className={`hover:bg-gray-50 ${isWeekend || isHolidayDay ? 'bg-gray-50 text-gray-400' : ''}`}>
                      <td className="px-3 py-2 font-medium">{day}</td>
                      <td className="px-3 py-2">
                        {isHolidayDay ? (
                          <span className="text-orange-500 font-medium">Libur</span>
                        ) : isWeekend ? (
                          <span className="text-gray-400">{dayNames[getDayOfWeek(day)]}</span>
                        ) : (
                          <span>{dayNames[getDayOfWeek(day)]}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center font-bold text-green-600">{hadir}</td>
                      <td className="px-3 py-2 text-center font-bold text-yellow-600">{sakit}</td>
                      <td className="px-3 py-2 text-center font-bold text-blue-600">{izin}</td>
                      <td className="px-3 py-2 text-center font-bold text-red-600">{alpa}</td>
                      <td className="px-3 py-2 text-center text-gray-500">{belum}</td>
                      <td className="px-3 py-2 text-center">
                        {totalRecorded > 0 ? (
                          <span className={`font-bold ${
                            percentage >= 80 ? 'text-green-600' : 
                            percentage >= 60 ? 'text-yellow-600' : 
                            'text-red-600'
                          }`}>
                            {percentage}%
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!selectedClass && (
        <div className="text-center py-12 text-gray-500">
          <i className="fas fa-calendar-alt text-5xl text-gray-300 mb-4"></i>
          <p>Pilih kelas untuk melihat rekap kehadiran harian</p>
        </div>
      )}
    </div>
  );
}
