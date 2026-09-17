import { Student, AttendanceRecord, SchoolInfo } from '../types';

const STUDENTS_KEY = 'ruanghadir_students';
const ATTENDANCE_KEY = 'ruanghadir_attendance';
const SCHOOL_KEY = 'ruanghadir_school';

// Sample data
const sampleStudents: Student[] = [
  { id: '1', name: 'Ahmad Fauzi', nis: '2024001', class: 'X-A', gender: 'L', qrData: 'RH-2024001' },
  { id: '2', name: 'Siti Nurhaliza', nis: '2024002', class: 'X-A', gender: 'P', qrData: 'RH-2024002' },
  { id: '3', name: 'Budi Santoso', nis: '2024003', class: 'X-A', gender: 'L', qrData: 'RH-2024003' },
  { id: '4', name: 'Dewi Lestari', nis: '2024004', class: 'X-A', gender: 'P', qrData: 'RH-2024004' },
  { id: '5', name: 'Eko Prasetyo', nis: '2024005', class: 'X-A', gender: 'L', qrData: 'RH-2024005' },
  { id: '6', name: 'Fitriani Rahma', nis: '2024006', class: 'X-B', gender: 'P', qrData: 'RH-2024006' },
  { id: '7', name: 'Gilang Ramadhan', nis: '2024007', class: 'X-B', gender: 'L', qrData: 'RH-2024007' },
  { id: '8', name: 'Hana Pertiwi', nis: '2024008', class: 'X-B', gender: 'P', qrData: 'RH-2024008' },
  { id: '9', name: 'Irfan Hakim', nis: '2024009', class: 'X-B', gender: 'L', qrData: 'RH-2024009' },
  { id: '10', name: 'Jasmine Aulia', nis: '2024010', class: 'X-B', gender: 'P', qrData: 'RH-2024010' },
];

const defaultSchool: SchoolInfo = {
  name: 'SMA Negeri 1 Jakarta',
  address: 'Jl. Pendidikan No. 1, Jakarta',
  academicYear: '2024/2025',
};

function initializeData() {
  if (!localStorage.getItem(STUDENTS_KEY)) {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(sampleStudents));
  }
  if (!localStorage.getItem(SCHOOL_KEY)) {
    localStorage.setItem(SCHOOL_KEY, JSON.stringify(defaultSchool));
  }
  if (!localStorage.getItem(ATTENDANCE_KEY)) {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify([]));
  }
}

initializeData();

export function getStudents(): Student[] {
  const data = localStorage.getItem(STUDENTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getStudentsByClass(className: string): Student[] {
  return getStudents().filter(s => s.class === className);
}

export function addStudent(student: Student): void {
  const students = getStudents();
  students.push(student);
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
}

export function updateStudent(student: Student): void {
  const students = getStudents();
  const index = students.findIndex(s => s.id === student.id);
  if (index !== -1) {
    students[index] = student;
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  }
}

export function deleteStudent(id: string): void {
  const students = getStudents().filter(s => s.id !== id);
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
}

export function importStudents(students: Student[]): void {
  const existing = getStudents();
  const merged = [...existing, ...students];
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(merged));
}

export function getAttendance(): AttendanceRecord[] {
  const data = localStorage.getItem(ATTENDANCE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getAttendanceByDate(date: string): AttendanceRecord[] {
  return getAttendance().filter(a => a.date === date);
}

export function getAttendanceByStudent(studentId: string): AttendanceRecord[] {
  return getAttendance().filter(a => a.studentId === studentId);
}

export function getAttendanceByDateAndClass(date: string, className: string): AttendanceRecord[] {
  const students = getStudentsByClass(className);
  const studentIds = students.map(s => s.id);
  return getAttendance().filter(a => a.date === date && studentIds.includes(a.studentId));
}

export function setAttendance(studentId: string, date: string, status: 'hadir' | 'sakit' | 'izin' | 'alpa'): boolean {
  const attendance = getAttendance();
  const existingIndex = attendance.findIndex(a => a.studentId === studentId && a.date === date);
  
  if (existingIndex !== -1) {
    return false; // Already recorded - prevent double attendance
  }
  
  const record: AttendanceRecord = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    studentId,
    date,
    status,
    timestamp: new Date().toISOString(),
  };
  
  attendance.push(record);
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance));
  return true;
}

export function getSchoolInfo(): SchoolInfo {
  const data = localStorage.getItem(SCHOOL_KEY);
  return data ? JSON.parse(data) : defaultSchool;
}

export function updateSchoolInfo(info: SchoolInfo): void {
  localStorage.setItem(SCHOOL_KEY, JSON.stringify(info));
}

export function getClasses(): string[] {
  const students = getStudents();
  const classes = [...new Set(students.map(s => s.class))];
  return classes.sort();
}

export function getMonthlyRecap(month: string, year: number, className: string): Record<string, { hadir: number; sakit: number; izin: number; alpa: number }> {
  const students = getStudentsByClass(className);
  const attendance = getAttendance();
  const recap: Record<string, { hadir: number; sakit: number; izin: number; alpa: number }> = {};
  
  students.forEach(student => {
    const studentAttendance = attendance.filter(a => {
      if (a.studentId !== student.id) return false;
      const d = new Date(a.date);
      return (d.getMonth() + 1) === parseInt(month) && d.getFullYear() === year;
    });
    
    recap[student.id] = {
      hadir: studentAttendance.filter(a => a.status === 'hadir').length,
      sakit: studentAttendance.filter(a => a.status === 'sakit').length,
      izin: studentAttendance.filter(a => a.status === 'izin').length,
      alpa: studentAttendance.filter(a => a.status === 'alpa').length,
    };
  });
  
  return recap;
}

export function isHoliday(date: string): boolean {
  const holidays = JSON.parse(localStorage.getItem('ruanghadir_holidays') || '[]');
  return holidays.includes(date);
}

export function setHoliday(date: string): void {
  const holidays = JSON.parse(localStorage.getItem('ruanghadir_holidays') || '[]');
  if (!holidays.includes(date)) {
    holidays.push(date);
    localStorage.setItem('ruanghadir_holidays', JSON.stringify(holidays));
  }
}

export function removeHoliday(date: string): void {
  const holidays = JSON.parse(localStorage.getItem('ruanghadir_holidays') || '[]');
  const filtered = holidays.filter((h: string) => h !== date);
  localStorage.setItem('ruanghadir_holidays', JSON.stringify(filtered));
}

export function getHolidays(): string[] {
  return JSON.parse(localStorage.getItem('ruanghadir_holidays') || '[]');
}

export function generateStudentId(): string {
  const students = getStudents();
  const maxId = students.reduce((max, s) => Math.max(max, parseInt(s.id) || 0), 0);
  return (maxId + 1).toString();
}
