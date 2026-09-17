import { useState, useEffect, useRef } from 'react';
import { getStudents, addStudent, deleteStudent, importStudents, generateStudentId, getClasses } from '../data/store';
import { Student } from '../types';

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [filterClass, setFilterClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', nis: '', class: '', gender: 'L' as 'L' | 'P' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    setStudents(getStudents());
    setClasses(getClasses());
  }

  function handleAddStudent() {
    if (!formData.name || !formData.nis || !formData.class) {
      alert('Mohon lengkapi semua data!');
      return;
    }
    const newStudent: Student = {
      id: generateStudentId(),
      name: formData.name,
      nis: formData.nis,
      class: formData.class,
      gender: formData.gender,
      qrData: `RH-${formData.nis}`,
    };
    addStudent(newStudent);
    setFormData({ name: '', nis: '', class: '', gender: 'L' });
    setShowForm(false);
    loadData();
  }

  function handleDelete(id: string) {
    if (confirm('Apakah Anda yakin ingin menghapus siswa ini?')) {
      deleteStudent(id);
      loadData();
    }
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim());
        const newStudents: Student[] = [];
        
        // Skip header if exists
        const startIdx = lines[0].includes('nama') || lines[0].includes('NIS') ? 1 : 0;
        
        for (let i = startIdx; i < lines.length; i++) {
          const cols = lines[i].split(/[,\t;]/).map(c => c.trim());
          if (cols.length >= 4) {
            newStudents.push({
              id: generateStudentId() + i.toString(),
              name: cols[0],
              nis: cols[1],
              class: cols[2],
              gender: cols[3].toUpperCase() === 'P' ? 'P' : 'L',
              qrData: `RH-${cols[1]}`,
            });
          }
        }
        
        if (newStudents.length > 0) {
          importStudents(newStudents);
          alert(`Berhasil mengimport ${newStudents.length} siswa!`);
          loadData();
          setShowImport(false);
        } else {
          alert('Tidak ada data yang valid ditemukan dalam file.');
        }
      } catch {
        alert('Gagal membaca file. Pastikan format file benar.');
      }
    };
    reader.readAsText(file);
  }

  const filteredStudents = students.filter(s => {
    const matchClass = !filterClass || s.class === filterClass;
    const matchSearch = !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.nis.includes(searchTerm);
    return matchClass && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">
          <i className="fas fa-users text-blue-600 mr-2"></i>
          Data Siswa
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <i className="fas fa-upload mr-2"></i>Upload Data
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>Tambah Siswa
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cari nama atau NIS..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kelas</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>Kelas {cls}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">NIS</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kelas</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">L/P</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student, index) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{student.nis}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{student.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{student.class}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      student.gender === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                    }`}>
                      {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Hapus"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredStudents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-users text-4xl text-gray-300 mb-3"></i>
            <p>Tidak ada data siswa</p>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Tambah Siswa Baru</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan nama siswa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIS</label>
                <input
                  type="text"
                  value={formData.nis}
                  onChange={e => setFormData({...formData, nis: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nomor Induk Siswa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                <input
                  type="text"
                  value={formData.class}
                  onChange={e => setFormData({...formData, class: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: X-A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                <select
                  value={formData.gender}
                  onChange={e => setFormData({...formData, gender: e.target.value as 'L' | 'P'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleAddStudent}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Upload Data Siswa</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 font-medium mb-2">Format file CSV/TXT:</p>
              <p className="text-xs text-blue-600 font-mono">Nama, NIS, Kelas, L/P</p>
              <p className="text-xs text-blue-600 mt-1">Contoh: Ahmad Fauzi, 2024001, X-A, L</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleImport}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowImport(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
