import { UserAccount } from '../types';

const GLOBAL_GEMINI_KEY = 'gemini_api_key';
const GUEST_GEMINI_KEY = 'gemini_api_key_guest';

/**
 * Lấy API Key được lưu trữ thống nhất toàn bộ ứng dụng:
 * Thứ tự ưu tiên:
 * 1. API Key lưu theo Tài khoản Giáo viên đang đăng nhập (gemini_api_key_user_ID)
 * 2. API Key lưu chung toàn ứng dụng (gemini_api_key)
 * 3. API Key khách (gemini_api_key_guest)
 * 4. Biến môi trường hệ thống (VITE_GEMINI_API_KEY)
 */
export function getStoredApiKey(user?: UserAccount | null): string {
  try {
    if (typeof localStorage === 'undefined') return '';

    // 1. Kiểm tra API Key lưu riêng theo ID tài khoản Giáo viên
    if (user?.id) {
      const userKey = localStorage.getItem(`gemini_api_key_user_${user.id}`);
      if (userKey && userKey.trim()) return userKey.trim();
    }

    // 2. Kiểm tra API Key lưu chung toàn bộ ứng dụng
    const globalKey = localStorage.getItem(GLOBAL_GEMINI_KEY);
    if (globalKey && globalKey.trim()) return globalKey.trim();

    // 3. Kiểm tra API Key lưu khách
    const guestKey = localStorage.getItem(GUEST_GEMINI_KEY);
    if (guestKey && guestKey.trim()) return guestKey.trim();

    // 4. Kiểm tra Biến môi trường
    const envKey = ((import.meta as any).env?.VITE_GEMINI_API_KEY as string) || '';
    if (envKey && envKey.trim()) return envKey.trim();
  } catch (e) {
    console.error('Lỗi khi đọc Gemini API key từ localStorage:', e);
  }
  return '';
}

/**
 * Lưu API Key dùng chung toàn bộ ứng dụng và đồng bộ cho tài khoản Giáo viên
 */
export function saveStoredApiKey(apiKey: string, user?: UserAccount | null): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const trimmed = apiKey.trim();

    if (trimmed) {
      localStorage.setItem(GLOBAL_GEMINI_KEY, trimmed);
      localStorage.setItem(GUEST_GEMINI_KEY, trimmed);
      if (user?.id) {
        localStorage.setItem(`gemini_api_key_user_${user.id}`, trimmed);
      }
    } else {
      localStorage.removeItem(GLOBAL_GEMINI_KEY);
      localStorage.removeItem(GUEST_GEMINI_KEY);
      if (user?.id) {
        localStorage.removeItem(`gemini_api_key_user_${user.id}`);
      }
    }
  } catch (e) {
    console.error('Lỗi khi lưu Gemini API key vào localStorage:', e);
  }
}

/**
 * Xóa API Key khỏi tài khoản và ứng dụng
 */
export function clearStoredApiKey(user?: UserAccount | null): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(GLOBAL_GEMINI_KEY);
    localStorage.removeItem(GUEST_GEMINI_KEY);
    if (user?.id) {
      localStorage.removeItem(`gemini_api_key_user_${user.id}`);
    }
  } catch (e) {
    console.error('Lỗi khi xóa Gemini API key khỏi localStorage:', e);
  }
}
