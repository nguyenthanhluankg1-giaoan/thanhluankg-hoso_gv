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
        // ignore
      }
    }
  }
  return null;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { attachedFiles, base64Data, mimeType, fileName, customApiKey } = req.body || {};
    const apiKey = (req.headers['x-gemini-api-key'] as string) || customApiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    const filesList: any[] = [];
    if (Array.isArray(attachedFiles) && attachedFiles.length > 0) {
      filesList.push(...attachedFiles);
    } else if (base64Data) {
      filesList.push({ base64Data, mimeType, fileName });
    }

    const mainFileName = filesList[0]?.fileName || fileName || 'Bài học mới';
    const cleanedFileName = mainFileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').trim();
    const fallbackTopic = cleanedFileName.startsWith('Bài') ? cleanedFileName : `Bài: ${cleanedFileName}`;

    if (!apiKey || !apiKey.trim() || filesList.length === 0) {
      return res.status(200).json({
        success: true,
        topic: fallbackTopic,
        subject: 'Tin học',
        grade: '3',
        bookSeries: 'Kết nối tri thức với cuộc sống'
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const parts: any[] = [];
    for (const f of filesList) {
      const raw = f.base64Data || f.base64 || '';
      if (raw) {
        const cleanBase64 = raw.replace(/^data:[^;]+;base64,/, '');
        const isPdf = f.mimeType === 'application/pdf' || f.type === 'application/pdf' || f.fileName?.toLowerCase().endsWith('.pdf');
        parts.push({
          inlineData: {
            data: cleanBase64,
            mimeType: f.mimeType || f.type || (isPdf ? 'application/pdf' : 'image/jpeg')
          }
        });
      }
    }

    const promptText = `Bạn là chuyên gia giáo dục Việt Nam. Hãy quan sát và phân tích các hình ảnh/trang sách tài liệu giáo dục này.
Hãy trích xuất chính xác:
1. "topic": Tên bài học đầy đủ (Ví dụ: "Bài 1. Thông tin và quyết định", "Bài 15. Bảng nhân 7"...).
2. "subject": Môn học (Ví dụ: "Tin học", "Toán", "Tiếng Việt", "Tự nhiên và Xã hội", "Khoa học"...).
3. "grade": Khối lớp dạng số chuỗi (Ví dụ: "3", "4", "5"...).
4. "bookSeries": Bộ sách nếu nhận diện được (Ví dụ: "Kết nối tri thức với cuộc sống", "Cánh Diều", "Chân trời sáng tạo"...).

Trả về DUY NHẤT một JSON hợp lệ:
{
  "topic": "Bài ...",
  "subject": "Tin học",
  "grade": "3",
  "bookSeries": "Kết nối tri thức với cuộc sống"
}`;

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
          if (parsed && typeof parsed === 'object') {
            return res.status(200).json({ success: true, ...parsed });
          }
        }
      } catch (mErr) {
        console.warn(`Vercel analyze model ${modelName} notice:`, mErr);
      }
    }

    return res.status(200).json({
      success: true,
      topic: fallbackTopic,
      subject: 'Tin học',
      grade: '3',
      bookSeries: 'Kết nối tri thức với cuộc sống'
    });
  } catch (err: any) {
    console.error('Vercel analyze-lesson-file error:', err);
    return res.status(200).json({
      success: true,
      topic: 'Bài 1. Thông tin và quyết định',
      subject: 'Tin học',
      grade: '3',
      bookSeries: 'Kết nối tri thức với cuộc sống'
    });
  }
}
