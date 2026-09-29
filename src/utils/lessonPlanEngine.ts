import { DetailedLessonPlan, PeriodPlan, PpctItem } from '../types';
import { getWeekDateRange } from './dateUtils';
import { cleanLessonTitle } from './helpers';

export function normalizeForPpctMatch(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\(tiết\s*\d+.*?\)/gi, '')
    .replace(/tiết\s*\d+/gi, '')
    .replace(/bài\s*\d*[:\.]?/gi, '')
    .replace(/y/g, 'i')
    .replace(/[^a-z0-9\u00C0-\u1EF9]/gi, '');
}

export const SYSTEM_INSTRUCTION_CONG_VAN_2345 = `
Bạn là chuyên gia thiết kế Kế hoạch bài dạy (Giáo án) Tiểu học hàng đầu tại Việt Nam.
Nhiệm vụ của bạn là soạn Kế hoạch bài dạy (Giáo án) CHUẨN ĐÚNG 100% ĐỊNH DẠNG CÔNG VĂN 2345/BGDĐT-GDTH của Bộ Giáo dục và Đào tạo.

BẮT BUỘC TUÂN THỦ CHẶT CHẼ CÁC QUY ĐỊNH SAU:

I. CẤU TRÚC GIÁO ÁN MỖI TIẾT HỌC
Mỗi tiết học trong Kế hoạch bài dạy BẮT BUỘC có đủ 3 phần chính theo Công văn 2345:

I. YÊU CẦU CẦN ĐẠT
1. Năng lực đặc thù: Các năng lực gắn liền với môn học (mã hóa cụ thể các yêu cầu kiến thức, kỹ năng bài dạy).
2. Năng lực chung:
   - Tự chủ và tự học: Tự giác tìm hiểu bài học, thực hiện các nhiệm vụ học tập.
   - Giao tiếp và hợp tác: Tích cực thảo luận nhóm, chia sẻ và giúp đỡ bạn.
   - Giải quyết vấn đề và sáng tạo: Biết vận dụng kiến thức bài học xử lý tình huống.
3. Phẩm chất:
   - Chăm chỉ, Trung thực, Trách nhiệm.
4. Nội dung Tích hợp (nếu người dùng yêu cầu):
   - Năng lực số (CV 3456): Đưa các mã chỉ báo cụ thể như [1.3.CB1a], [2.1.CB2a], [4.1.TC1a]...
   - Giáo dục STEM (CV 909): Đưa đầy đủ 4 pha STEM (Pha 1: Xác định vấn đề; Pha 2: Nghiên cứu kiến thức nền; Pha 3: Chế tạo & thử nghiệm; Pha 4: Trưng bày & đánh giá).
   - Giáo dục Công dân số (CV 3899 & SGK Hành trình CĐS Lớp 1-5): Trích dẫn bài học phù hợp và tình huống ứng xử số văn minh.

II. ĐỒ DÙNG DẠY HỌC
1. Giáo viên: SGK, máy tính, tivi/máy chiếu, bài giảng điện tử, phiếu học tập, thiết bị/vật liệu dạy học.
2. Học sinh: SGK, vở ghi, đồ dùng học tập, dụng cụ thực hành.

III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU
Mỗi tiết học bắt buộc gồm đúng 4 hoạt động chuẩn Công văn 2345:
1. HOẠT ĐỘNG KHỞI ĐỘNG (5 phút)
2. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC MỚI (15 phút)
3. HOẠT ĐỘNG LUYỆN TẬP - THỰC HÀNH (10 phút)
4. HOẠT ĐỘNG VẬN DỤNG - TRẢI NGHIỆM (5 phút)

QUY ĐỊNH BẮT BUỘC VỀ TRÌNH BÀY HOẠT ĐỘNG:
- Mỗi Hoạt động được chia thành các Nhiệm vụ cụ thể (* Nhiệm vụ 1, * Nhiệm vụ 2...).
- Mỗi Nhiệm vụ BẮT BUỘC trình bày đủ 4 BƯỚC SƯ PHẠM QUY CHUẨN:
  + Bước 1: Chuyển giao nhiệm vụ (GV giao nhiệm vụ cụ thể, rõ ràng, nêu yêu cầu).
  + Bước 2: Thực hiện nhiệm vụ (HS cá nhân/cặp đôi/nhóm thực hiện, GV theo dõi, hỗ trợ).
  + Bước 3: Báo cáo kết quả (Đại diện HS/nhóm trình bày, lớp lắng nghe, nhận xét).
  + Bước 4: Đánh giá, kết luận (GV nhận xét, chuẩn hóa kiến thức và chốt nội dung trọng tâm).

- Mọi hành động của GV và HS phải diễn giải CỰC KỲ CHI TIẾT, BÁM SÁT TÊN BÀI HỌC VÀ NỘI DUNG SGK/TỆP ĐÍNH KÈM.
- KHÔNG dùng câu mẫu chung chung hay lặp lại. Nếu có tệp đính kèm (ảnh/PDF SGK), PHẢI trích xuất và phân tích toàn bộ bài tập, hình ảnh, văn bản trong tệp đó vào nội dung hoạt động.

IV. QUY ĐỊNH BẮT BUỘC VỀ TIÊU ĐỀ BÀI HỌC:
1. Tên bài dạy / Tiêu đề ("title", "topic") BẮT BUỘC viết TRỰC TIẾP, NGẮN GỌN TÊN BÀI HỌC (Ví dụ: "Bài 1: Cổng trường mở ra (Tiết 1)", "Bài 1: Tìm hiểu cách viết bài văn kể chuyện sáng tạo").
2. TUYỆT ĐỐI KHÔNG chèn tên môn hay tiền tố phân môn như "Tiếng Việt (Phân môn: ...)", "Môn Tiếng Việt - ", "Phân môn: ..." vào trước tiêu đề bài dạy.
3. NỘI DUNG DẠY HỌC MỖI TIẾT HỌC PHẢI BÁM SÁT ĐÚNG 100% YÊU CẦU NỘI DUNG VÀ YÊU CẦU CẦN ĐẠT CỦA PHÂN MÔN TRONG PPCT.
`;

export function buildLessonPlanPrompt(params: {
  topic: string;
  grade: string;
  subject: string;
  totalPeriods: number;
  bookSeries: string;
  weekNumber: number;
  timeRange: string;
  ppctPeriodsText?: string;
  integrationOptions: { nls: boolean; stem: boolean; cds: boolean };
  hasAttachedFiles?: boolean;
}): string {
  const { topic, grade, subject, totalPeriods, bookSeries, weekNumber, timeRange, ppctPeriodsText, integrationOptions, hasAttachedFiles } = params;
  return `
YÊU CẦU SOẠN KẾ HOẠCH BÀI DẠY (GIÁO ÁN) CÔNG VĂN 2345/BGDĐT-GDTH:

- Tên bài dạy / chủ đề: "${topic}"
- Môn học: ${subject}
- Khối lớp: Lớp ${grade}
- Bộ sách: ${bookSeries}
- Tổng số tiết: ${totalPeriods} tiết
- Tuần theo PPCT: TUẦN ${weekNumber}
- Tiết theo PPCT: ${ppctPeriodsText || `Tiết 1 - ${totalPeriods} theo PPCT`}
- Thời gian thực hiện: ${timeRange}
- Tùy chọn Tích hợp:
  + Năng lực số (CV 3456): ${integrationOptions.nls ? 'CÓ' : 'KHÔNG'}
  + Giáo dục STEM (CV 909): ${integrationOptions.stem ? 'CÓ' : 'KHÔNG'}
  + Công dân số (CV 3899): ${integrationOptions.cds ? 'CÓ' : 'KHÔNG'}

${hasAttachedFiles ? 'LƯU Ý BẮT BUỘC: Đã có tệp hình ảnh/PDF trang sách đính kèm. Bạn BẮT BUỘC phải đọc kỹ nội dung trang sách để trích xuất toàn bộ bài đọc, câu hỏi, bài tập thực tế vào giáo án!' : ''}

Nhiệm vụ: Hãy sinh đầy đủ ${totalPeriods} tiết học. Mỗi tiết học BẮT BUỘC tuân thủ đúng cấu trúc Công văn 2345 (I. Yêu cầu cần đạt, II. Đồ dùng dạy học, III. Các hoạt động dạy học gồm 4 hoạt động, mỗi hoạt động gồm các bước sư phạm 1-4 cực kỳ chi tiết).

Trả về DUY NHẤT một đối tượng JSON hợp lệ theo cấu trúc chuẩn:
{
  "topic": "${topic} (${totalPeriods} tiết)",
  "subject": "${subject}",
  "grade": "${grade}",
  "totalPeriods": ${totalPeriods},
  "bookSeries": "${bookSeries}",
  "weekNumber": ${weekNumber},
  "timeRange": "${timeRange}",
  "ppctPeriodsText": "${ppctPeriodsText || ''}",
  "periodPlans": [
    {
      "periodIndex": 1,
      "subSubject": "${subject.includes('Tiếng Việt') ? 'Đọc' : ''}",
      "lessonTitle": "Tên bài dạy của riêng tiết 1",
      "weekNumber": ${weekNumber},
      "ppctPeriodIndex": 1,
      "ppctPeriodsText": "Tiết 1 (Tuần ${weekNumber}) theo PPCT",
      "timeRange": "${timeRange}",
      "header": {
        "subject": "${subject}",
        "grade": "${grade}",
        "title": "${topic} (${totalPeriods} tiết)",
        "subSubject": "${subject.includes('Tiếng Việt') ? 'Đọc' : ''}",
        "lessonTitle": "Tên bài dạy tiết 1",
        "timeRange": "${timeRange}",
        "weekNumber": ${weekNumber}
      },
      "objectives": {
        "specificCompetencies": ["Nêu các yêu cầu cần đạt về kiến thức, kỹ năng bài ${topic}"],
        "generalCompetencies": [
          "Tự chủ và tự học: Tự giác tìm hiểu bài học, chủ động hoàn thành nhiệm vụ.",
          "Giao tiếp và hợp tác: Tích cực thảo luận nhóm, chia sẻ cùng bạn.",
          "Giải quyết vấn đề và sáng tạo: Biết vận dụng kiến thức xử lý tình huống."
        ],
        "qualities": [
          "Chăm chỉ: Tích cực tham gia các hoạt động học tập.",
          "Trung thực: Thật thà trong học tập và đánh giá.",
          "Trách nhiệm: Có ý thức bảo vệ tài sản, đồ dùng học tập."
        ],
        "integrationContent": [
          "${integrationOptions.nls ? '[NLS CV 3456] Ứng dụng công nghệ và khai thác tư liệu học tập số an toàn' : ''}",
          "${integrationOptions.stem ? '[STEM CV 909] Vận dụng kiến thức liên môn giải quyết vấn đề thực tiễn' : ''}",
          "${integrationOptions.cds ? '[CĐS CV 3899] SGK Hành trình CĐS Lớp ' + grade + ': Ứng xử an toàn, văn minh' : ''}"
        ].filter(Boolean)
      },
      "teachingTools": {
        "teacher": ["SGK, bài giảng điện tử, tivi/máy chiếu, phiếu học tập, đồ dùng dạy học."],
        "student": ["SGK, vở ghi, đồ dùng học tập, dụng cụ thực hành."]
      },
      "activities": [
        {
          "activityNumber": 1,
          "activityName": "1. HOẠT ĐỘNG KHỞI ĐỘNG (5 phút)",
          "timeEstimate": "5 phút",
          "integrationNote": "${integrationOptions.stem ? '[STEM - Pha 1: Xác định vấn đề thực tiễn]' : ''}",
          "tasks": [
            {
              "taskId": "task-1-1-1",
              "taskTitle": "* Nhiệm vụ 1: Khởi động và tạo hứng thú học tập",
              "steps": [
                {
                  "stepNumber": 1,
                  "stepName": "Bước 1: Chuyển giao nhiệm vụ",
                  "teacherAction": "GV tổ chức trò chơi hoặc câu hỏi gợi mở tạo không khí sôi nổi...",
                  "studentAction": "HS tham gia trò chơi, trả lời câu hỏi và hướng vào bài học..."
                },
                {
                  "stepNumber": 2,
                  "stepName": "Bước 2: Thực hiện nhiệm vụ",
                  "teacherAction": "GV bao quát, hướng dẫn học sinh thao tác...",
                  "studentAction": "HS lắng nghe, trao đổi nhanh theo cặp đôi..."
                },
                {
                  "stepNumber": 3,
                  "stepName": "Bước 3: Báo cáo kết quả",
                  "teacherAction": "GV mời đại diện HS chia sẻ cảm nghĩ / kết quả...",
                  "studentAction": "HS tự tin phát biểu trước lớp..."
                },
                {
                  "stepNumber": 4,
                  "stepName": "Bước 4: Đánh giá, kết luận",
                  "teacherAction": "GV nhận xét, dẫn dắt vào bài mới ${topic}...",
                  "studentAction": "HS chú ý lắng nghe và mở SGK bài học..."
                }
              ]
            }
          ]
        },
        {
          "activityNumber": 2,
          "activityName": "2. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC MỚI (15 phút)",
          "timeEstimate": "15 phút",
          "integrationNote": "${integrationOptions.nls ? '[NLS CV 3456: Khai thác dữ liệu số]' : ''}",
          "tasks": [
            {
              "taskId": "task-1-2-1",
              "taskTitle": "* Nhiệm vụ 1: Khám phá kiến thức trọng tâm bài học",
              "steps": [
                {
                  "stepNumber": 1,
                  "stepName": "Bước 1: Chuyển giao nhiệm vụ",
                  "teacherAction": "GV yêu cầu HS quan sát SGK, làm việc nhóm...",
                  "studentAction": "HS tiếp nhận nhiệm vụ và mở SGK..."
                },
                {
                  "stepNumber": 2,
                  "stepName": "Bước 2: Thực hiện nhiệm vụ",
                  "teacherAction": "GV đi tới các nhóm gợi mở và hỗ trợ...",
                  "studentAction": "HS thảo luận nhóm, ghi chép vào phiếu học tập..."
                },
                {
                  "stepNumber": 3,
                  "stepName": "Bước 3: Báo cáo kết quả",
                  "teacherAction": "GV mời đại diện nhóm trình bày...",
                  "studentAction": "Đại diện nhóm đứng dậy báo cáo chi tiết..."
                },
                {
                  "stepNumber": 4,
                  "stepName": "Bước 4: Đánh giá, kết luận",
                  "teacherAction": "GV chuẩn hóa kiến thức và chốt nội dung...",
                  "studentAction": "HS lắng nghe và ghi nhớ kiến thức trọng tâm..."
                }
              ]
            }
          ]
        },
        {
          "activityNumber": 3,
          "activityName": "3. HOẠT ĐỘNG LUYỆN TẬP - THỰC HÀNH (10 phút)",
          "timeEstimate": "10 phút",
          "tasks": [
            {
              "taskId": "task-1-3-1",
              "taskTitle": "* Nhiệm vụ 1: Giải bài tập thực hành trong SGK",
              "steps": [
                {
                  "stepNumber": 1,
                  "stepName": "Bước 1: Chuyển giao nhiệm vụ",
                  "teacherAction": "GV giao bài tập thực hành...",
                  "studentAction": "HS đọc đề và làm việc cá nhân / nhóm..."
                },
                {
                  "stepNumber": 2,
                  "stepName": "Bước 2: Thực hiện nhiệm vụ",
                  "teacherAction": "GV theo dõi và uốn nắn...",
                  "studentAction": "HS tự giác làm bài tập..."
                },
                {
                  "stepNumber": 3,
                  "stepName": "Bước 3: Báo cáo kết quả",
                  "teacherAction": "GV gọi HS trình bày kết quả...",
                  "studentAction": "HS giơ bảng / nêu lời giải chi tiết..."
                },
                {
                  "stepNumber": 4,
                  "stepName": "Bước 4: Đánh giá, kết luận",
                  "teacherAction": "GV nhận xét, sửa lỗi và chốt đáp án...",
                  "studentAction": "HS tự đối chiếu và chữa bài vào vở..."
                }
              ]
            }
          ]
        },
        {
          "activityNumber": 4,
          "activityName": "4. HOẠT ĐỘNG VẬN DỤNG - TRẢI NGHIỆM (5 phút)",
          "timeEstimate": "5 phút",
          "integrationNote": "${integrationOptions.cds ? '[CĐS CV 3899 & SGK Hành trình CĐS Lớp ' + grade + ']' : ''}",
          "tasks": [
            {
              "taskId": "task-1-4-1",
              "taskTitle": "* Nhiệm vụ 1: Vận dụng kiến thức bài học vào thực tế",
              "steps": [
                {
                  "stepNumber": 1,
                  "stepName": "Bước 1: Chuyển giao nhiệm vụ",
                  "teacherAction": "GV đưa ra câu hỏi / tình huống thực tế...",
                  "studentAction": "HS suy ngẫm và liên hệ thực tế..."
                },
                {
                  "stepNumber": 2,
                  "stepName": "Bước 2: Thực hiện nhiệm vụ",
                  "teacherAction": "GV khuyến khích chia sẻ giải pháp...",
                  "studentAction": "HS trao đổi cặp đôi..."
                },
                {
                  "stepNumber": 3,
                  "stepName": "Bước 3: Báo cáo kết quả",
                  "teacherAction": "GV mời HS phát biểu...",
                  "studentAction": "HS tự tin phát biểu giải pháp..."
                },
                {
                  "stepNumber": 4,
                  "stepName": "Bước 4: Đánh giá, kết luận",
                  "teacherAction": "GV tổng kết tiết học, dặn dò ôn bài...",
                  "studentAction": "HS lắng nghe và ghi nhớ..."
                }
              ]
            }
          ]
        }
      ],
      "postLessonAdjustment": "...................................................................................................."
    }
  ]
}
`.trim();
}

/**
 * Standard pedagogical generator conforming 100% to Ministry of Education guidelines
 * Guarantees flawless Công văn 2345 structure even without internet or when deployed on Vercel.
 */
export function buildStandardLessonPlan(params: {
  topic: string;
  grade: string;
  subject: string;
  totalPeriods: number;
  bookSeries: string;
  enableNls?: boolean;
  enableStem?: boolean;
  enableCds?: boolean;
  weekNumber?: number;
  timeRange?: string;
  startDateWeek1?: string;
  ppctPeriodsText?: string;
  ppctList?: PpctItem[];
}): DetailedLessonPlan {
  const {
    topic,
    grade = '3',
    subject = 'Tin học',
    totalPeriods = 2,
    bookSeries = 'Kết nối tri thức với cuộc sống',
    enableNls = true,
    enableStem = true,
    enableCds = true,
    weekNumber = 1,
    startDateWeek1 = '2024-09-09',
    ppctPeriodsText,
    ppctList = []
  } = params;

  const cleanTopic = cleanLessonTitle(topic);
  const numericGrade = parseInt(grade, 10) || 3;
  const nlsLevel = numericGrade <= 3 ? 'CB1' : numericGrade <= 5 ? 'CB2' : 'TC1';

  // Match PPCT items for the topic
  const normalizedTopic = normalizeForPpctMatch(cleanTopic);

  const matchedPpct = ppctList.filter((it) => {
    const itGrade = String(it.grade || '').trim();
    if (itGrade && grade && itGrade !== String(grade).trim()) return false;
    const normItem = normalizeForPpctMatch(it.lessonName || '');
    return normItem && normalizedTopic && (normItem.includes(normalizedTopic) || normalizedTopic.includes(normItem));
  });

  matchedPpct.sort((a, b) => Number(a.week) - Number(b.week) || Number(a.periodIndex) - Number(b.periodIndex));

  const periodPlans: PeriodPlan[] = [];

  for (let p = 1; p <= totalPeriods; p++) {
    const isPeriod1 = p === 1;
    let pWeek = weekNumber;
    let pPpctPeriod = p;
    let pPpctText = '';

    if (matchedPpct.length >= p && matchedPpct[p - 1]) {
      pWeek = matchedPpct[p - 1].week || weekNumber;
      pPpctPeriod = matchedPpct[p - 1].periodIndex || p;
      pPpctText = `Tiết ${pPpctPeriod} (Tuần ${pWeek}) theo PPCT`;
    } else if (matchedPpct.length > 0) {
      const lastMatch = matchedPpct[matchedPpct.length - 1];
      const extraOffset = p - matchedPpct.length;
      pWeek = (lastMatch.week || weekNumber) + extraOffset;
      pPpctPeriod = (lastMatch.periodIndex || 1) + extraOffset;
      pPpctText = `Tiết ${pPpctPeriod} (Tuần ${pWeek}) theo PPCT`;
    } else {
      pWeek = weekNumber;
      pPpctPeriod = p;
      pPpctText = `Tiết ${p} (Tuần ${pWeek}) theo PPCT`;
    }

    const dateRangeObj = getWeekDateRange(startDateWeek1, pWeek);
    const pTimeRange = `từ ngày ${dateRangeObj.startDate} đến ngày ${dateRangeObj.endDate}`;

    const isTiengViet = subject.toLowerCase().includes('tiếng việt');
    const subSubject = isTiengViet ? (p === 1 ? 'Đọc' : p === 2 ? 'Luyện từ và câu' : p === 3 ? 'Viết' : 'Đọc mở rộng') : '';
    const periodTitle = `${cleanTopic} (${totalPeriods} tiết) ; Tiết ${p}`;

    const integrationList: string[] = [];
    if (enableNls) {
      integrationList.push(`[Năng lực số CV 3456 - Mã 1.3.${nlsLevel}a]: Tự chủ tìm kiếm và khai thác tư liệu học tập số an toàn, hiệu quả.`);
    }
    if (enableStem) {
      integrationList.push(`[Giáo dục STEM CV 909 - Khối ${numericGrade}]: Vận dụng kiến thức ${subject} và liên môn để giải quyết vấn đề thực tế.`);
    }
    if (enableCds) {
      integrationList.push(`[Công dân số CV 3899 & SGK Hành trình CĐS Lớp ${numericGrade}]: Ứng xử an toàn, văn minh và tôn trọng bản quyền số.`);
    }

    const activities = [
      // 1. Khởi động (5 phút)
      {
        activityNumber: 1,
        activityName: '1. HOẠT ĐỘNG KHỞI ĐỘNG (5 phút)',
        timeEstimate: '5 phút',
        integrationNote: enableStem ? '[STEM - Pha 1: Xác định vấn đề thực tiễn & Nhiệm vụ học tập]' : undefined,
        tasks: [
          {
            taskId: `task-${p}-1-1`,
            taskTitle: `* Nhiệm vụ 1: Khởi động và tạo hứng thú học tập bài "${cleanTopic}"`,
            steps: [
              {
                stepNumber: 1,
                stepName: 'Bước 1: Chuyển giao nhiệm vụ',
                teacherAction: `GV tổ chức trò chơi 'Khởi động vui vẻ' hoặc chiếu hình ảnh/video ngắn liên quan trực tiếp đến bài "${cleanTopic}". GV nêu câu hỏi khơi gợi: 'Em đã từng gặp tình huống này trong cuộc sống chưa? Em có nhận xét gì?'`,
                studentAction: `HS chăm chú quan sát màn hình, hào hứng tham gia trò chơi và sẵn sàng trả lời câu hỏi của giáo viên.`
              },
              {
                stepNumber: 2,
                stepName: 'Bước 2: Thực hiện nhiệm vụ',
                teacherAction: `GV bao quát lớp, khích lệ các em học sinh suy nghĩ nhanh và trao đổi ngắn gọn với bạn cùng bàn.`,
                studentAction: `HS suy nghĩ, trao đổi nhanh với bạn ngồi bên cạnh để tìm ra ý kiến trả lời.`
              },
              {
                stepNumber: 3,
                stepName: 'Bước 3: Báo cáo kết quả',
                teacherAction: `GV mời đại diện 2 - 3 học sinh đứng dậy phát biểu câu trả lời trước lớp.`,
                studentAction: `HS tự tin giơ tay phát biểu ý kiến: 'Thưa thầy/cô, theo em nhận thấy...' Cả lớp lắng nghe và nhận xét.`
              },
              {
                stepNumber: 4,
                stepName: 'Bước 4: Đánh giá, kết luận',
                teacherAction: `GV nhận xét câu trả lời, khen ngợi tinh thần phát biểu của học sinh và dẫn dắt vào bài học "${cleanTopic}".`,
                studentAction: `HS lắng nghe lời dẫn dắt của giáo viên, mở SGK ${subject} Lớp ${grade} để bắt đầu bài học mới.`
              }
            ]
          }
        ]
      },
      // 2. Hình thành kiến thức mới (15 phút)
      {
        activityNumber: 2,
        activityName: '2. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC MỚI (15 phút)',
        timeEstimate: '15 phút',
        integrationNote: enableNls ? `[NLS CV 3456 - Mã 1.3.${nlsLevel}a: Khai thác tư liệu bài học số]` : undefined,
        tasks: [
          {
            taskId: `task-${p}-2-1`,
            taskTitle: `* Nhiệm vụ 1: Khám phá nội dung bài học "${cleanTopic}" trong SGK`,
            steps: [
              {
                stepNumber: 1,
                stepName: 'Bước 1: Chuyển giao nhiệm vụ',
                teacherAction: `GV yêu cầu học sinh mở SGK môn ${subject} Lớp ${grade}, làm việc theo cặp đôi: đọc kỹ nội dung bài học "${cleanTopic}" và quan sát các sơ đồ, hình ảnh minh họa trong SGK. GV nêu rõ yêu cầu nhiệm vụ khám phá.`,
                studentAction: `HS mở SGK bài "${cleanTopic}", cùng bạn đọc thầm nội dung, tập trung quan sát từng chi tiết minh họa.`
              },
              {
                stepNumber: 2,
                stepName: 'Bước 2: Thực hiện nhiệm vụ',
                teacherAction: `GV đặt câu hỏi gợi mở tỉ mỉ theo nội dung kiến thức bài "${cleanTopic}", sau đó đi tới từng bàn bao quát và hướng dẫn các nhóm.`,
                studentAction: `HS thảo luận sôi nổi theo cặp: chỉ ra các chi tiết quan sát được trong bài, ghi nhận kết quả vào phiếu học tập.`
              },
              {
                stepNumber: 3,
                stepName: 'Bước 3: Báo cáo kết quả',
                teacherAction: `GV mời đại diện các cặp đôi báo cáo kết quả trước lớp, yêu cầu chỉ rõ vào hình ảnh/văn bản minh họa.`,
                studentAction: `Đại diện nhóm tự tin đứng dậy phát biểu: 'Thưa thầy/cô, nhóm em xin trình bày: Qua tìm hiểu bài "${cleanTopic}", chúng em nhận thấy...'`
              },
              {
                stepNumber: 4,
                stepName: 'Bước 4: Đánh giá, kết luận',
                teacherAction: `GV nhận xét câu trả lời của các nhóm, chuẩn hóa kiến thức bài "${cleanTopic}" và chốt nội dung trọng tâm trên bảng lớp.`,
                studentAction: `HS lắng nghe, ghi nhớ kết luận và ghi nội dung trọng tâm bài "${cleanTopic}" vào vở ghi chép.`
              }
            ]
          }
        ]
      },
      // 3. Luyện tập, thực hành (10 phút)
      {
        activityNumber: 3,
        activityName: '3. HOẠT ĐỘNG LUYỆN TẬP - THỰC HÀNH (10 phút)',
        timeEstimate: '10 phút',
        integrationNote: enableStem ? '[STEM - Pha 3: Thực hành thao tác, chế tạo & thử nghiệm]' : undefined,
        tasks: [
          {
            taskId: `task-${p}-3-1`,
            taskTitle: `* Nhiệm vụ 1: Hoàn thành bài tập thực hành trong SGK`,
            steps: [
              {
                stepNumber: 1,
                stepName: 'Bước 1: Chuyển giao nhiệm vụ',
                teacherAction: `GV yêu cầu 1 học sinh đọc to đề bài tập thực hành trong SGK, giao nhiệm vụ làm việc cá nhân vào vở / bảng con.`,
                studentAction: `1 HS đọc to đề bài, cả lớp lắng nghe và mở vở bài tập.`
              },
              {
                stepNumber: 2,
                stepName: 'Bước 2: Thực hiện nhiệm vụ',
                teacherAction: `GV theo dõi học sinh làm bài, hướng dẫn riêng cho những em còn lúng túng.`,
                studentAction: `HS tự giác làm bài tập vào vở hoặc thao tác trên đồ dùng học tập.`
              },
              {
                stepNumber: 3,
                stepName: 'Bước 3: Báo cáo kết quả',
                teacherAction: `GV mời 2 học sinh lên bảng trình bày / yêu cầu cả lớp giơ bảng con kiểm tra kết quả.`,
                studentAction: `HS giơ bảng con / nêu đáp án: 'Kết quả của em là...'`
              },
              {
                stepNumber: 4,
                stepName: 'Bước 4: Đánh giá, kết luận',
                teacherAction: `GV nhận xét, sửa lỗi sai phổ biến (nếu có) và biểu dương những bài làm đúng.`,
                studentAction: `HS đối chiếu bài làm với đáp án chuẩn của giáo viên, tự sửa sai vào vở.`
              }
            ]
          }
        ]
      },
      // 4. Vận dụng, trải nghiệm (5 phút)
      {
        activityNumber: 4,
        activityName: '4. HOẠT ĐỘNG VẬN DỤNG - TRẢI NGHIỆM (5 phút)',
        timeEstimate: '5 phút',
        integrationNote: enableCds ? `[CĐS CV 3899 & SGK Hành trình CĐS Lớp ${numericGrade}]` : undefined,
        tasks: [
          {
            taskId: `task-${p}-4-1`,
            taskTitle: `* Nhiệm vụ 1: Vận dụng kiến thức bài học vào thực tế cuộc sống`,
            steps: [
              {
                stepNumber: 1,
                stepName: 'Bước 1: Chuyển giao nhiệm vụ',
                teacherAction: `GV đưa ra câu hỏi tình huống gắn liền với đời sống học sinh: 'Em sẽ vận dụng kiến thức bài ${cleanTopic} vào thực tế cuộc sống như thế nào?'`,
                studentAction: `HS lắng nghe câu hỏi tình huống và liên hệ với thực tế của bản thân.`
              },
              {
                stepNumber: 2,
                stepName: 'Bước 2: Thực hiện nhiệm vụ',
                teacherAction: `GV khuyến khích học sinh suy nghĩ nhanh và chia sẻ cách xử lý an toàn, thông minh.`,
                studentAction: `HS tự suy ngẫm và chuẩn bị câu trả lời ngắn gọn, thiết thực.`
              },
              {
                stepNumber: 3,
                stepName: 'Bước 3: Báo cáo kết quả',
                teacherAction: `GV mời 2 học sinh phát biểu giải pháp trước lớp.`,
                studentAction: `HS chia sẻ: 'Thưa thầy/cô, trong thực tế em sẽ áp dụng bằng cách...'`
              },
              {
                stepNumber: 4,
                stepName: 'Bước 4: Đánh giá, kết luận',
                teacherAction: `GV tổng kết tiết học, khen ngợi tinh thần học tập, dặn dò học sinh ôn bài và chuẩn bị tiết tiếp theo.`,
                studentAction: `HS lắng nghe lời dặn của thầy/cô, thu dọn đồ dùng học tập ngay ngắn.`
              }
            ]
          }
        ]
      }
    ];

    periodPlans.push({
      periodIndex: p,
      subSubject: subSubject || undefined,
      lessonTitle: cleanTopic,
      weekNumber: pWeek,
      ppctPeriodIndex: pPpctPeriod,
      ppctPeriodsText: pPpctText,
      timeRange: pTimeRange,
      header: {
        subject,
        grade,
        title: periodTitle,
        subSubject: subSubject || undefined,
        lessonTitle: cleanTopic,
        timeRange: pTimeRange,
        weekNumber: pWeek
      },
      objectives: {
        specificCompetencies: [
          `Nắm vững kiến thức trọng tâm của bài học "${cleanTopic}".`,
          `Thực hành thành thạo các bài tập và thao tác vận dụng theo yêu cầu cần đạt môn ${subject} Lớp ${grade}.`
        ],
        generalCompetencies: [
          'Tự chủ và tự học: Tự giác tìm hiểu bài học, chủ động hoàn thành nhiệm vụ được giao.',
          'Giao tiếp và hợp tác: Tích cực trao đổi, chia sẻ và làm việc nhóm hiệu quả cùng bạn bè.',
          'Giải quyết vấn đề và sáng tạo: Biết vận dụng kiến thức bài học để xử lý tình huống thực tế.'
        ],
        qualities: [
          'Chăm chỉ: Tích cực tham gia các hoạt động học tập và làm bài tập đầy đủ.',
          'Trung thực: Thật thà trong học tập, tôn trọng ý kiến đóng góp của bạn bè.',
          'Trách nhiệm: Có ý thức bảo vệ tài sản, thiết bị học tập và môi trường xung quanh.'
        ],
        integrationContent: integrationList
      },
      teachingTools: {
        teacher: [
          'Sách giáo khoa, bài giảng điện tử PowerPoint / Canva.',
          'Tivi thông minh / Máy chiếu, phiếu học tập nhóm, tranh ảnh minh họa.',
          'Vật liệu thực hành STEM, bảng phụ, đồ dùng dạy học trực quan.'
        ],
        student: [
          'Sách giáo khoa, vở ghi bài, vở bài tập.',
          'Bảng con, bút dạ, đồ dùng học tập theo yêu cầu của môn học.'
        ]
      },
      activities,
      postLessonAdjustment:
        '....................................................................................................\n....................................................................................................'
    });
  }

  const baseWeek = periodPlans[0]?.weekNumber || weekNumber;
  const baseDateRange = getWeekDateRange(startDateWeek1, baseWeek);
  const baseTimeRange = `từ ngày ${baseDateRange.startDate} đến ngày ${baseDateRange.endDate}`;

  return {
    id: `plan-${Date.now()}`,
    topic: cleanTopic,
    subject,
    grade,
    totalPeriods,
    bookSeries,
    weekNumber: baseWeek,
    timeRange: baseTimeRange,
    ppctPeriodsText: ppctPeriodsText || `Tiết 1 - ${totalPeriods} theo PPCT (Tuần ${baseWeek})`,
    createdAt: new Date().toISOString(),
    periodPlans
  };
}
