// Danh mục Phân môn theo Khối lớp chuẩn Bộ Giáo dục & Đào tạo (GDPT 2018) dành cho GVCN

export interface SubSubjectInfo {
  subject: string;
  subSubjects: string[];
}

export const PRIMARY_CURRICULUM_MAP: Record<number, SubSubjectInfo[]> = {
  1: [
    { subject: 'Tiếng Việt', subSubjects: ['Tập đọc (Đọc)', 'Tập viết (Viết)', 'Nói và nghe', 'Ôn tập & Kiểm tra'] },
    { subject: 'Toán', subSubjects: ['Số và Phép tính', 'Hình học và Đo lường', 'Ôn tập & Thực hành'] },
    { subject: 'Tự nhiên và Xã hội', subSubjects: ['Tự nhiên và Xã hội'] },
    { subject: 'Đạo đức', subSubjects: ['Đạo đức'] },
    { subject: 'Âm nhạc', subSubjects: ['Hát', 'Đọc nhạc', 'Nhạc cụ', 'Thưởng thức âm nhạc'] },
    { subject: 'Mĩ thuật', subSubjects: ['Vẽ', 'Tạo hình', 'Thủ công'] },
    { subject: 'Giáo dục thể chất', subSubjects: ['Đội hình đội ngũ', 'Bài tập thể dục', 'Kỹ năng vận động'] },
    { subject: 'Hoạt động trải nghiệm', subSubjects: ['Sinh hoạt dưới cờ (Chào cờ)', 'Hoạt động giáo dục theo chủ đề', 'Sinh hoạt lớp'] }
  ],
  2: [
    { subject: 'Tiếng Việt', subSubjects: ['Tập đọc (Đọc)', 'Chính tả / Viết', 'Luyện từ và câu', 'Nói và nghe', 'Tập làm văn'] },
    { subject: 'Toán', subSubjects: ['Số và Phép tính', 'Hình học và Đo lường', 'Một số yếu tố Thống kê', 'Thực hành trải nghiệm'] },
    { subject: 'Tự nhiên và Xã hội', subSubjects: ['Tự nhiên và Xã hội'] },
    { subject: 'Đạo đức', subSubjects: ['Đạo đức'] },
    { subject: 'Âm nhạc', subSubjects: ['Âm nhạc'] },
    { subject: 'Mĩ thuật', subSubjects: ['Mĩ thuật'] },
    { subject: 'Giáo dục thể chất', subSubjects: ['Giáo dục thể chất'] },
    { subject: 'Hoạt động trải nghiệm', subSubjects: ['Sinh hoạt dưới cờ (Chào cờ)', 'Hoạt động giáo dục theo chủ đề', 'Sinh hoạt lớp'] }
  ],
  3: [
    { subject: 'Tiếng Việt', subSubjects: ['Đọc (Tập đọc)', 'Luyện từ và câu (LTVC)', 'Viết (Tập làm văn)', 'Nói và nghe', 'Góc sáng tạo'] },
    { subject: 'Toán', subSubjects: ['Số và Phép tính', 'Hình học và Đo lường', 'Thống kê & Xác suất', 'Thực hành & Ôn tập'] },
    { subject: 'Tự nhiên và Xã hội', subSubjects: ['Tự nhiên và Xã hội'] },
    { subject: 'Đạo đức', subSubjects: ['Đạo đức'] },
    { subject: 'Tin học và Công nghệ', subSubjects: ['Tin học', 'Công nghệ'] },
    { subject: 'Tiếng Anh', subSubjects: ['Listening', 'Speaking', 'Reading', 'Writing', 'Chung'] },
    { subject: 'Nghệ thuật', subSubjects: ['Âm nhạc', 'Mĩ thuật'] },
    { subject: 'Giáo dục thể chất', subSubjects: ['Giáo dục thể chất'] },
    { subject: 'Hoạt động trải nghiệm', subSubjects: ['Sinh hoạt dưới cờ (Chào cờ)', 'Hoạt động giáo dục theo chủ đề', 'Sinh hoạt lớp'] }
  ],
  4: [
    { subject: 'Tiếng Việt', subSubjects: ['Đọc (Tập đọc)', 'Luyện từ và câu (LTVC)', 'Viết (Tập làm văn)', 'Nói và nghe', 'Góc sáng tạo'] },
    { subject: 'Toán', subSubjects: ['Số và Phép tính', 'Hình học và Đo lường', 'Thống kê & Xác suất', 'Thực hành & Ôn tập'] },
    { subject: 'Khoa học', subSubjects: ['Khoa học'] },
    { subject: 'Lịch sử và Địa lí', subSubjects: ['Lịch sử', 'Địa lí'] },
    { subject: 'Đạo đức', subSubjects: ['Đạo đức'] },
    { subject: 'Tin học và Công nghệ', subSubjects: ['Tin học', 'Công nghệ'] },
    { subject: 'Tiếng Anh', subSubjects: ['Tiếng Anh / Ngoại ngữ'] },
    { subject: 'Nghệ thuật', subSubjects: ['Âm nhạc', 'Mĩ thuật'] },
    { subject: 'Giáo dục thể chất', subSubjects: ['Giáo dục thể chất'] },
    { subject: 'Hoạt động trải nghiệm', subSubjects: ['Sinh hoạt dưới cờ (Chào cờ)', 'Hoạt động giáo dục theo chủ đề', 'Sinh hoạt lớp'] }
  ],
  5: [
    { subject: 'Tiếng Việt', subSubjects: ['Đọc (Tập đọc)', 'Luyện từ và câu (LTVC)', 'Viết (Tập làm văn)', 'Nói và nghe', 'Ôn tập & Đánh giá'] },
    { subject: 'Toán', subSubjects: ['Số và Phép tính', 'Hình học và Đo lường', 'Thống kê & Xác suất', 'Thực hành & Ôn tập'] },
    { subject: 'Khoa học', subSubjects: ['Khoa học'] },
    { subject: 'Lịch sử và Địa lí', subSubjects: ['Lịch sử', 'Địa lí'] },
    { subject: 'Đạo đức', subSubjects: ['Đạo đức'] },
    { subject: 'Tin học và Công nghệ', subSubjects: ['Tin học', 'Công nghệ'] },
    { subject: 'Tiếng Anh', subSubjects: ['Tiếng Anh / Ngoại ngữ'] },
    { subject: 'Nghệ thuật', subSubjects: ['Âm nhạc', 'Mĩ thuật'] },
    { subject: 'Giáo dục thể chất', subSubjects: ['Giáo dục thể chất'] },
    { subject: 'Hoạt động trải nghiệm', subSubjects: ['Sinh hoạt dưới cờ (Chào cờ)', 'Hoạt động giáo dục theo chủ đề', 'Sinh hoạt lớp'] }
  ]
};

// Fallback danh mục phân môn chung cho tất cả các môn
export const COMMON_SUB_SUBJECTS_MAP: Record<string, string[]> = {
  'Tiếng Việt': ['Đọc (Tập đọc)', 'Luyện từ và câu (LTVC)', 'Viết (Tập làm văn)', 'Nói và nghe', 'Góc sáng tạo'],
  'Toán': ['Số và Phép tính', 'Hình học và Đo lường', 'Thống kê & Xác suất', 'Thực hành trải nghiệm'],
  'Lịch sử và Địa lí': ['Lịch sử', 'Địa lí'],
  'Nghệ thuật': ['Âm nhạc', 'Mĩ thuật'],
  'Tin học và Công nghệ': ['Tin học', 'Công nghệ'],
  'Hoạt động trải nghiệm': ['Sinh hoạt dưới cờ (Chào cờ)', 'Hoạt động giáo dục theo chủ đề', 'Sinh hoạt lớp']
};

/**
  Lấy danh sách phân môn dựa theo Khối lớp và Môn học
 */
export function getSubSubjectsByGradeAndSubject(grade: number | string, subjectName: string): string[] {
  const gNum = Number(grade) || 3;
  const gradeConfig = PRIMARY_CURRICULUM_MAP[gNum] || PRIMARY_CURRICULUM_MAP[3];

  const found = gradeConfig.find(
    (item) => item.subject.toLowerCase() === subjectName.trim().toLowerCase()
  );

  if (found && found.subSubjects && found.subSubjects.length > 0) {
    return found.subSubjects;
  }

  // Fallback map
  for (const [key, subs] of Object.entries(COMMON_SUB_SUBJECTS_MAP)) {
    if (subjectName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(subjectName.toLowerCase())) {
      return subs;
    }
  }

  return [];
}
