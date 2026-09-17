export interface Student {
  id: string;
  name: string;
  nis: string;
  class: string;
  gender: 'L' | 'P';
  qrData: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'hadir' | 'sakit' | 'izin' | 'alpa';
  timestamp: string;
}

export interface SchoolInfo {
  name: string;
  address: string;
  academicYear: string;
}

export type AttendanceStatus = 'hadir' | 'sakit' | 'izin' | 'alpa';
