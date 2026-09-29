import { GoogleGenAI } from '@google/genai';
import { UploadedFileInfo, DetailedLessonPlan, PpctItem } from '../types';
import { getStoredApiKey } from '../utils/apiKeyStorage';
import { cleanLessonTitle } from '../utils/helpers';
import {
  SYSTEM_INSTRUCTION_CONG_VAN_2345,
  buildLessonPlanPrompt,
  buildStandardLessonPlan
} from '../utils/lessonPlanEngine';

export { SYSTEM_INSTRUCTION_CONG_VAN_2345 };

// Safe JSON parser helper
export function safeParseJSON(rawText: string | null | undefined): any {
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

/**
 * Phân tích tệp hình ảnh/PDF trang sách bằng Gemini
 */
export async function analyzeLessonFileWithGemini(
  files: UploadedFileInfo[],
  apiKey?: string
): Promise<{ topic?: string; subject?: string; grade?: string; bookSeries?: string } | null> {
  const apiKeyToUse = apiKey || getStoredApiKey();
  if (files.length === 0) return null;

  if (apiKeyToUse.trim()) {
    try {
      const ai = new GoogleGenAI({
        apiKey: apiKeyToUse.trim(),
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const parts: any[] = [];
      for (const f of files) {
        if (f.base64) {
          const cleanBase64 = f.base64.replace(/^data:[^;]+;base64,/, '');
          const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
          parts.push({
            inlineData: {
              data: cleanBase64,
              mimeType: f.type || (isPdf ? 'application/pdf' : 'image/jpeg')
            }
          });
        }
      }

      const promptText = `Hãy phân tích kỹ nội dung trang sách/tài liệu giáo dục đính kèm và trích xuất:
1. "topic": Tên bài học đầy đủ (Ví dụ: "Bài 1. Thông tin và quyết định", "Bài 15. Bảng nhân 7"...).
2. "subject": Môn học (Ví dụ: "Tin học", "Toán", "Tiếng Việt", "Tự nhiên và Xã hội", "Khoa học"...).
3. "grade": Khối lớp dạng số chuỗi (Ví dụ: "3", "4", "5"...).
4. "bookSeries": Bộ sách nếu nhận diện được (Ví dụ: "Kết nối tri thức với cuộc sống", "Cánh Diều", "Chân trời sáng tạo"...).

Trả về DUY NHẤT một JSON hợp lệ có dạng:
{
  "topic": "Bài ...",
  "subject": "Tin học",
  "grade": "3",
  "bookSeries": "Kết nối tri thức với cuộc sống"
}`;

      parts.push({ text: promptText });

      for (const modelName of ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-3.8-flash']) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts }],
            config: {
              systemInstruction: SYSTEM_INSTRUCTION_CONG_VAN_2345,
              responseMimeType: 'application/json'
            }
          });
          if (response.text) {
            const parsed = safeParseJSON(response.text);
            if (parsed && typeof parsed === 'object') return parsed;
          }
        } catch (err) {
          console.warn(`Model ${modelName} analyze notice:`, err);
        }
      }
    } catch (err) {
      console.error('Analyze lesson file error:', err);
    }
  }

  // Graceful fallback from file name
  const firstFile = files[0];
  if (firstFile) {
    const cleanedName = firstFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').trim();
    const guessedTopic = cleanedName.startsWith('Bài') ? cleanedName : `Bài: ${cleanedName}`;
    return {
      topic: guessedTopic,
      subject: 'Tin học',
      grade: '3',
      bookSeries: 'Kết nối tri thức với cuộc sống'
    };
  }
  return null;
}

/**
 * Soạn Kế hoạch bài dạy (Giáo án) Công văn 2345 sử dụng Gemini
 * Đảm bảo hoạt động 100% chuẩn cấu trúc cả trên Google Studio lẫn Vercel.app
 */
export async function generateLessonPlanWithGemini(params: {
  topic: string;
  grade: string;
  subject: string;
  totalPeriods: number;
  bookSeries: string;
  weekNumber: number;
  timeRange: string;
  startDateWeek1?: string;
  ppctPeriodsText?: string;
  ppctList?: PpctItem[];
  integrationOptions: { nls: boolean; stem: boolean; cds: boolean };
  attachedFiles?: UploadedFileInfo[];
  apiKey?: string;
}): Promise<DetailedLessonPlan | null> {
  const apiKeyToUse = params.apiKey || getStoredApiKey();

  if (apiKeyToUse && apiKeyToUse.trim()) {
    try {
      const ai = new GoogleGenAI({
        apiKey: apiKeyToUse.trim(),
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const parts: any[] = [];

      if (params.attachedFiles && params.attachedFiles.length > 0) {
        for (const f of params.attachedFiles) {
          if (f.base64) {
            const cleanBase64 = f.base64.replace(/^data:[^;]+;base64,/, '');
            const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
            parts.push({
              inlineData: {
                data: cleanBase64,
                mimeType: f.type || (isPdf ? 'application/pdf' : 'image/jpeg')
              }
            });
          }
        }
      }

      const promptText = buildLessonPlanPrompt({
        topic: cleanLessonTitle(params.topic),
        grade: params.grade,
        subject: params.subject,
        totalPeriods: params.totalPeriods,
        bookSeries: params.bookSeries,
        weekNumber: params.weekNumber,
        timeRange: params.timeRange,
        ppctPeriodsText: params.ppctPeriodsText,
        integrationOptions: params.integrationOptions,
        hasAttachedFiles: Boolean(params.attachedFiles && params.attachedFiles.length > 0)
      });

      parts.push({ text: promptText });

      for (const modelName of ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-3.8-flash']) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts }],
            config: {
              systemInstruction: SYSTEM_INSTRUCTION_CONG_VAN_2345,
              responseMimeType: 'application/json'
            }
          });

          if (response.text) {
            const parsed = safeParseJSON(response.text);
            if (parsed && parsed.periodPlans && Array.isArray(parsed.periodPlans) && parsed.periodPlans.length > 0) {
              return {
                id: `plan-${Date.now()}`,
                topic: cleanLessonTitle(parsed.topic || params.topic),
                subject: parsed.subject || params.subject,
                grade: parsed.grade || params.grade,
                totalPeriods: parsed.totalPeriods || params.totalPeriods,
                bookSeries: parsed.bookSeries || params.bookSeries,
                weekNumber: parsed.weekNumber || params.weekNumber,
                timeRange: parsed.timeRange || params.timeRange,
                ppctPeriodsText: parsed.ppctPeriodsText || params.ppctPeriodsText,
                createdAt: new Date().toISOString(),
                periodPlans: (parsed.periodPlans || []).map((p: any) => ({
                  ...p,
                  header: p.header
                    ? { ...p.header, title: cleanLessonTitle(p.header.title) }
                    : p.header
                }))
              };
            }
          }
        } catch (mErr) {
          console.warn(`Model ${modelName} generate plan notice:`, mErr);
        }
      }
    } catch (err) {
      console.error('Generate lesson plan with Gemini error:', err);
    }
  }

  // Always return standard compliant Công văn 2345 structure as reliable guarantee
  return buildStandardLessonPlan({
    topic: params.topic,
    grade: params.grade,
    subject: params.subject,
    totalPeriods: params.totalPeriods,
    bookSeries: params.bookSeries,
    enableNls: params.integrationOptions.nls,
    enableStem: params.integrationOptions.stem,
    enableCds: params.integrationOptions.cds,
    weekNumber: params.weekNumber,
    timeRange: params.timeRange,
    startDateWeek1: params.startDateWeek1,
    ppctPeriodsText: params.ppctPeriodsText,
    ppctList: params.ppctList
  });
}

/**
 * Tự động tạo câu hỏi trắc nghiệm từ tên bài dạy và tệp đính kèm (Ảnh/PDF) bằng Gemini AI
 */
export async function generateQuizWithGemini(params: {
  topic: string;
  subject: string;
  grade?: string | number;
  classId?: string;
  numQuestions: number;
  folderId?: string;
  attachedFiles?: UploadedFileInfo[];
  apiKey?: string;
}): Promise<import('../types').QuizQuestion[] | null> {
  const apiKeyToUse =
    params.apiKey ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('gemini_api_key') || '' : '') ||
    ((import.meta as any).env?.VITE_GEMINI_API_KEY as string) ||
    '';
  if (!apiKeyToUse.trim()) return null;

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKeyToUse.trim(),
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const parts: any[] = [];

    if (params.attachedFiles && params.attachedFiles.length > 0) {
      for (const f of params.attachedFiles) {
        if (f.base64) {
          const cleanBase64 = f.base64.replace(/^data:[^;]+;base64,/, '');
          const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
          parts.push({
            inlineData: {
              data: cleanBase64,
              mimeType: f.type || (isPdf ? 'application/pdf' : 'image/jpeg')
            }
          });
        }
      }
    }

    const gradeText = params.grade && params.grade !== 'all' ? `cho học sinh Tiểu học Khối ${params.grade}` : 'cho học sinh Tiểu học';
    const promptText = `Hãy là một chuyên gia giáo dục xuất sắc. Dựa vào nội dung bài học "${params.topic}" (Môn ${params.subject} ${gradeText}) và tài liệu/trang sách đính kèm (nếu có), hãy biên soạn đúng ĐỦ ${params.numQuestions} CÂU HỎI TRẮC NGHIỆM hay, chuẩn kiến thức sư phạm và phù hợp lứa tuổi.

Yêu cầu mỗi câu hỏi:
- Nội dung câu hỏi rõ ràng, bám sát bài dạy "${params.topic}".
- 4 phương án trả lời A, B, C, D (ngắn gọn, chính xác, chỉ có 1 phương án đúng).
- "correctIndex": Chỉ số phương án đúng (0 cho A, 1 cho B, 2 cho C, 3 cho D).
- "rewardCoins": Số hoa thưởng (từ 1 đến 3 hoa, ví dụ 2).
- "explanation": Giải thích ngắn gọn đáp án đúng hoặc mẹo ghi nhớ.

Trả về DUY NHẤT một mảng JSON hợp lệ các câu hỏi trắc nghiệm (không kèm markdown code fence) theo cấu trúc:
[
  {
    "question": "Nội dung câu hỏi...",
    "options": ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
    "correctIndex": 0,
    "rewardCoins": 2,
    "explanation": "Lời giải thích đáp án..."
  }
]`;

    parts.push({ text: promptText });

    for (const modelName of ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.0-flash']) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [{ role: 'user', parts }],
          config: {
            responseMimeType: 'application/json'
          }
        });

        if (response.text) {
          const parsed = safeParseJSON(response.text);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item: any, idx: number) => ({
              id: `quiz-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
              question: String(item.question || '').trim(),
              options: Array.isArray(item.options) && item.options.length >= 4
                ? item.options.slice(0, 4).map((o: any) => String(o).trim())
                : ['Đúng', 'Sai', 'Không xác định', 'Cả A và B'],
              correctIndex: typeof item.correctIndex === 'number' && item.correctIndex >= 0 && item.correctIndex < 4 ? item.correctIndex : 0,
              subject: params.subject,
              grade: params.grade && params.grade !== 'all' ? Number(params.grade) || params.grade : undefined,
              classId: params.classId && params.classId !== 'all' ? params.classId : undefined,
              folderId: params.folderId || undefined,
              rewardCoins: typeof item.rewardCoins === 'number' ? item.rewardCoins : 2,
              explanation: String(item.explanation || '').trim()
            }));
          }
        }
      } catch (err) {
        console.warn(`Model ${modelName} generate quiz failed:`, err);
      }
    }
  } catch (err) {
    console.error('Generate quiz with gemini error:', err);
  }
  return null;
}
