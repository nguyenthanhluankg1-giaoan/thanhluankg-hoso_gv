import { GoogleGenAI } from '@google/genai';

function safeParseJSON(rawText: string | null | undefined): any {
  if (!rawText) return null;
  const cleaned = rawText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const jsonSub = cleaned.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(jsonSub);
      } catch {
        try {
          const sanitized = jsonSub
            .replace(/,\s*([}\]])/g, '$1')
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, (m) => (m === '\n' || m === '\r' || m === '\t' ? m : ''));
          return JSON.parse(sanitized);
        } catch {
          // ignore
        }
      }
    }
  }
  return null;
}

function normalizeForPpctMatch(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\(tiết\s*\d+.*?\)/gi, '')
    .replace(/tiết\s*\d+/gi, '')
    .replace(/bài\s*\d*[:\.]?/gi, '')
    .replace(/y/g, 'i')
    .replace(/[^a-z0-9\u00C0-\u1EF9]/gi, '');
}

function parseDateStr(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
}

function formatDateVNStr(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function calculateWeekDateRange(startDateWeek1Str?: string, weekNumber: number = 1): string {
  if (!startDateWeek1Str) return 'từ .../.../.... đến .../.../....';
  try {
    const baseDate = parseDateStr(startDateWeek1Str);
    const day = baseDate.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const mondayWeek1 = new Date(baseDate);
    mondayWeek1.setDate(baseDate.getDate() + diffToMonday);

    const monday = new Date(mondayWeek1);
    monday.setDate(mondayWeek1.getDate() + (weekNumber - 1) * 7);

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    return `từ ngày ${formatDateVNStr(monday)} đến ngày ${formatDateVNStr(friday)}`;
  } catch {
    return 'từ .../.../.... đến .../.../....';
  }
}

function cleanLessonTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  return rawTitle
    .replace(/^bài\s*:\s*/i, '')
    .replace(/^bài\s+\d+[:\.]\s*/i, (m) => m.replace(':', '.'))
    .trim();
}

// Built-in standard pedagogical generator conforming 100% to Ministry of Education guidelines (Công văn 2345)
function buildStandardLessonPlan(params: {
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
  ppctList?: Array<{
    grade?: number | string;
    subject?: string;
    week?: number;
    periodIndex?: number;
    lessonName?: string;
  }>;
}) {
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

  const periodPlans = [];

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

    const pTimeRange = calculateWeekDateRange(startDateWeek1, pWeek);
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

    periodPlans.push({
      periodIndex: p,
      subSubject,
      lessonTitle: cleanTopic,
      weekNumber: pWeek,
      ppctPeriodIndex: pPpctPeriod,
      ppctPeriodsText: pPpctText,
      timeRange: pTimeRange,
      header: {
        subject,
        grade,
        title: periodTitle,
        subSubject,
        lessonTitle: cleanTopic,
        timeRange: pTimeRange,
        weekNumber: pWeek
      },
      objectives: {
        specificCompetencies: [
          `Nêu được các nội dung kiến thức trọng tâm của bài ${cleanTopic} theo chương trình GDPT 2018.`,
          `Thực hành thành thạo các kỹ năng cốt lõi và bài tập ứng dụng của bài học.`,
          `Phát triển tư duy logic, phản biện và khả năng vận dụng kiến thức vào thực tiễn học tập.`
        ],
        generalCompetencies: [
          'Tự chủ và tự học: Tự giác tìm hiểu bài học, chủ động hoàn thành nhiệm vụ được giao.',
          'Giao tiếp và hợp tác: Tích cực thảo luận nhóm, chia sẻ ý tưởng và giúp đỡ bạn cùng tiến bộ.',
          'Giải quyết vấn đề và sáng tạo: Biết vận dụng kiến thức linh hoạt để xử lý các tình huống thực tế.'
        ],
        qualities: [
          'Chăm chỉ: Tích cực tham gia các hoạt động học tập và làm bài tập đầy đủ.',
          'Trung thực: Thật thà trong học tập, tự giác làm bài và đánh giá kết quả của bản thân và bạn.',
          'Trách nhiệm: Có ý thức bảo quản đồ dùng học tập, giữ gìn tài sản chung và hoàn thành tốt nhiệm vụ nhóm.'
        ],
        integrationContent: integrationList
      },
      teachingTools: {
        teacher: [
          'Sách giáo khoa, bài giảng điện tử PowerPoint / Canva.',
          'Tivi thông minh / Máy chiếu, phiếu học tập nhóm, tranh ảnh minh họa.',
          'Đồ dùng trực quan và học liệu số tương tác.'
        ],
        student: [
          'Sách giáo khoa, vở ghi bài, vở bài tập.',
          'Bút dạ, bảng con, đồ dùng học tập theo yêu cầu môn học.'
        ]
      },
      activities: [
        {
          activityNumber: 1,
          activityName: '1. HOẠT ĐỘNG KHỞI ĐỘNG (5 phút)',
          timeEstimate: '5 phút',
          integrationNote: enableStem ? '[STEM - Pha 1: Xác định vấn đề thực tiễn]' : '',
          tasks: [
            {
              taskId: `task-${p}-1-1`,
              taskTitle: '* Nhiệm vụ 1: Khởi động và tạo tâm thế hứng thú vào bài học',
              integrationNote: enableStem ? '[STEM - Pha 1: Xác định tiêu chí]' : '',
              steps: [
                {
                  stepNumber: 1,
                  stepName: 'Bước 1: Chuyển giao nhiệm vụ',
                  teacherAction: `GV tổ chức trò chơi khởi động sôi nổi hoặc đặt câu hỏi tình huống dẫn dắt vào bài học "${cleanTopic}". GV nêu rõ luật chơi và yêu cầu học sinh quan sát, suy nghĩ.`,
                  studentAction: `HS chú ý lắng nghe GV phổ biến luật chơi và sẵn sàng tham gia trò chơi khởi động.`
                },
                {
                  stepNumber: 2,
                  stepName: 'Bước 2: Thực hiện nhiệm vụ',
                  teacherAction: `GV điều hành trò chơi, quan sát, khích lệ tinh thần hào hứng và tạo không khí thi đua tích cực giữa các tổ/nhóm.`,
                  studentAction: `HS tích cực tham gia tương tác, trao đổi nhanh cùng bạn và đưa ra tín hiệu trả lời.`
                },
                {
                  stepNumber: 3,
                  stepName: 'Bước 3: Báo cáo kết quả',
                  teacherAction: `GV mời đại diện 2-3 học sinh phát biểu câu trả lời hoặc trình bày cảm nhận sau phần khởi động.`,
                  studentAction: `Đại diện HS tự tin đứng tại chỗ phát biểu câu trả lời trước lớp.`
                },
                {
                  stepNumber: 4,
                  stepName: 'Bước 4: Đánh giá, kết luận',
                  teacherAction: `GV nhận xét, tuyên dương tinh thần học tập và dẫn dắt khéo léo vào bài mới: "${cleanTopic}".`,
                  studentAction: `HS lắng nghe, ghi tên bài học vào vở và mở SGK trang bài học.`
                }
              ]
            }
          ]
        },
        {
          activityNumber: 2,
          activityName: '2. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC MỚI (15 phút)',
          timeEstimate: '15 phút',
          integrationNote: enableNls ? `[NLS CV 3456 - Mã 1.3.${nlsLevel}a]` : '',
          tasks: [
            {
              taskId: `task-${p}-2-1`,
              taskTitle: `* Nhiệm vụ 1: Khám phá kiến thức cốt lõi bài "${cleanTopic}"`,
              integrationNote: enableNls ? '[NLS CV 3456: Khai thác tư liệu số]' : '',
              steps: [
                {
                  stepNumber: 1,
                  stepName: 'Bước 1: Chuyển giao nhiệm vụ',
                  teacherAction: `GV yêu cầu HS quan sát thông tin và sơ đồ/hình ảnh minh họa trong SGK, làm việc theo nhóm 4 để đọc, phân tích và trả lời các câu hỏi trọng tâm bài học.`,
                  studentAction: `HS tiếp nhận nhiệm vụ, mở SGK, phân công nhiệm vụ cụ thể cho từng thành viên trong nhóm.`
                },
                {
                  stepNumber: 2,
                  stepName: 'Bước 2: Thực hiện nhiệm vụ',
                  teacherAction: `GV đi đến từng nhóm bao quát, gợi ý mở rộng đối với các nhóm còn lúng túng và theo dõi tiến độ thảo luận.`,
                  studentAction: `Các thành viên trong nhóm thảo luận sôi nổi, cùng đối chiếu dữ liệu trong SGK và thống nhất ghi kết quả vào phiếu học tập.`
                },
                {
                  stepNumber: 3,
                  stepName: 'Bước 3: Báo cáo kết quả',
                  teacherAction: `GV mời đại diện 1-2 nhóm lên bảng trình bày kết quả khám phá; các nhóm khác chú ý lắng nghe để nhận xét, bổ sung.`,
                  studentAction: `Đại diện nhóm đứng trước lớp tự tin báo cáo chi tiết nội dung đã thảo luận; các nhóm khác đặt câu hỏi giao lưu.`
                },
                {
                  stepNumber: 4,
                  stepName: 'Bước 4: Đánh giá, kết luận',
                  teacherAction: `GV nhận xét, chuẩn hóa kiến thức trên màn hình chiếu và chốt lại nội dung kiến thức cốt lõi mà học sinh cần ghi nhớ.`,
                  studentAction: `HS lắng nghe, tiếp thu ý kiến chuẩn hóa của GV và ghi chép nội dung trọng tâm vào vở ghi.`
                }
              ]
            }
          ]
        },
        {
          activityNumber: 3,
          activityName: '3. HOẠT ĐỘNG LUYỆN TẬP - THỰC HÀNH (10 phút)',
          timeEstimate: '10 phút',
          integrationNote: enableStem ? '[STEM - Pha 3: Thực hành, chế tạo & thử nghiệm]' : '',
          tasks: [
            {
              taskId: `task-${p}-3-1`,
              taskTitle: '* Nhiệm vụ 1: Thực hành giải bài tập và củng cố kỹ năng',
              integrationNote: enableStem ? '[STEM - Pha 3: Lắp ráp & thử nghiệm]' : '',
              steps: [
                {
                  stepNumber: 1,
                  stepName: 'Bước 1: Chuyển giao nhiệm vụ',
                  teacherAction: `GV giao nhiệm vụ bài tập thực hành trong SGK, yêu cầu HS làm bài cá nhân vào vở, sau đó đổi chéo bài kiểm tra cho bạn cùng bàn.`,
                  studentAction: `HS đọc kỹ đề bài, xác định yêu cầu và chuẩn bị dụng cụ để làm bài cá nhân.`
                },
                {
                  stepNumber: 2,
                  stepName: 'Bước 2: Thực hiện nhiệm vụ',
                  teacherAction: `GV đi quanh lớp quan sát thao tác làm bài của học sinh, kịp thời phát hiện lỗi sai phổ biến để uốn nắn, hướng dẫn.`,
                  studentAction: `HS tập trung làm bài cá nhân vào vở, thực hiện từng bước cẩn thận và chính xác.`
                },
                {
                  stepNumber: 3,
                  stepName: 'Bước 3: Báo cáo kết quả',
                  teacherAction: `GV gọi một số học sinh lên bảng trình bày bài làm hoặc chiếu bài làm của học sinh qua camera/máy chiếu để cả lớp cùng quan sát.`,
                  studentAction: `HS trên bảng trình bày lời giải chi tiết; học sinh dưới lớp theo dõi, đối chiếu với bài làm của mình.`
                },
                {
                  stepNumber: 4,
                  stepName: 'Bước 4: Đánh giá, kết luận',
                  teacherAction: `GV chữa bài chi tiết, tuyên dương các học sinh làm bài tốt, chỉnh sửa lỗi sai cho học sinh và chốt phương pháp giải chuẩn.`,
                  studentAction: `HS tự chấm chéo bài cho bạn, sửa bài vào vở và ghi nhớ phương pháp làm bài đúng.`
                }
              ]
            }
          ]
        },
        {
          activityNumber: 4,
          activityName: '4. HOẠT ĐỘNG VẬN DỤNG - TRẢI NGHIỆM (5 phút)',
          timeEstimate: '5 phút',
          integrationNote: enableCds ? `[CĐS CV 3899 & SGK Hành trình CĐS Lớp ${numericGrade}]` : '',
          tasks: [
            {
              taskId: `task-${p}-4-1`,
              taskTitle: '* Nhiệm vụ 1: Vận dụng kiến thức bài học vào đời sống thực tế',
              integrationNote: enableCds ? '[CĐS CV 3899: Ứng xử an toàn, văn minh]' : '',
              steps: [
                {
                  stepNumber: 1,
                  stepName: 'Bước 1: Chuyển giao nhiệm vụ',
                  teacherAction: `GV đưa ra tình huống thực tế gắn liền với đời sống hàng ngày, yêu cầu học sinh vận dụng kiến thức vừa học để đưa ra phương án giải quyết tối ưu.`,
                  studentAction: `HS tiếp nhận câu hỏi tình huống thực tế và suy nghĩ cách giải quyết.`
                },
                {
                  stepNumber: 2,
                  stepName: 'Bước 2: Thực hiện nhiệm vụ',
                  teacherAction: `GV gợi mở, khuyến khích học sinh liên hệ với trải nghiệm thực tế của gia đình, nhà trường và bản thân.`,
                  studentAction: `HS trao đổi nhanh cùng bạn cạnh bên, tìm ra giải pháp thông minh và thiết thực.`
                },
                {
                  stepNumber: 3,
                  stepName: 'Bước 3: Báo cáo kết quả',
                  teacherAction: `GV mời 2-3 học sinh xung phong chia sẻ ý kiến và giải pháp xử lý tình huống trước lớp.`,
                  studentAction: `HS tự tin phát biểu giải pháp và nêu rõ lý do lựa chọn cách làm đó.`
                },
                {
                  stepNumber: 4,
                  stepName: 'Bước 4: Đánh giá, kết luận',
                  teacherAction: `GV nhận xét, biểu dương các ý kiến sáng tạo, tổng kết tiết học và dặn dò học sinh ôn bài, chuẩn bị bài cho tiết học tiếp theo.`,
                  studentAction: `HS chú ý lắng nghe lời dặn dò của GV, thu dọn đồ dùng học tập gọn gàng, ngay ngắn.`
                }
              ]
            }
          ]
        }
      ],
      postLessonAdjustment: '....................................................................................................\n....................................................................................................'
    });
  }

  const baseWeek = periodPlans[0]?.weekNumber || weekNumber;
  const baseTimeRange = periodPlans[0]?.timeRange || calculateWeekDateRange(startDateWeek1, baseWeek);

  return {
    id: `plan-${Date.now()}`,
    topic,
    subject,
    grade,
    totalPeriods,
    weekNumber: baseWeek,
    ppctPeriodsText: ppctPeriodsText || `Tiết 1 - ${totalPeriods} theo PPCT (Tuần ${baseWeek})`,
    timeRange: baseTimeRange,
    bookSeries,
    createdAt: new Date().toISOString(),
    periodPlans
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      topic,
      grade = '3',
      subject = 'Tin học',
      totalPeriods = 2,
      bookSeries = 'Kết nối tri thức với cuộc sống',
      integrationOptions = { nls: true, stem: true, cds: true },
      attachedFiles,
      attachedFile,
      customApiKey,
      weekNumber = 1,
      timeRange = '',
      startDateWeek1 = '2024-09-09',
      ppctPeriodsText = '',
      ppctList = []
    } = req.body || {};

    if (!topic || !String(topic).trim()) {
      return res.status(400).json({ success: false, error: 'Tên bài học không được để trống' });
    }

    const apiKey =
      (req.headers['x-gemini-api-key'] as string) ||
      customApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY;

    // If API Key is available, attempt Gemini generation
    if (apiKey && apiKey.trim()) {
      try {
        const ai = new GoogleGenAI({
          apiKey: apiKey.trim(),
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });

        const parts: any[] = [];
        const filesToProcess = Array.isArray(attachedFiles) && attachedFiles.length > 0
          ? attachedFiles
          : attachedFile ? [attachedFile] : [];

        for (const f of filesToProcess) {
          const raw = f.base64Data || f.base64 || f.data;
          if (raw) {
            const cleanBase64 = raw.replace(/^data:[^;]+;base64,/, '');
            const isPdf = f.mimeType === 'application/pdf' || f.type === 'application/pdf' || f.fileName?.toLowerCase().endsWith('.pdf') || f.name?.toLowerCase().endsWith('.pdf');
            parts.push({
              inlineData: {
                data: cleanBase64,
                mimeType: f.mimeType || f.type || (isPdf ? 'application/pdf' : 'image/jpeg')
              }
            });
          }
        }

        const promptText = `YÊU CẦU SOẠN KẾ HOẠCH BÀI DẠY (GIÁO ÁN) CÔNG VĂN 2345/BGDĐT-GDTH:
- Tên bài dạy: "${topic}"
- Môn học: ${subject}
- Khối lớp: Lớp ${grade}
- Bộ sách: ${bookSeries}
- Tổng số tiết: ${totalPeriods} tiết
- Tuần theo PPCT: TUẦN ${weekNumber}
- Tiết theo PPCT: ${ppctPeriodsText || `Tiết 1 - ${totalPeriods} theo PPCT`}
- Thời gian thực hiện: ${timeRange || calculateWeekDateRange(startDateWeek1, weekNumber)}
- Tùy chọn Tích hợp: Năng lực số=${integrationOptions?.nls ? 'CÓ' : 'KHÔNG'}, STEM=${integrationOptions?.stem ? 'CÓ' : 'KHÔNG'}, Công dân số=${integrationOptions?.cds ? 'CÓ' : 'KHÔNG'}

Nhiệm vụ: Hãy sinh đầy đủ ${totalPeriods} tiết học. Mỗi tiết học BẮT BUỘC tuân thủ đúng cấu trúc Công văn 2345 (I. Yêu cầu cần đạt, II. Đồ dùng dạy học, III. Các hoạt động dạy học gồm 4 hoạt động, mỗi hoạt động gồm các bước sư phạm 1-4 cực kỳ chi tiết).
Trả về DUY NHẤT một JSON hợp lệ có trường "plan": { "topic": "...", "subject": "...", "grade": "...", "totalPeriods": ${totalPeriods}, "bookSeries": "...", "weekNumber": ${weekNumber}, "timeRange": "...", "ppctPeriodsText": "...", "periodPlans": [...] }`;

        parts.push({ text: promptText });

        for (const modelName of ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-3.1-pro-preview']) {
          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents: [{ role: 'user', parts }],
              config: { responseMimeType: 'application/json' }
            });

            if (response.text) {
              const parsed = safeParseJSON(response.text);
              if (parsed) {
                const plan = parsed.plan || parsed;
                if (plan.periodPlans && Array.isArray(plan.periodPlans) && plan.periodPlans.length > 0) {
                  return res.status(200).json({ success: true, plan });
                }
              }
            }
          } catch (mErr) {
            console.warn(`Vercel model ${modelName} notice:`, mErr);
          }
        }
      } catch (geminiErr) {
        console.warn('Vercel Gemini initialization notice:', geminiErr);
      }
    }

    // Standard fallback generator conforming 100% to Công văn 2345
    const standardPlan = buildStandardLessonPlan({
      topic,
      grade: String(grade),
      subject,
      totalPeriods: Number(totalPeriods) || 2,
      bookSeries,
      enableNls: Boolean(integrationOptions?.nls),
      enableStem: Boolean(integrationOptions?.stem),
      enableCds: Boolean(integrationOptions?.cds),
      weekNumber: Number(weekNumber) || 1,
      startDateWeek1,
      ppctPeriodsText,
      ppctList
    });

    return res.status(200).json({ success: true, plan: standardPlan });
  } catch (err: any) {
    console.error('Vercel API generate-lesson-plan error:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
}
