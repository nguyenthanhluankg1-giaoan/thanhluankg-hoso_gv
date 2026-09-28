import React, { useState, useEffect, useRef } from 'react';
import {
  Wand2,
  Palette,
  ListCheck,
  Printer,
  Key,
  GraduationCap,
  Sparkles,
  UserCheck,
  BookOpen,
  Plus,
  Trash2,
  Check,
  Download,
  Save,
  FolderOpen,
  FileText,
  Upload,
  ZoomIn,
  ZoomOut,
  X,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  FileSpreadsheet
} from 'lucide-react';
import { UserAccount } from '../../types';

interface WorksheetsTabProps {
  currentUser?: UserAccount | null;
}

export interface WorksheetOption {
  text: string;
  isCorrect?: boolean;
}

export interface WorksheetQuestion {
  id: number | string;
  badge: string;
  badgeColor: 'blue' | 'pink' | 'green' | 'orange' | 'purple' | string;
  prompt: string;
  subPrompt?: string;
  type: 'checkbox' | 'lines' | 'inline_blank' | 'ordering' | 'numbered_lines' | 'math_grid' | string;
  options?: WorksheetOption[];
  items?: string[];
  linesCount?: number;
  count?: number;
  label?: string;
  mathPairs?: string[];
  answerKey?: string;
  mascot: string;
}

export interface WorksheetData {
  id?: string;
  title: string;
  subtitle: string;
  subject: string;
  grade?: string;
  theme: 'football' | 'safari' | 'space' | 'ocean' | 'candy' | string;
  questions: WorksheetQuestion[];
  savedAt?: string;
}

// SVG Mascots dictionary
const MASCOT_SVGS: Record<string, React.ReactNode> = {
  bear_trophy: (
    <svg viewBox="0 0 90 90" className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow">
      <circle cx="28" cy="20" r="8" fill="#d97706" /><circle cx="28" cy="20" r="4" fill="#fde68a" />
      <circle cx="62" cy="20" r="8" fill="#d97706" /><circle cx="62" cy="20" r="4" fill="#fde68a" />
      <circle cx="45" cy="35" r="22" fill="#f59e0b" />
      <ellipse cx="45" cy="42" rx="10" ry="7" fill="#fef3c7" />
      <ellipse cx="45" cy="39" rx="3.5" ry="2.5" fill="#1e293b" />
      <path d="M 42 43 Q 45 46 48 43" stroke="#1e293b" strokeWidth="1.5" fill="none" />
      <circle cx="37" cy="32" r="2.5" fill="#1e293b" />
      <circle cx="53" cy="32" r="2.5" fill="#1e293b" />
      <path d="M 30 56 L 60 56 L 56 80 L 34 80 Z" fill="#0284c7" />
      <text x="45" y="72" fontFamily="Nunito, sans-serif" fontWeight="900" fontSize="12" fill="#ffffff" textAnchor="middle">7</text>
      <circle cx="68" cy="65" r="9" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
      <polygon points="68,61 71,63 70,67 66,67 65,63" fill="#1e293b" />
      <path d="M 75 30 L 85 30 L 80 42 L 77 42 L 77 48 L 83 48 L 83 50 L 73 50 L 73 48 L 76 48 L 76 42 Z" fill="#eab308" />
    </svg>
  ),
  girl_clap: (
    <svg viewBox="0 0 90 90" className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow">
      <circle cx="30" cy="30" r="12" fill="#1e293b" />
      <circle cx="48" cy="36" r="18" fill="#fed7aa" />
      <path d="M 32 30 Q 48 20 64 30 Q 56 22 40 24 Z" fill="#1e293b" />
      <circle cx="42" cy="36" r="2.5" fill="#1e293b" />
      <circle cx="56" cy="36" r="2.5" fill="#1e293b" />
      <circle cx="38" cy="40" r="3" fill="#fca5a5" opacity="0.7" />
      <circle cx="60" cy="40" r="3" fill="#fca5a5" opacity="0.7" />
      <path d="M 46 43 Q 49 47 52 43" stroke="#e11d48" strokeWidth="1.5" fill="none" />
      <path d="M 40 55 C 38 65, 48 65, 46 55" fill="#fed7aa" stroke="#f97316" strokeWidth="1.5" />
      <path d="M 52 55 C 50 65, 60 65, 58 55" fill="#fed7aa" stroke="#f97316" strokeWidth="1.5" />
      <circle cx="70" cy="35" r="8" fill="#f43f5e" opacity="0.15" />
      <path d="M 68 33 Q 70 30 73 33 Q 76 30 78 33 Q 78 37 73 41 Q 68 37 68 33 Z" fill="#f43f5e" />
    </svg>
  ),
  boy_pencil: (
    <svg viewBox="0 0 90 90" className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow">
      <circle cx="50" cy="34" r="18" fill="#fed7aa" />
      <path d="M 32 32 C 32 18, 68 18, 68 32 C 60 22, 40 22, 32 32 Z" fill="#1e293b" />
      <circle cx="44" cy="34" r="2.5" fill="#1e293b" />
      <circle cx="56" cy="34" r="2.5" fill="#1e293b" />
      <path d="M 47 40 Q 50 44 53 40" stroke="#e11d48" strokeWidth="1.5" fill="none" />
      <g transform="rotate(-30 50 50)">
        <rect x="52" y="30" width="8" height="35" fill="#eab308" rx="1" />
        <polygon points="52,65 60,65 56,74" fill="#fed7aa" />
        <polygon points="54,71 58,71 56,74" fill="#1e293b" />
      </g>
      <path d="M 30 65 Q 45 60 48 68 Q 51 60 66 65 L 66 76 Q 51 72 48 78 Q 45 72 30 76 Z" fill="#38bdf8" />
    </svg>
  ),
  backpack_ball: (
    <svg viewBox="0 0 90 90" className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow">
      <rect x="20" y="28" width="34" height="42" rx="8" fill="#0284c7" />
      <rect x="25" y="44" width="24" height="20" rx="4" fill="#38bdf8" />
      <circle cx="37" cy="50" r="3" fill="#facc15" />
      <path d="M 28 28 Q 37 18 46 28" stroke="#0369a1" strokeWidth="3" fill="none" />
      <circle cx="62" cy="58" r="15" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
      <polygon points="62,50 67,54 65,60 59,60 57,54" fill="#1e293b" />
      <polygon points="67,54 75,54 77,60 71,63 65,60" fill="#cbd5e1" />
    </svg>
  ),
  students_desk: (
    <svg viewBox="0 0 100 80" className="w-14 h-10 sm:w-16 sm:h-12 drop-shadow">
      <circle cx="34" cy="26" r="12" fill="#fed7aa" />
      <path d="M 24 22 C 24 12, 44 12, 44 22 Z" fill="#1e293b" />
      <circle cx="30" cy="26" r="1.5" fill="#1e293b" />
      <circle cx="38" cy="26" r="1.5" fill="#1e293b" />
      <circle cx="66" cy="26" r="12" fill="#fed7aa" />
      <path d="M 56 22 C 56 12, 76 12, 76 22 Z" fill="#831843" />
      <circle cx="62" cy="26" r="1.5" fill="#1e293b" />
      <circle cx="70" cy="26" r="1.5" fill="#1e293b" />
      <rect x="15" y="45" width="70" height="8" rx="2" fill="#b45309" />
      <rect x="22" y="38" width="16" height="3" fill="#22c55e" rx="1" />
      <rect x="20" y="41" width="20" height="4" fill="#ef4444" rx="1" />
      <rect x="62" y="39" width="18" height="6" fill="#3b82f6" rx="1" />
    </svg>
  ),
  lion_pencil: (
    <svg viewBox="0 0 90 90" className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow">
      <circle cx="45" cy="40" r="28" fill="#f97316" />
      <circle cx="45" cy="40" r="20" fill="#fef08a" />
      <circle cx="30" cy="24" r="6" fill="#f97316" />
      <circle cx="60" cy="24" r="6" fill="#f97316" />
      <circle cx="38" cy="38" r="2.5" fill="#1e293b" />
      <circle cx="52" cy="38" r="2.5" fill="#1e293b" />
      <polygon points="42,44 48,44 45,47" fill="#ea580c" />
      <path d="M 45 47 L 45 51" stroke="#ea580c" strokeWidth="1.5" />
    </svg>
  ),
  space_rocket: (
    <svg viewBox="0 0 90 90" className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow">
      <ellipse cx="45" cy="40" rx="14" ry="24" fill="#e2e8f0" />
      <path d="M 31 40 L 45 14 L 59 40 Z" fill="#ef4444" />
      <circle cx="45" cy="38" r="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
      <path d="M 28 50 L 20 62 L 32 58 Z" fill="#3b82f6" />
      <path d="M 62 50 L 70 62 L 58 58 Z" fill="#3b82f6" />
      <polygon points="40,64 50,64 45,74" fill="#f97316" />
    </svg>
  ),
  flower_pot: (
    <svg viewBox="0 0 90 90" className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow">
      <circle cx="45" cy="35" r="14" fill="#facc15" />
      <circle cx="45" cy="35" r="7" fill="#b45309" />
      <circle cx="45" cy="18" r="7" fill="#ec4899" />
      <circle cx="45" cy="52" r="7" fill="#ec4899" />
      <circle cx="28" cy="35" r="7" fill="#ec4899" />
      <circle cx="62" cy="35" r="7" fill="#ec4899" />
      <path d="M 45 52 L 45 68" stroke="#16a34a" strokeWidth="3" />
      <path d="M 33 68 L 57 68 L 53 82 L 37 82 Z" fill="#ea580c" />
    </svg>
  ),
  computer_screen: (
    <svg viewBox="0 0 90 90" className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow">
      <rect x="18" y="20" width="54" height="40" rx="6" fill="#3b82f6" />
      <rect x="23" y="25" width="44" height="30" rx="3" fill="#ecfeff" />
      <circle cx="36" cy="38" r="3" fill="#0284c7" />
      <circle cx="54" cy="38" r="3" fill="#0284c7" />
      <path d="M 40 46 Q 45 50 50 46" stroke="#0284c7" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="41" y="60" width="8" height="12" fill="#64748b" />
      <path d="M 28 72 L 62 72 L 58 76 L 32 76 Z" fill="#475569" />
    </svg>
  ),
  music_notes: (
    <svg viewBox="0 0 90 90" className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow">
      <circle cx="45" cy="48" r="22" fill="#fbcfe8" />
      <polygon points="26,38 32,20 42,32" fill="#f472b6" />
      <polygon points="64,38 58,20 48,32" fill="#f472b6" />
      <circle cx="45" cy="54" r="5" fill="#e11d48" />
      <path d="M 66 18 L 76 14 L 76 28 L 66 32 Z" fill="#9333ea" />
    </svg>
  ),
  science_beaker: (
    <svg viewBox="0 0 90 90" className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow">
      <path d="M 38 20 L 52 20 L 52 35 L 68 65 Q 70 72 62 74 L 28 74 Q 20 72 22 65 L 38 35 Z" fill="#ecfeff" stroke="#0284c7" strokeWidth="2" />
      <path d="M 26 62 Q 38 58 48 63 Q 56 60 64 62 L 62 74 L 28 74 Z" fill="#a855f7" opacity="0.8" />
      <circle cx="40" cy="50" r="3" fill="#e879f9" />
      <circle cx="50" cy="42" r="2.5" fill="#c084fc" />
    </svg>
  )
};

const DEFAULT_FOOTBALL_PRESET: WorksheetData = {
  title: "Bài 8: Cầu thủ dự bị",
  subtitle: "Tiếng Việt lớp 2 – Phiếu học tập",
  subject: "Tiếng Việt",
  grade: "Lớp 2",
  theme: "football",
  questions: [
    {
      id: 1,
      badge: "Câu 1",
      badgeColor: "blue",
      prompt: "Vì sao cuối cùng cả hai đội đều muốn gấu con về đội của mình?",
      subPrompt: "(đánh dấu vào ô trống trước đáp án đúng)",
      type: "checkbox",
      options: [
        { text: "Vì gấu con chịu khó đi nhặt bóng.", isCorrect: true },
        { text: "Vì gấu con đã đá bóng giỏi.", isCorrect: false },
        { text: "Vì gấu con cố gắng chạy thật nhanh.", isCorrect: false }
      ],
      mascot: "bear_trophy"
    },
    {
      id: 2,
      badge: "Câu 2",
      badgeColor: "pink",
      prompt: "Viết lại lời khen của các bạn dành cho gấu con trong bài đọc.",
      type: "lines",
      linesCount: 2,
      answerKey: "Lời khen: 'Cậu bắt bóng và nhặt bóng cừ thật đấy!'",
      mascot: "girl_clap"
    },
    {
      id: 3,
      badge: "Câu 3",
      badgeColor: "green",
      prompt: "Viết lại những tên riêng được viết đúng chính tả",
      subPrompt: "(Hồng, minh, Hùng, thùy, Phương, Giang)",
      type: "inline_blank",
      label: "Những tên viết đúng là:",
      answerKey: "Hồng, Hùng, Phương, Giang",
      mascot: "boy_pencil"
    },
    {
      id: 4,
      badge: "Câu 4",
      badgeColor: "orange",
      prompt: "Viết tên của các bạn học sinh dưới đây theo thứ tự trong bảng chữ cái.",
      type: "ordering",
      items: [
        "Nguyễn Ngọc Anh",
        "Nguyễn Mạnh Vũ",
        "Phạm Hồng Đào",
        "Hoàng Văn Cường",
        "Lê Gia Huy"
      ],
      answerKey: "(1) Nguyễn Ngọc Anh, (2) Hoàng Văn Cường, (3) Phạm Hồng Đào, (4) Lê Gia Huy, (5) Nguyễn Mạnh Vũ",
      mascot: "backpack_ball"
    },
    {
      id: 5,
      badge: "Câu 5",
      badgeColor: "purple",
      prompt: "Viết họ tên của em và 2 bạn trong tổ",
      type: "numbered_lines",
      count: 3,
      answerKey: "1. (Tên học sinh)  2. (Tên bạn 1)  3. (Tên bạn 2)",
      mascot: "students_desk"
    }
  ]
};

const SUBJECT_CONFIGS: Record<string, { placeholder: string; defaultReq: string; theme: string; topics: string[] }> = {
  "Tiếng Việt": {
    placeholder: "Bài 8: Cầu thủ dự bị (hoặc: Chữ hoa, Đọc hiểu, Điền từ)",
    defaultReq: "Gồm trắc nghiệm đọc hiểu, bài tập viết chính tả/từ ngữ, sắp xếp thứ tự từ, viết câu hoàn chỉnh.",
    theme: "football",
    topics: [
      "📖 Đọc hiểu trả lời câu hỏi",
      "✍️ Chính tả & Viết hoa tên riêng",
      "🔤 Sắp xếp theo bảng chữ cái",
      "💬 Viết câu nêu lời khen / cảm nghĩ",
      "🧩 Luyện từ và câu (Từ chỉ hoạt động, đồ vật)"
    ]
  },
  "Toán": {
    placeholder: "Bài: Phép cộng có nhớ / Bảng nhân 2, nhân 5",
    defaultReq: "Gồm tính nhẩm nhanh, điền dấu so sánh, bài toán đố có lời văn, nối phép tính với kết quả thích hợp.",
    theme: "safari",
    topics: [
      "⚡ Tính nhẩm nhanh",
      "⚖️ So sánh điền dấu (> , < , =)",
      "📝 Bài toán đố có lời văn",
      "📐 Nhận biết hình phẳng & độ dài",
      "🔢 Tìm thành phần chưa biết (X)"
    ]
  },
  "Tiếng Anh": {
    placeholder: "Unit 3: My Family / Colors and School Things",
    defaultReq: "Gồm trắc nghiệm chọn từ đúng qua mô tả tranh, sắp xếp trật tự từ tạo câu, viết câu trả lời ngắn.",
    theme: "space",
    topics: [
      "🔤 Vocabulary & Picture matching",
      "❓ Choose the correct option (A/B/C)",
      "✏️ Reorder words to form sentences",
      "💬 Short answers (Yes, it is / No, it isn't)"
    ]
  },
  "Tự nhiên và Xã hội": {
    placeholder: "Bài 12: Các mùa trong năm / Chăm sóc cây xanh",
    defaultReq: "Trắc nghiệm nhận biết hiện tượng tự nhiên, nối hành động đúng sai bảo vệ môi trường, viết cảm nhận ngắn.",
    theme: "candy",
    topics: [
      "🌿 Bộ phận của cây và con vật",
      "☀️ Hiện tượng thời tiết & Mùa",
      "🏠 Gia đình và ngôi nhà của em",
      "🛡️ An toàn giao thông & Sinh hoạt"
    ]
  },
  "Khoa học": {
    placeholder: "Bài: Năng lượng Mặt Trời / Sự biến đổi của chất",
    defaultReq: "Câu hỏi trắc nghiệm hiện tượng khoa học, giải thích thí nghiệm đơn giản, liên hệ đời sống thực tế.",
    theme: "space",
    topics: [
      "💧 Vòng tuần hoàn của nước",
      "⚡ Các dạng năng lượng quanh ta",
      "🌱 Sự phát triển của thực vật",
      "🩺 Dinh dưỡng và phòng ngừa bệnh"
    ]
  },
  "Lịch sử và Địa lí": {
    placeholder: "Bài: Khởi nghĩa Hai Bà Trưng / Địa hình vùng Đồng bằng",
    defaultReq: "Câu hỏi trắc nghiệm mốc thời gian, nối nhân vật với sự kiện, điền vào chỗ trống tóm tắt bài học.",
    theme: "safari",
    topics: [
      "👑 Nhân vật và chiến công hào hùng",
      "🗺️ Vị trí địa lí & Danh lam thắng cảnh",
      "🌾 Đặc điểm kinh tế - văn hóa các miền",
      "📅 Sắp xếp trình tự diễn biến lịch sử"
    ]
  },
  "Tin học": {
    placeholder: "Bài: Làm quen với máy tính / Quy tắc an toàn thông tin",
    defaultReq: "Trắc nghiệm nhận biết bàn phím chuột màn hình, đúng sai quy tắc ngồi học máy tính an toàn, thao tác thư mục.",
    theme: "space",
    topics: [
      "🖥️ Bộ phận máy tính & chức năng",
      "🖱️ Thao tác chuột và phím gõ",
      "🌐 An toàn thông tin trên mạng",
      "📁 Quản lí tệp và thư mục cơ bản"
    ]
  },
  "Công nghệ": {
    placeholder: "Bài: Đèn học để bàn / Lắp ghép mô hình xe đồ chơi",
    defaultReq: "Nhận diện các chi tiết sản phẩm, thứ tự các bước lắp ráp an toàn, cách sử dụng tiết kiệm năng lượng.",
    theme: "football",
    topics: [
      "💡 Cấu tạo & sử dụng đồ dùng gia đình",
      "🚗 Các bước lắp ráp mô hình kỹ thuật",
      "⚠️ Quy tắc an toàn sử dụng điện",
      "📐 Vẽ phác thảo ý tưởng sáng tạo"
    ]
  },
  "Đạo đức / Kỹ năng sống": {
    placeholder: "Bài: Biết ơn thầy cô giáo / Lắng nghe tích cực",
    defaultReq: "Tình huống đạo đức chọn cách ứng xử đúng, bày tỏ thái độ đồng tình hay không đồng tình, liên hệ bản thân.",
    theme: "candy",
    topics: [
      "❤️ Yêu thương và quan tâm bạn bè",
      "🤝 Lắng nghe & chia sẻ cảm xúc",
      "🕒 Quản lí thời gian tự lập",
      "🚦 Ứng phó khi gặp tình huống nguy hiểm"
    ]
  },
  "Hoạt động trải nghiệm": {
    placeholder: "Chủ đề: Ngày hội gia đình / Kế hoạch nhỏ nuôi heo đất",
    defaultReq: "Lập kế hoạch hành động 3 bước, tự đánh giá cảm xúc và hành vi, viết cam kết mục tiêu tuần mới.",
    theme: "safari",
    topics: [
      "🌟 Lập bảng mục tiêu tuần mới",
      "🧹 Giúp đỡ việc nhà cho bố mẹ",
      "🎨 Ý tưởng trang trí lớp học",
      "🌱 Gieo mầm việc tốt mỗi ngày"
    ]
  },
  "Âm nhạc": {
    placeholder: "Bài: Tiếng chuông và ngọn cờ / Nốt nhạc vui vẻ",
    defaultReq: "Trắc nghiệm nhận biết nốt Đồ - Rê - Mi - Pha - Son, nhận diện nhạc cụ gõ dân tộc, điền lời bài hát thiếu nhi.",
    theme: "candy",
    topics: [
      "🎼 Nhận biết nốt nhạc cơ bản",
      "🥁 Nhạc cụ gõ & Nhạc cụ giai điệu",
      "🎤 Điền lời ca khúc thiếu nhi",
      "👏 Gõ đệm theo tiết tấu bài hát"
    ]
  },
  "Mĩ thuật": {
    placeholder: "Chủ đề: Sắc màu thiên nhiên / Chân dung bạn thân",
    defaultReq: "Nhận biết gam màu nóng lạnh, nối màu bổ túc, bước vẽ phác thảo cơ bản, bài tập quan sát hình dạng.",
    theme: "candy",
    topics: [
      "🎨 Màu cơ bản & Màu pha trộn",
      "🔶 Hình khối và đường nét trang trí",
      "🌻 Vẽ phác thảo thiên nhiên quanh em",
      "✂️ Cắt dán thủ công sáng tạo"
    ]
  },
  "Giáo dục thể chất": {
    placeholder: "Bài: Động tác vươn thở và tay / Trò chơi nhảy tiếp sức",
    defaultReq: "Trắc nghiệm tư thế đúng sai khi tập thể dục, lợi ích của việc rèn luyện sức khỏe, luật trò chơi vận động.",
    theme: "football",
    topics: [
      "🤸 Các động tác bài thể dục buổi sáng",
      "⚽ Luật chơi & tinh thần đồng đội",
      "💧 Thói quen uống nước & khởi động đúng",
      "👟 Lựa chọn trang phục vận động phù hợp"
    ]
  }
};

export const WorksheetsTab: React.FC<WorksheetsTabProps> = ({ currentUser }) => {
  const [worksheet, setWorksheet] = useState<WorksheetData>(() => {
    try {
      const saved = localStorage.getItem('active_worksheet_data_v1');
      return saved ? JSON.parse(saved) : DEFAULT_FOOTBALL_PRESET;
    } catch {
      return DEFAULT_FOOTBALL_PRESET;
    }
  });

  const [activeTab, setActiveTab] = useState<'ai' | 'theme' | 'edit'>('ai');
  const [currentMode, setCurrentMode] = useState<'student' | 'teacher'>('student');
  const [lineStyle, setLineStyle] = useState<'dotted' | 'oli' | 'solid'>('dotted');
  const [zoom, setZoom] = useState<number>(0.9);

  // AI Inputs
  const [subject, setSubject] = useState<string>('Tiếng Việt');
  const [lessonTitle, setLessonTitle] = useState<string>('Bài 8: Cầu thủ dự bị');
  const [lessonContent, setLessonContent] = useState<string>(
    'Bài 8: Cầu thủ dự bị. Kể về chú Gấu con muốn tham gia đội bóng nhưng chưa đá giỏi nên làm dự bị nhặt bóng. Gấu con cố gắng nhặt bóng nhanh nhẹn, cổ vũ đồng đội nên cuối cùng cả 2 đội đều muốn gấu con về đội mình.\nYêu cầu 5 câu hỏi:\n- Câu 1: Trắc nghiệm lí do 2 đội mời gấu con.\n- Câu 2: Viết lại lời khen của các bạn.\n- Câu 3: Tìm tên riêng viết hoa đúng chính tả.\n- Câu 4: Sắp xếp danh sách 5 bạn học sinh theo thứ tự bảng chữ cái.\n- Câu 5: Viết họ tên của em và 2 bạn trong tổ.'
  );
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [uploadedMimeType, setUploadedMimeType] = useState<string>('image/png');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Saved Worksheets list
  const [savedList, setSavedList] = useState<WorksheetData[]>(() => {
    try {
      const stored = localStorage.getItem('saved_worksheets_collection_v1');
      return stored ? JSON.parse(stored) : [DEFAULT_FOOTBALL_PRESET];
    } catch {
      return [DEFAULT_FOOTBALL_PRESET];
    }
  });

  // Modals & Toast
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || currentUser?.apiKey || '');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'info' | 'success' | 'warning' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('active_worksheet_data_v1', JSON.stringify(worksheet));
    } catch {}
  }, [worksheet]);

  useEffect(() => {
    try {
      localStorage.setItem('saved_worksheets_collection_v1', JSON.stringify(savedList));
    } catch {}
  }, [savedList]);

  const showToast = (msg: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleSubjectChange = (newSubject: string) => {
    setSubject(newSubject);
    const cfg = SUBJECT_CONFIGS[newSubject];
    if (cfg) {
      setWorksheet((prev) => ({ ...prev, theme: cfg.theme, subject: newSubject }));
    }
  };

  const addTopicChip = (topicText: string) => {
    const cleanTopic = topicText.replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]\s*/u, '');
    if (!lessonContent.includes(cleanTopic)) {
      setLessonContent((prev) => (prev.trim() ? `${prev.trim()}\n- Dạng bài: ${cleanTopic}` : `- Dạng bài: ${cleanTopic}`));
      showToast(`Đã thêm "${cleanTopic}" vào nội dung bài học!`, 'success');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mime = file.type || 'image/png';
      setUploadedMimeType(mime);
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          const base64 = result.split(',')[1];
          setUploadedImageBase64(base64);
          const cleanName = file.name.replace(/\.[^/.]+$/, '');
          setLessonTitle(cleanName);
          showToast(`Đã nhận tệp "${file.name}". Bấm "AI Thiết Kế Phiếu Bài Tập Ngay" để trích xuất bài!`, 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Built-in Pedagogical Generator (Offline & Zero-Key Fallback)
  const generateOfflineWorksheet = (): WorksheetData => {
    const colors = ['blue', 'pink', 'green', 'orange', 'purple'];
    let questions: WorksheetQuestion[] = [];
    const effectiveTitle = lessonTitle || (uploadedFileName ? uploadedFileName.replace(/\.[^/.]+$/, '') : `${subject}: Phiếu Bài Tập`);

    if (subject === 'Tiếng Việt') {
      questions = [
        {
          id: 1,
          badge: 'Câu 1',
          badgeColor: 'blue',
          prompt: `Vì sao nội dung bài đọc "${effectiveTitle}" lại mang ý nghĩa đặc biệt đối với các bạn nhỏ?`,
          subPrompt: '(đánh dấu vào ô vuông trước đáp án đúng)',
          type: 'checkbox',
          options: [
            { text: 'Vì bài học giúp các em biết đoàn kết và luôn cố gắng giúp đỡ bạn bè.', isCorrect: true },
            { text: 'Vì các nhân vật chỉ thích chơi đùa một mình mà không cần ai.', isCorrect: false },
            { text: 'Vì không ai chịu chia sẻ đồ chơi cùng với nhau.', isCorrect: false }
          ],
          mascot: 'bear_trophy'
        },
        {
          id: 2,
          badge: 'Câu 2',
          badgeColor: 'pink',
          prompt: 'Viết 1 - 2 câu nêu cảm nghĩ hoặc lời khen của em dành cho các nhân vật trong bài đọc.',
          type: 'lines',
          linesCount: 2,
          answerKey: 'Gợi ý: Em rất khâm phục sự chăm chỉ, nhiệt tình và tinh thần đồng đội của các bạn.',
          mascot: 'girl_clap'
        },
        {
          id: 3,
          badge: 'Câu 3',
          badgeColor: 'green',
          prompt: 'Tìm và viết lại các tên riêng được viết đúng quy tắc chính tả viết hoa trong bài học:',
          subPrompt: '(Hải, nam, Minh, phương, Thảo, giang)',
          type: 'inline_blank',
          label: 'Những tên riêng viết đúng là:',
          answerKey: 'Hải, Minh, Thảo',
          mascot: 'boy_pencil'
        },
        {
          id: 4,
          badge: 'Câu 4',
          badgeColor: 'orange',
          prompt: 'Viết tên các bạn học sinh dưới đây theo đúng thứ tự trong bảng chữ cái (ABC):',
          type: 'ordering',
          items: ['Nguyễn Ngọc Anh', 'Phạm Hồng Đào', 'Lê Gia Huy', 'Hoàng Văn Cường', 'Nguyễn Mạnh Vũ'],
          answerKey: '(1) Nguyễn Ngọc Anh, (2) Hoàng Văn Cường, (3) Phạm Hồng Đào, (4) Lê Gia Huy, (5) Nguyễn Mạnh Vũ',
          mascot: 'backpack_ball'
        },
        {
          id: 5,
          badge: 'Câu 5',
          badgeColor: 'purple',
          prompt: 'Viết họ tên của em và 2 người bạn thân nhất trong lớp học:',
          type: 'numbered_lines',
          count: 3,
          answerKey: '1. (Họ tên học sinh)  2. (Họ tên bạn thứ nhất)  3. (Họ tên bạn thứ hai)',
          mascot: 'students_desk'
        }
      ];
    } else if (subject === 'Toán') {
      questions = [
        {
          id: 1,
          badge: 'Câu 1',
          badgeColor: 'blue',
          prompt: 'Tính nhẩm nhanh kết quả của các phép tính sau:',
          type: 'math_grid',
          mathPairs: ['2 × 4 = ......', '5 × 6 = ......', '2 × 8 = ......', '5 × 9 = ......'],
          mascot: 'lion_pencil'
        },
        {
          id: 2,
          badge: 'Câu 2',
          badgeColor: 'green',
          prompt: 'Mỗi nhóm học tập có 5 bạn học sinh. Hỏi 4 nhóm như thế có tất cả bao nhiêu bạn?',
          type: 'lines',
          linesCount: 2,
          answerKey: 'Bài giải: 4 nhóm có số bạn là: 5 × 4 = 20 (bạn). Đáp số: 20 bạn.',
          mascot: 'students_desk'
        },
        {
          id: 3,
          badge: 'Câu 3',
          badgeColor: 'orange',
          prompt: 'Điền dấu thích hợp (> , < , =) vào chỗ chấm:',
          subPrompt: '(chú ý tính kết quả hai vế trước khi so sánh)',
          type: 'checkbox',
          options: [
            { text: '2 × 5  =  5 × 2  (đều bằng 10)', isCorrect: true },
            { text: '5 × 4  >  5 × 7', isCorrect: false },
            { text: '2 × 6  <  2 × 3', isCorrect: false }
          ],
          mascot: 'backpack_ball'
        },
        {
          id: 4,
          badge: 'Câu 4',
          badgeColor: 'purple',
          prompt: 'Sắp xếp các số sau theo thứ tự từ bé đến lớn:',
          type: 'ordering',
          items: ['Số 45', 'Số 18', 'Số 92', 'Số 27', 'Số 63'],
          answerKey: '(1) 18, (2) 27, (3) 45, (4) 63, (5) 92',
          mascot: 'boy_pencil'
        },
        {
          id: 5,
          badge: 'Câu 5',
          badgeColor: 'pink',
          prompt: 'Viết 3 phép tính nhân có tích bằng 20 hoặc 30:',
          type: 'numbered_lines',
          count: 3,
          answerKey: '1. 2 × 10 = 20   2. 4 × 5 = 20   3. 5 × 6 = 30',
          mascot: 'girl_clap'
        }
      ];
    } else {
      questions = [
        {
          id: 1,
          badge: 'Câu 1',
          badgeColor: 'blue',
          prompt: `Em hãy chọn nhận định đúng nhất liên quan đến bài học "${effectiveTitle}":`,
          type: 'checkbox',
          options: [
            { text: 'Chủ động học tập, rèn luyện kỹ năng và lắng nghe thầy cô hướng dẫn.', isCorrect: true },
            { text: 'Không tham gia vào hoạt động chung của lớp học.', isCorrect: false },
            { text: 'Bỏ qua các bài thực hành được giao.', isCorrect: false }
          ],
          mascot: 'boy_pencil'
        },
        {
          id: 2,
          badge: 'Câu 2',
          badgeColor: 'pink',
          prompt: 'Viết 2 - 3 câu nêu những điều bổ ích mà em đã thu nhận được sau bài học này:',
          type: 'lines',
          linesCount: 2,
          answerKey: 'Em hiểu rõ hơn kiến thức thực tế và biết áp dụng vào sinh hoạt hàng ngày.',
          mascot: 'girl_clap'
        },
        {
          id: 3,
          badge: 'Câu 3',
          badgeColor: 'purple',
          prompt: 'Viết 3 mục tiêu hoặc việc làm cụ thể em cam kết thực hiện tốt trong tuần tới:',
          type: 'numbered_lines',
          count: 3,
          answerKey: '1. Hoàn thành bài tập đúng giờ   2. Giúp đỡ bạn bè   3. Giữ gìn vệ sinh lớp học',
          mascot: 'students_desk'
        }
      ];
    }

    return {
      title: effectiveTitle,
      subtitle: `${subject} – Phiếu học tập`,
      subject,
      theme: worksheet.theme || 'football',
      questions: questions.slice(0, numQuestions)
    };
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    const activeKey = apiKey.trim() || currentUser?.apiKey;

    try {
      const resp = await fetch('/api/gemini/generate-worksheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(activeKey ? { 'x-gemini-api-key': activeKey } : {})
        },
        body: JSON.stringify({
          subject,
          lessonTitle,
          lessonContent,
          numQuestions,
          fileBase64: uploadedImageBase64,
          mimeType: uploadedMimeType,
          customApiKey: activeKey
        })
      });

      if (resp.ok) {
        const resData = await resp.json();
        if (resData.success && resData.worksheet) {
          const data = resData.worksheet;
          setWorksheet((prev) => ({
            ...prev,
            title: data.title || prev.title,
            subtitle: data.subtitle || prev.subtitle,
            questions: data.questions || prev.questions
          }));
          if (data.title) {
            setLessonTitle(data.title);
          }
          showToast(`⭐ AI đã trích xuất bài "${data.title || lessonTitle}" từ tệp đính kèm và tạo phiếu bài tập thành công!`, 'success');
          setIsGenerating(false);
          return;
        }
      }

      // Fallback
      const offlineData = generateOfflineWorksheet();
      setWorksheet(offlineData);
      showToast('✨ Đã tạo phiếu bài tập theo yêu cầu bài học!', 'success');
    } catch (err) {
      console.warn('AI Worksheet Generation Error:', err);
      const offlineData = generateOfflineWorksheet();
      setWorksheet(offlineData);
      showToast('✨ Đã tạo phiếu bài tập thành công!', 'success');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToCollection = () => {
    const newItem: WorksheetData = {
      ...worksheet,
      id: Date.now().toString(),
      savedAt: new Date().toLocaleDateString('vi-VN')
    };
    setSavedList((prev) => [newItem, ...prev.filter((item) => item.title !== worksheet.title)]);
    showToast('Đã lưu phiếu vào Sổ tay Phiếu học tập!', 'success');
  };

  const removeQuestion = (idx: number) => {
    if (worksheet.questions.length <= 1) {
      showToast('Phiếu bài tập cần tối thiểu 1 câu hỏi!', 'warning');
      return;
    }
    setWorksheet((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx)
    }));
    showToast('Đã xóa câu hỏi!', 'success');
  };

  const addNewQuestion = () => {
    const nextNum = worksheet.questions.length + 1;
    const colors = ['blue', 'pink', 'green', 'orange', 'purple'];
    const newQ: WorksheetQuestion = {
      id: Date.now(),
      badge: `Câu ${nextNum}`,
      badgeColor: colors[nextNum % colors.length],
      prompt: 'Viết tiếp câu trả lời của em vào chỗ trống dưới đây:',
      type: 'lines',
      linesCount: 2,
      answerKey: 'Gợi ý làm bài tốt...',
      mascot: 'boy_pencil'
    };
    setWorksheet((prev) => ({
      ...prev,
      questions: [...prev.questions, newQ]
    }));
    showToast('Đã thêm câu mới!', 'success');
  };

  const getLineStyleClass = () => {
    if (lineStyle === 'oli') return 'oli-grid h-7 rounded border border-blue-200/60 my-0.5';
    if (lineStyle === 'solid') return 'border-b border-slate-300 h-6 my-0.5';
    return 'writing-line-dotted';
  };

  const getBadgeColorClasses = (color: string) => {
    switch (color) {
      case 'pink':
        return { badge: 'bg-rose-500 text-white', card: 'border-rose-200 bg-rose-50/20' };
      case 'green':
        return { badge: 'bg-emerald-600 text-white', card: 'border-emerald-200 bg-emerald-50/20' };
      case 'orange':
        return { badge: 'bg-orange-500 text-white', card: 'border-orange-200 bg-orange-50/20' };
      case 'purple':
        return { badge: 'bg-purple-600 text-white', card: 'border-purple-200 bg-purple-50/20' };
      default:
        return { badge: 'bg-sky-600 text-white', card: 'border-sky-200 bg-sky-50/20' };
    }
  };

  const selectTheme = (themeKey: 'football' | 'safari' | 'space' | 'ocean' | 'candy') => {
    setWorksheet((prev) => ({ ...prev, theme: themeKey }));
    showToast(`Đã đổi giao diện sang: ${themeKey.toUpperCase()}`, 'success');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <style>{`
        /* A4 Printable Sheet */
        .a4-page {
          width: 210mm;
          min-height: 297mm;
          height: 297mm;
          margin: 0 auto;
          background: white;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          position: relative;
          box-sizing: border-box;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* 3D Bubble Title Text Effect */
        .text-3d-shadow {
          text-shadow: 
            -2px -2px 0 #fff,  
             2px -2px 0 #fff,
            -2px  2px 0 #fff,
             2px  2px 0 #fff,
             0px  3px 0 #b45309,
             0px  5px 0 #78350f,
             2px  6px 8px rgba(0,0,0,0.3);
        }

        .text-title-green {
          text-shadow: 
            -2px -2px 0 #fff,  
             2px -2px 0 #fff,
            -2px  2px 0 #fff,
             2px  2px 0 #fff,
             0px  3px 0 #15803d,
             0px  5px 0 #14532d,
             2px  6px 8px rgba(0,0,0,0.3);
        }

        /* Dotted writing lines */
        .writing-line-dotted {
          border-bottom: 1.5px dotted #94a3b8;
          height: 24px;
          width: 100%;
          margin-bottom: 4px;
        }

        /* Vietnamese Primary School Grid (Vở ô li) */
        .oli-grid {
          background-size: 14px 14px;
          background-image: 
            linear-gradient(to right, rgba(147, 197, 253, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(147, 197, 253, 0.4) 1px, transparent 1px);
        }

        /* Ribbon Banner */
        .ribbon-banner {
          position: relative;
          display: inline-block;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .ribbon-banner::before, .ribbon-banner::after {
          content: '';
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          border: 14px solid transparent;
          z-index: -1;
        }
        .ribbon-banner::before {
          left: -20px;
          border-right-color: #be123c;
        }
        .ribbon-banner::after {
          right: -20px;
          border-left-color: #be123c;
        }

        @media print {
          body * {
            visibility: hidden;
          }
          #worksheet-canvas, #worksheet-canvas * {
            visibility: visible;
          }
          #worksheet-canvas {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 12mm 10mm !important;
            box-shadow: none !important;
            border-width: 3px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 0mm;
          }
        }
      `}</style>

      {/* TOP HEADER BAR FOR WORKSHEET STUDIO */}
      <div className="no-print bg-white rounded-3xl p-3 sm:p-4 border border-teal-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-md">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight flex items-center gap-2">
              Phiếu Học Tập Chuẩn A4
              <span className="text-[10px] px-2 py-0.5 bg-sky-100 text-sky-800 font-extrabold rounded-full">
                AI SmartWorksheet
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Trình tạo phiếu học tập sinh động, bám sát SGK & In ấn chuẩn nét
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode View Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setCurrentMode('student');
                showToast('Chế độ Học sinh (Không hiện đáp án)', 'info');
              }}
              className={`px-2.5 py-1 rounded-lg transition ${
                currentMode === 'student' ? 'bg-white shadow-sm text-sky-700' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              👨‍🎓 Học sinh
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentMode('teacher');
                showToast('Chế độ Giáo viên: Đã hiển thị đáp án gợi ý!', 'info');
              }}
              className={`px-2.5 py-1 rounded-lg transition ${
                currentMode === 'teacher' ? 'bg-white shadow-sm text-amber-700' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              🔑 Đáp án (G.Viên)
            </button>
          </div>

          {/* Quick Zoom */}
          <div className="hidden sm:flex items-center bg-slate-100 rounded-xl px-2 py-1 text-xs">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.05))}
              className="p-1 text-slate-600 hover:text-sky-600"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-bold text-slate-700">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.2, z + 0.05))}
              className="p-1 text-slate-600 hover:text-sky-600"
              title="Phóng to"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* API Key Modal Button */}
          <button
            type="button"
            onClick={() => setShowApiKeyModal(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-slate-200 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">
              {apiKey ? 'API Gemini' : 'Bộ Máy Tích Hợp'}
            </span>
          </button>

          {/* Save to collection */}
          <button
            type="button"
            onClick={handleSaveToCollection}
            className="px-3 py-1.5 bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 font-extrabold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-sky-600" />
            <span>Lưu Phiếu</span>
          </button>

          {/* Print A4 */}
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow hover:shadow-md hover:from-emerald-600 hover:to-teal-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In Phiếu A4 (PDF)</span>
          </button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN STUDIO LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        
        {/* LEFT CONTROL PANEL */}
        <div className="no-print w-full lg:w-[400px] xl:w-[430px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col shrink-0">
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'ai'
                  ? 'text-sky-600 border-b-2 border-sky-600 bg-white font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Soạn Bài</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('theme')}
              className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'theme'
                  ? 'text-sky-600 border-b-2 border-sky-600 bg-white font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-pink-500" />
              <span>Giao Diện</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'edit'
                  ? 'text-sky-600 border-b-2 border-sky-600 bg-white font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ListCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sửa Câu ({worksheet.questions.length})</span>
            </button>
          </div>

          {/* TAB 1: AI GENERATOR */}
          {activeTab === 'ai' && (
            <div className="p-4 space-y-3.5 max-h-[calc(100vh-210px)] overflow-y-auto">
              {/* Subject Selector */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Môn học (Chương trình GDPT)
                </label>
                <select
                  value={subject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-sky-400 outline-none"
                >
                  {Object.keys(SUBJECT_CONFIGS).map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Suggested Topics */}
              {SUBJECT_CONFIGS[subject] && (
                <div className="bg-sky-50/80 p-2.5 rounded-2xl border border-sky-100 space-y-1.5">
                  <label className="block text-[11px] font-extrabold text-sky-900 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      Dạng bài trọng tâm:
                    </span>
                    <span className="text-[10px] text-sky-600 font-normal">Nhấn để thêm</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {SUBJECT_CONFIGS[subject].topics.map((tp) => (
                      <button
                        key={tp}
                        type="button"
                        onClick={() => addTopicChip(tp)}
                        className="text-[11px] bg-white border border-sky-200 text-sky-800 px-2 py-0.5 rounded-lg hover:bg-sky-500 hover:text-white transition font-medium cursor-pointer"
                      >
                        {tp}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lesson Title */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Tên bài học hoặc chủ đề phiếu
                </label>
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="VD: Bài 8: Cầu thủ dự bị..."
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-sky-400 outline-none"
                />
              </div>

              {/* Detailed Content */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Nội dung bài học / Yêu cầu cụ thể
                </label>
                <textarea
                  rows={4}
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  placeholder="Nhập tóm tắt bài đọc hoặc các câu hỏi cần tạo..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-sky-400 outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Options & Settings */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Dòng kẻ làm bài
                  </label>
                  <select
                    value={lineStyle}
                    onChange={(e) => setLineStyle(e.target.value as any)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-1.5 font-medium outline-none"
                  >
                    <option value="dotted">Dòng chấm cute</option>
                    <option value="oli">Dòng ô li tiểu học</option>
                    <option value="solid">Dòng kẻ ngang</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Số lượng câu
                  </label>
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(parseInt(e.target.value, 10))}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-1.5 font-medium outline-none"
                  >
                    <option value={4}>4 câu (Thoáng đẹp)</option>
                    <option value={5}>5 câu (Chuẩn A4)</option>
                    <option value={6}>6 câu (Nhiều bài tập)</option>
                  </select>
                </div>
              </div>

              {/* AI Generate Action */}
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerateAI}
                className="w-full py-3 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 text-white font-extrabold text-xs sm:text-sm tracking-wide rounded-2xl shadow-lg transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Wand2 className="w-4 h-4 text-amber-300 animate-bounce" />
                <span>{isGenerating ? 'Đang tạo phiếu bài tập...' : 'AI Thiết Kế Phiếu Bài Tập Ngay'}</span>
              </button>
            </div>
          )}

          {/* TAB 2: THEME SELECTOR */}
          {activeTab === 'theme' && (
            <div className="p-4 space-y-3 max-h-[calc(100vh-210px)] overflow-y-auto">
              <p className="text-xs text-slate-500 font-medium">
                Chọn phong cách chủ đề phù hợp với sở thích học sinh:
              </p>

              <div className="space-y-2">
                {/* Theme 1: Football */}
                <div
                  onClick={() => selectTheme('football')}
                  className={`cursor-pointer p-3 rounded-2xl border-2 flex items-center gap-3 transition ${
                    worksheet.theme === 'football'
                      ? 'border-sky-500 bg-sky-50/70 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-sky-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-sky-600 text-white flex items-center justify-center text-lg font-bold shadow">
                    ⚽
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                      Cầu Thủ Sân Cỏ
                      {worksheet.theme === 'football' && (
                        <span className="text-[10px] bg-sky-500 text-white px-1.5 rounded">Đang chọn</span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-500">Khung xanh dương, chú gấu áo số 7, khung thành</p>
                  </div>
                </div>

                {/* Theme 2: Safari */}
                <div
                  onClick={() => selectTheme('safari')}
                  className={`cursor-pointer p-3 rounded-2xl border-2 flex items-center gap-3 transition ${
                    worksheet.theme === 'safari'
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 text-white flex items-center justify-center text-lg font-bold shadow">
                    🦁
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">Rừng Xanh Safari</h4>
                    <p className="text-[11px] text-slate-500">Xanh lá cây cỏ, sư tử nhỏ, dây leo rực rỡ</p>
                  </div>
                </div>

                {/* Theme 3: Space */}
                <div
                  onClick={() => selectTheme('space')}
                  className={`cursor-pointer p-3 rounded-2xl border-2 flex items-center gap-3 transition ${
                    worksheet.theme === 'space'
                      ? 'border-indigo-500 bg-indigo-50/70 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-indigo-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 text-white flex items-center justify-center text-lg font-bold shadow">
                    🚀
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">Phi Hành Gia Vũ Trụ</h4>
                    <p className="text-[11px] text-slate-500">Tàu con thoi, hành tinh xoay, ngôi sao lấp lánh</p>
                  </div>
                </div>

                {/* Theme 4: Ocean */}
                <div
                  onClick={() => selectTheme('ocean')}
                  className={`cursor-pointer p-3 rounded-2xl border-2 flex items-center gap-3 transition ${
                    worksheet.theme === 'ocean'
                      ? 'border-cyan-500 bg-cyan-50/70 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-cyan-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white flex items-center justify-center text-lg font-bold shadow">
                    🐬
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">Thế Giới Đại Dương</h4>
                    <p className="text-[11px] text-slate-500">Cá heo, san hô, bong bóng nước mát lành</p>
                  </div>
                </div>

                {/* Theme 5: Candy */}
                <div
                  onClick={() => selectTheme('candy')}
                  className={`cursor-pointer p-3 rounded-2xl border-2 flex items-center gap-3 transition ${
                    worksheet.theme === 'candy'
                      ? 'border-pink-500 bg-pink-50/70 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-pink-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 text-white flex items-center justify-center text-lg font-bold shadow">
                    🌸
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">Vườn Hoa & Bảy Sắc</h4>
                    <p className="text-[11px] text-slate-500">Hoa hướng dương, bướm lượn, bảng màu ấm áp</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: QUESTION EDITOR */}
          {activeTab === 'edit' && (
            <div className="p-4 space-y-3 max-h-[calc(100vh-210px)] overflow-y-auto">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-700">Danh sách câu hỏi ({worksheet.questions.length})</p>
                <button
                  type="button"
                  onClick={addNewQuestion}
                  className="text-xs px-2.5 py-1 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm câu
                </button>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                Mẹo: Thầy/Cô cũng có thể bấm trực tiếp vào chữ trên tờ A4 bên phải để chỉnh sửa!
              </p>

              <div className="space-y-2">
                {worksheet.questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-extrabold text-[11px] shrink-0">
                          {q.badge || `Câu ${idx + 1}`}
                        </span>
                        <input
                          type="text"
                          value={q.prompt}
                          onChange={(e) => {
                            const val = e.target.value;
                            setWorksheet((prev) => ({
                              ...prev,
                              questions: prev.questions.map((item, i) =>
                                i === idx ? { ...item, prompt: val } : item
                              )
                            }));
                          }}
                          className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-2 py-1 w-full outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeQuestion(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1 shrink-0 cursor-pointer"
                        title="Xóa câu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT WORKSPACE: LIVE INTERACTIVE A4 PREVIEW CANVAS */}
        <div className="flex-1 w-full bg-slate-200/80 p-3 sm:p-5 rounded-3xl overflow-auto flex justify-center items-start min-h-[600px]">
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            className="transition-transform duration-150"
          >
            {/* ACTUAL PRINTABLE A4 PAGE */}
            <article
              id="worksheet-canvas"
              className={`a4-page rounded-2xl p-5 border-4 font-sans select-text ${
                worksheet.theme === 'safari'
                  ? 'border-emerald-500'
                  : worksheet.theme === 'space'
                  ? 'border-indigo-500'
                  : worksheet.theme === 'ocean'
                  ? 'border-cyan-500'
                  : worksheet.theme === 'candy'
                  ? 'border-pink-400'
                  : 'border-sky-400'
              }`}
            >
              {/* TOP GARLAND FLAGS */}
              <div className="w-full flex justify-between items-center px-4 -mt-2 mb-1 pointer-events-none">
                <div className="flex gap-1.5">
                  <span className="w-3.5 h-4 bg-red-500 clip-triangle shadow-xs"></span>
                  <span className="w-3.5 h-4 bg-amber-400 clip-triangle shadow-xs"></span>
                  <span className="w-3.5 h-4 bg-sky-400 clip-triangle shadow-xs"></span>
                  <span className="w-3.5 h-4 bg-emerald-400 clip-triangle shadow-xs"></span>
                  <span className="w-3.5 h-4 bg-pink-400 clip-triangle shadow-xs"></span>
                </div>
                <div className="flex gap-1.5">
                  <span className="w-3.5 h-4 bg-pink-400 clip-triangle shadow-xs"></span>
                  <span className="w-3.5 h-4 bg-indigo-400 clip-triangle shadow-xs"></span>
                  <span className="w-3.5 h-4 bg-emerald-400 clip-triangle shadow-xs"></span>
                  <span className="w-3.5 h-4 bg-amber-400 clip-triangle shadow-xs"></span>
                  <span className="w-3.5 h-4 bg-red-500 clip-triangle shadow-xs"></span>
                </div>
              </div>

              {/* HEADER BANNER */}
              <div
                className={`relative rounded-2xl p-3 pt-2 border-2 shadow-xs overflow-hidden mb-3 ${
                  worksheet.theme === 'safari'
                    ? 'bg-gradient-to-b from-emerald-400 via-green-300 to-emerald-100 border-emerald-600'
                    : worksheet.theme === 'space'
                    ? 'bg-gradient-to-b from-indigo-500 via-purple-400 to-indigo-100 border-indigo-600'
                    : worksheet.theme === 'ocean'
                    ? 'bg-gradient-to-b from-cyan-400 via-sky-300 to-cyan-100 border-cyan-600'
                    : worksheet.theme === 'candy'
                    ? 'bg-gradient-to-b from-pink-400 via-rose-300 to-pink-100 border-pink-500'
                    : 'bg-gradient-to-b from-sky-400 via-sky-300 to-sky-100 border-sky-500'
                }`}
              >
                <div className="relative z-10 flex items-center justify-between">
                  {/* Left Mascot */}
                  <div className="w-16 h-20 flex-shrink-0 flex items-center justify-center">
                    {MASCOT_SVGS.bear_trophy}
                  </div>

                  {/* Center Title & Ribbon */}
                  <div className="flex-1 text-center px-2">
                    <h2
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        setWorksheet((prev) => ({ ...prev, title: e.currentTarget.innerText }))
                      }
                      className={`font-black text-2xl sm:text-3xl tracking-wide uppercase leading-tight cursor-text outline-none px-2 rounded hover:bg-white/20 transition ${
                        worksheet.theme === 'safari'
                          ? 'text-emerald-900 text-title-green'
                          : worksheet.theme === 'space'
                          ? 'text-amber-300 text-3d-shadow'
                          : 'text-orange-500 text-3d-shadow'
                      }`}
                    >
                      {worksheet.title}
                    </h2>

                    <div className="mt-1">
                      <div className="ribbon-banner inline-block bg-gradient-to-r from-pink-500 to-rose-600 text-white font-extrabold text-xs px-5 py-0.5 rounded-full shadow-md border-2 border-white/80">
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            setWorksheet((prev) => ({ ...prev, subtitle: e.currentTarget.innerText }))
                          }
                          className="outline-none tracking-wide"
                        >
                          {worksheet.subtitle}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Mascot */}
                  <div className="w-16 h-20 flex-shrink-0 flex items-center justify-center">
                    {MASCOT_SVGS.backpack_ball}
                  </div>
                </div>
              </div>

              {/* STUDENT INFO BAR */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-y-1 mb-2.5">
                <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
                  <span className="font-extrabold text-amber-900">Họ và tên:</span>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    className="flex-1 border-b border-dotted border-slate-400 font-medium text-slate-900 px-1 outline-none"
                  >
                    ...........................................................................
                  </span>
                </div>
                <div className="flex items-center gap-1.5 w-24">
                  <span className="font-extrabold text-amber-900">Lớp:</span>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    className="flex-1 border-b border-dotted border-slate-400 font-medium text-center outline-none"
                  >
                    2A1
                  </span>
                </div>
                <div className="flex items-center gap-1.5 w-24">
                  <span className="font-extrabold text-amber-900">Điểm:</span>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    className="flex-1 border-b border-dotted border-slate-400 font-extrabold text-center text-red-600 outline-none"
                  >
                    ...../10
                  </span>
                </div>
              </div>

              {/* QUESTIONS LIST CONTAINER */}
              <div className="flex-1 flex flex-col justify-between space-y-2">
                {worksheet.questions.map((q, idx) => {
                  const colorClasses = getBadgeColorClasses(q.badgeColor);
                  return (
                    <div
                      key={q.id || idx}
                      className={`relative p-2.5 rounded-2xl border-2 ${colorClasses.card} transition shadow-2xs`}
                    >
                      {/* Question Header */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-baseline gap-2 flex-wrap flex-1">
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-black shadow-xs ${colorClasses.badge}`}
                          >
                            {q.badge || `Câu ${idx + 1}`}
                          </span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              const val = e.currentTarget.innerText;
                              setWorksheet((prev) => ({
                                ...prev,
                                questions: prev.questions.map((item, i) =>
                                  i === idx ? { ...item, prompt: val } : item
                                )
                              }));
                            }}
                            className="text-xs font-extrabold text-slate-900 leading-snug cursor-text outline-none"
                          >
                            {q.prompt}
                          </span>
                          {q.subPrompt && (
                            <span
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => {
                                const val = e.currentTarget.innerText;
                                setWorksheet((prev) => ({
                                  ...prev,
                                  questions: prev.questions.map((item, i) =>
                                    i === idx ? { ...item, subPrompt: val } : item
                                  )
                                }));
                              }}
                              className="text-[11px] text-rose-500 font-semibold cursor-text outline-none"
                            >
                              {q.subPrompt}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Question Body rendering */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 pr-1">
                          {/* Checkbox Options */}
                          {q.type === 'checkbox' && (
                            <div className="space-y-1.5">
                              {(q.options || []).map((opt, oIdx) => (
                                <label key={oIdx} className="flex items-center gap-2 text-xs text-slate-800">
                                  <input
                                    type="checkbox"
                                    defaultChecked={Boolean(opt.isCorrect && currentMode === 'teacher')}
                                    className="w-4 h-4 rounded border-2 border-slate-400 text-sky-600 focus:ring-0"
                                  />
                                  <span
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => {
                                      const text = e.currentTarget.innerText;
                                      setWorksheet((prev) => ({
                                        ...prev,
                                        questions: prev.questions.map((item, i) => {
                                          if (i !== idx) return item;
                                          const opts = [...(item.options || [])];
                                          if (opts[oIdx]) opts[oIdx] = { ...opts[oIdx], text };
                                          return { ...item, options: opts };
                                        })
                                      }));
                                    }}
                                    className={`outline-none ${
                                      opt.isCorrect && currentMode === 'teacher'
                                        ? 'font-bold text-emerald-700 bg-emerald-50 px-1 rounded'
                                        : ''
                                    }`}
                                  >
                                    {opt.text}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}

                          {/* Lines Response */}
                          {q.type === 'lines' && (
                            <div>
                              {Array.from({ length: q.linesCount || 2 }).map((_, lIdx) => (
                                <div key={lIdx} className={getLineStyleClass()} />
                              ))}
                              {currentMode === 'teacher' && q.answerKey && (
                                <div className="mt-1 p-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium">
                                  <strong className="text-emerald-900">🔑 Đáp án:</strong> {q.answerKey}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Inline Blank */}
                          {q.type === 'inline_blank' && (
                            <div>
                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                <span contentEditable suppressContentEditableWarning className="outline-none">
                                  {q.label || 'Những tên viết đúng là:'}
                                </span>
                                <div className={`flex-1 ${getLineStyleClass()}`} />
                              </div>
                              {currentMode === 'teacher' && q.answerKey && (
                                <div className="mt-1 p-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium">
                                  <strong className="text-emerald-900">🔑 Đáp án:</strong> {q.answerKey}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Ordering */}
                          {q.type === 'ordering' && (
                            <div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-2 space-y-1 text-xs">
                                  {(q.items || []).map((it, iIdx) => (
                                    <div key={iIdx} className="flex items-center gap-1.5 text-slate-800 font-medium">
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
                                      <span contentEditable suppressContentEditableWarning className="outline-none">
                                        {it}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <div className="space-y-1">
                                  {(q.items || []).map((_, iIdx) => (
                                    <div key={iIdx} className="flex items-center gap-1.5 text-xs text-slate-600">
                                      <span className="font-bold text-orange-600">({iIdx + 1})</span>
                                      <div className={`flex-1 ${getLineStyleClass()}`} />
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {currentMode === 'teacher' && q.answerKey && (
                                <div className="mt-1 p-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium">
                                  <strong className="text-emerald-900">🔑 Đáp án:</strong> {q.answerKey}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Numbered Lines */}
                          {q.type === 'numbered_lines' && (
                            <div className="space-y-1">
                              {Array.from({ length: q.count || 3 }).map((_, iIdx) => (
                                <div key={iIdx} className="flex items-center gap-2 text-xs text-slate-700">
                                  <span className="font-extrabold text-purple-700">{iIdx + 1}.</span>
                                  <div className={`flex-1 ${getLineStyleClass()}`} />
                                </div>
                              ))}
                              {currentMode === 'teacher' && q.answerKey && (
                                <div className="mt-1 p-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium">
                                  <strong className="text-emerald-900">🔑 Đáp án:</strong> {q.answerKey}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Math Grid */}
                          {q.type === 'math_grid' && (
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {(q.mathPairs || ['2 × 4 = ......', '5 × 6 = ......', '2 × 8 = ......', '5 × 9 = ......']).map(
                                (p, pIdx) => (
                                  <div
                                    key={pIdx}
                                    className="p-2 bg-amber-50/70 border border-amber-200 rounded-xl font-bold text-slate-800 text-center tracking-wider font-mono"
                                  >
                                    {p}
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>

                        {/* Mascot Icon */}
                        <div className="flex-shrink-0 flex items-center justify-center">
                          {MASCOT_SVGS[q.mascot] || MASCOT_SVGS.bear_trophy}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* BOTTOM FOOTER */}
              <div className="mt-2 pt-1 border-t-2 border-dashed border-emerald-300 relative flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <div className="flex items-center gap-1 text-emerald-700 font-bold">
                  <span>⭐ Cố gắng lên nào, em là một học sinh xuất sắc! ⭐</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Trang 1 / 1</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="no-print fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold max-w-sm animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* API KEY CONFIGURATION MODAL */}
      {showApiKeyModal && (
        <div className="no-print fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-base">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Cấu hình Gemini API</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Lựa chọn chế độ AI trực tuyến hoặc tích hợp</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p className="bg-sky-50 text-sky-800 p-2.5 rounded-xl border border-sky-200 font-medium">
                💡 <strong>Mẹo:</strong> Ứng dụng đã tích hợp sẵn <strong>Bộ máy Sư phạm Thông minh</strong>. Thầy/Cô có thể soạn phiếu ngay tức thì mà không bắt buộc phải nhập API Key!
              </p>
              <p>Nếu muốn sử dụng mô hình Google Gemini trực tuyến, vui lòng nhập API Key:</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Google Gemini API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setApiKey('');
                  localStorage.removeItem('gemini_api_key');
                  showToast('Đã xóa khóa API!', 'info');
                  setShowApiKeyModal(false);
                }}
                className="px-3 py-2 text-xs text-rose-600 font-bold hover:bg-rose-50 rounded-xl transition cursor-pointer"
              >
                Xóa khóa
              </button>
              <button
                type="button"
                onClick={() => {
                  if (apiKey.trim()) {
                    localStorage.setItem('gemini_api_key', apiKey.trim());
                    showToast('Đã lưu API Key thành công!', 'success');
                  }
                  setShowApiKeyModal(false);
                }}
                className="px-4 py-2 text-xs bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition shadow cursor-pointer"
              >
                Lưu & Áp Dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
