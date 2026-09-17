import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getStudents, getClasses, getSchoolInfo } from '../data/store';
import { Student, SchoolInfo } from '../types';

export default function QRCard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [school, setSchool] = useState<SchoolInfo>({ name: '', address: '', academicYear: '' });

  useEffect(() => {
    setStudents(getStudents());
    setClasses(getClasses());
    setSchool(getSchoolInfo());
  }, []);

  const filteredStudents = selectedClass
    ? students.filter(s => s.class === selectedClass)
    : students;

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <h2 className="text-xl font-bold text-gray-800">
          <i className="fas fa-qrcode text-blue-600 mr-2"></i>
          Kartu QR Code Siswa
        </h2>
        <div className="flex gap-2">
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kelas</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>Kelas {cls}</option>
            ))}
          </select>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-print mr-2"></i>Cetak Kartu
          </button>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 print:hidden">
        <p className="text-sm text-yellow-800">
          <i className="fas fa-info-circle mr-2"></i>
          Kartu QR Code dibuat secara otomatis untuk setiap siswa. Pilih kelas dan klik "Cetak Kartu" untuk mencetak.
        </p>
      </div>

      {/* QR Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStudents.map(student => (
          <div
            key={student.id}
            className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow"
          >
            <div className="border-b border-gray-200 pb-3 mb-3">
              <p className="text-xs text-gray-500">{school.name}</p>
              <p className="font-bold text-sm text-gray-800 mt-1">{student.name}</p>
              <p className="text-xs text-gray-500">NIS: {student.nis} | Kelas: {student.class}</p>
            </div>
            <div className="flex justify-center py-2">
              <QRCodeSVG
                value={student.qrData}
                size={120}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-400">Scan untuk presensi</p>
              <p className="text-xs font-mono text-gray-600 mt-1">{student.qrData}</p>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <i className="fas fa-qrcode text-5xl text-gray-300 mb-4"></i>
          <p>Belum ada data siswa. Tambahkan siswa terlebih dahulu.</p>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:hidden { display: none !important; }
          .grid, .grid * { visibility: visible; }
          .grid { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 10px !important;
          }
          .grid > div {
            border: 1px solid #000 !important;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
