import { SchoolConfig, PpctItem, TimetableSlot } from '../types';

export const defaultSchoolConfig: SchoolConfig = {
  schoolName: 'TRƯỜNG TIỂU HỌC THẠNH YÊN 1',
  departmentName: 'TỔ CHUYÊN MÔN 4+5',
  republicTitleTop: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
  republicTitleSub: 'Độc lập – Tự do – Hạnh phúc',
  documentTitle: 'KẾ HOẠCH DẠY HỌC',
  subjectTitle: 'MÔN: TIN HỌC - CÔNG NGHỆ',
  academicYear: 'Năm học 2024 - 2025',
  startDateWeek1: '2024-09-09',
  location: 'Vĩnh Hòa',
  principalTitle: 'DUYỆT CỦA P.HIỆU TRƯỜNG',
  principalName: '',
  headTeacherTitle: 'TỔ TRƯỞNG',
  headTeacherName: '',
  teacherTitle: 'GIÁO VIÊN',
  teacherName: 'Nguyễn Tấn Luận'
};

export const defaultPpctList: PpctItem[] = [];

export const defaultTimetable: TimetableSlot[] = [
  // Thứ Hai
  { id: 't-2-m1', dayOfWeek: 2, session: 'morning', period: 1, className: 'Chào cờ', subject: 'Chào cờ', grade: 0 },
  { id: 't-2-m2', dayOfWeek: 2, session: 'morning', period: 2, className: '3A1', subject: 'Tin học', grade: 3 },
  { id: 't-2-m3', dayOfWeek: 2, session: 'morning', period: 3, className: '3A2', subject: 'Tin học', grade: 3 },
  { id: 't-2-m4', dayOfWeek: 2, session: 'morning', period: 4, className: '4A1', subject: 'Tin học', grade: 4 },

  // Thứ Ba
  { id: 't-3-m1', dayOfWeek: 3, session: 'morning', period: 1, className: '5A1', subject: 'Tin học', grade: 5 },
  { id: 't-3-m2', dayOfWeek: 3, session: 'morning', period: 2, className: '5A2', subject: 'Tin học', grade: 5 },
  { id: 't-3-m3', dayOfWeek: 3, session: 'morning', period: 3, className: '4A2', subject: 'Tin học', grade: 4 },
  { id: 't-3-a1', dayOfWeek: 3, session: 'afternoon', period: 1, className: '3A1', subject: 'Tin học', grade: 3 },
  { id: 't-3-a2', dayOfWeek: 3, session: 'afternoon', period: 2, className: '3A2', subject: 'Tin học', grade: 3 },

  // Thứ Tư
  { id: 't-4-m1', dayOfWeek: 4, session: 'morning', period: 1, className: '4A1', subject: 'Tin học', grade: 4 },
  { id: 't-4-m2', dayOfWeek: 4, session: 'morning', period: 2, className: '4A2', subject: 'Tin học', grade: 4 },
  { id: 't-4-m3', dayOfWeek: 4, session: 'morning', period: 3, className: '5A1', subject: 'Tin học', grade: 5 },

  // Thứ Năm
  { id: 't-5-m1', dayOfWeek: 5, session: 'morning', period: 1, className: '5A2', subject: 'Tin học', grade: 5 },
  { id: 't-5-m2', dayOfWeek: 5, session: 'morning', period: 2, className: '3A1', subject: 'Tin học', grade: 3 },
  { id: 't-5-m3', dayOfWeek: 5, session: 'morning', period: 3, className: '4A1', subject: 'Tin học', grade: 4 },

  // Thứ Sáu
  { id: 't-6-m1', dayOfWeek: 6, session: 'morning', period: 1, className: '5A1', subject: 'Tin học', grade: 5 },
  { id: 't-6-m2', dayOfWeek: 6, session: 'morning', period: 2, className: '5A2', subject: 'Tin học', grade: 5 },
  { id: 't-6-m3', dayOfWeek: 6, session: 'morning', period: 3, className: 'Sinh hoạt lớp', subject: 'Sinh hoạt lớp', grade: 0 }
];
