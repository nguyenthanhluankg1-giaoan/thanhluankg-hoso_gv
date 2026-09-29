import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const customKey = (req.headers['x-gemini-api-key'] as string) || req.body?.apiKey;
    if (!customKey || !customKey.trim()) {
      return res.status(400).json({ success: false, error: 'Chưa cung cấp API Key' });
    }

    const testClient = new GoogleGenAI({ apiKey: customKey.trim() });
    const response = await testClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Xin chào, hãy phản hồi: "API Key hoạt động tốt"'
    });

    if (response.text) {
      return res.json({ success: true, message: response.text.trim() });
    }
    return res.status(400).json({ success: false, error: 'Không nhận được phản hồi từ AI' });
  } catch (err: any) {
    console.error('Test API Key error:', err);
    return res.status(400).json({ success: false, error: err?.message || 'API Key không hợp lệ hoặc bị từ chối' });
  }
}
