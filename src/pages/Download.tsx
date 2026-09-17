import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { getStudents, getClasses, getMonthlyRecap, getSchoolInfo } from '../data/store';
import { Student, SchoolInfo } from '../types';

export default function Download() {
  const [classes, setClasses] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [school, setSchool] = useState<SchoolInfo>({ name: '', address: '', academicYear: '' });
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
    setSchool(getSchoolInfo());
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const recapData = getMonthlyRecap(selectedMonth, parseInt(selectedYear), selectedClass);
      setRecap(recapData);
    }
  }, [selectedClass, selectedMonth, selectedYear]);

  const classStudents = students.filter(s => s.class === selectedClass);

  function generateData() {
    return classStudents.map((student, index) => {
      const r = recap[student.id] || { hadir: 0, sakit: 0, izin: 0, alpa: 0 };
      const total = r.hadir + r.sakit + r.izin + r.alpa;
      const percentage = total > 0 ? Math.round((r.hadir / total) * 100) : 0;
      return {
        no: index + 1,
        nis: student.nis,
        nama: student.name,
        kelas: student.class,
        'jenis_kelamin': student.gender === 'L' ? 'Laki-laki' : 'Perempuan',
        hadir: r.hadir,
        sakit: r.sakit,
        izin: r.izin,
        alpa: r.alpa,
        total_pertemuan: total,
        persentase_kehadiran: `${percentage}%`,
      };
    });
  }

  function downloadExcel() {
    if (!selectedClass) {
      alert('Pilih kelas terlebih dahulu!');
      return;
    }
    const data = generateData();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Kehadiran');
    
    // Set column widths
    ws['!cols'] = [
      { wch: 5 }, { wch: 12 }, { wch: 25 }, { wch: 8 }, { wch: 12 },
      { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 15 }, { wch: 18 }
    ];
    
    XLSX.writeFile(wb, `Rekap_Kehadiran_${selectedClass}_${months[parseInt(selectedMonth) - 1]}_${selectedYear}.xlsx`);
  }

  function downloadCSV() {
    if (!selectedClass) {
      alert('Pilih kelas terlebih dahulu!');
      return;
    }
    const data = generateData();
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Rekap_Kehadiran_${selectedClass}_${months[parseInt(selectedMonth) - 1]}_${selectedYear}.csv`;
    link.click();
  }

  function downloadPDF() {
    if (!selectedClass) {
      alert('Pilih kelas terlebih dahulu!');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(14);
    doc.text(school.name, pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(school.address, pageWidth / 2, 27, { align: 'center' });
    doc.line(20, 32, pageWidth - 20, 32);
    
    // Title
    doc.setFontSize(12);
    doc.text('REKAP KEHADIRAN SISWA', pageWidth / 2, 42, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Kelas: ${selectedClass} | Bulan: ${months[parseInt(selectedMonth) - 1]} ${selectedYear}`, pageWidth / 2, 50, { align: 'center' });
    
    // Table
    const startY = 60;
    const colWidths = [10, 25, 50, 15, 15, 15, 15, 15, 20];
    const headers = ['No', 'NIS', 'Nama', 'Hadir', 'Sakit', 'Izin', 'Alpa', 'Total', '%'];
    
    // Draw headers
    doc.setFontSize(8);
    doc.setFillColor(240, 240, 240);
    let x = 20;
    let y = startY;
    
    colWidths.forEach((w, i) => {
      doc.rect(x, y, w, 8, 'F');
      doc.text(headers[i], x + w / 2, y + 5, { align: 'center' });
      x += w;
    });
    
    // Draw data rows
    y += 8;
    classStudents.forEach((student, index) => {
      const r = recap[student.id] || { hadir: 0, sakit: 0, izin: 0, alpa: 0 };
      const total = r.hadir + r.sakit + r.izin + r.alpa;
      const percentage = total > 0 ? Math.round((r.hadir / total) * 100) : 0;
      
      const rowData = [
        (index + 1).toString(),
        student.nis,
        student.name,
        r.hadir.toString(),
        r.sakit.toString(),
        r.izin.toString(),
        r.alpa.toString(),
        total.toString(),
        `${percentage}%`
      ];
      
      x = 20;
      rowData.forEach((cell, i) => {
        doc.rect(x, y, colWidths[i], 7);
        const align = i === 2 ? 'left' : 'center';
        const textX = i === 2 ? x + 2 : x + colWidths[i] / 2;
        doc.text(cell, textX, y + 5, { align: i === 2 ? 'left' : 'center' });
        x += colWidths[i];
      });
      y += 7;
    });
    
    // Footer
    y += 15;
    doc.setFontSize(9);
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 20, y);
    
    doc.save(`Rekap_Kehadiran_${selectedClass}_${months[parseInt(selectedMonth) - 1]}_${selectedYear}.pdf`);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">
        <i className="fas fa-download text-blue-600 mr-2"></i>
        Unduh Laporan Kehadiran
      </h2>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <i className="fas fa-info-circle mr-2"></i>
          Unduh laporan kehadiran siswa dalam format Excel (.xlsx), CSV, atau PDF.
          File akan otomatis tersimpan di folder download.
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

      {/* Download Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={downloadExcel}
          disabled={!selectedClass}
          className="bg-green-600 text-white rounded-xl p-6 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center"
        >
          <i className="fas fa-file-excel text-4xl mb-3"></i>
          <p className="font-bold text-lg">Excel (.xlsx)</p>
          <p className="text-sm text-green-100 mt-1">Format spreadsheet yang bisa diedit</p>
        </button>
        <button
          onClick={downloadCSV}
          disabled={!selectedClass}
          className="bg-blue-600 text-white rounded-xl p-6 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center"
        >
          <i className="fas fa-file-csv text-4xl mb-3"></i>
          <p className="font-bold text-lg">CSV</p>
          <p className="text-sm text-blue-100 mt-1">Format data universal</p>
        </button>
        <button
          onClick={downloadPDF}
          disabled={!selectedClass}
          className="bg-red-600 text-white rounded-xl p-6 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center"
        >
          <i className="fas fa-file-pdf text-4xl mb-3"></i>
          <p className="font-bold text-lg">PDF</p>
          <p className="text-sm text-red-100 mt-1">Siap cetak dengan tata letak rapi</p>
        </button>
      </div>

      {/* Preview */}
      {selectedClass && classStudents.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">
              Preview: Kelas {selectedClass} - {months[parseInt(selectedMonth) - 1]} {selectedYear}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">NIS</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Nama</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-green-600">H</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-yellow-600">S</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-blue-600">I</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-red-600">A</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {classStudents.map((student, index) => {
                  const r = recap[student.id] || { hadir: 0, sakit: 0, izin: 0, alpa: 0 };
                  const total = r.hadir + r.sakit + r.izin + r.alpa;
                  const percentage = total > 0 ? Math.round((r.hadir / total) * 100) : 0;
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-4 py-2 text-sm text-gray-800">{student.nis}</td>
                      <td className="px-4 py-2 text-sm text-gray-800">{student.name}</td>
                      <td className="px-4 py-2 text-sm text-center text-green-600 font-medium">{r.hadir}</td>
                      <td className="px-4 py-2 text-sm text-center text-yellow-600 font-medium">{r.sakit}</td>
                      <td className="px-4 py-2 text-sm text-center text-blue-600 font-medium">{r.izin}</td>
                      <td className="px-4 py-2 text-sm text-center text-red-600 font-medium">{r.alpa}</td>
                      <td className="px-4 py-2 text-sm text-center font-medium">{percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
