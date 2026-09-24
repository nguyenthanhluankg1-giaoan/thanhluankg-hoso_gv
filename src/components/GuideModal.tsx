import React from 'react';
import {
  BookOpen,
  X,
  Sparkles,
  Award,
  Users,
  LayoutGrid,
  CalendarDays,
  ShieldAlert,
  Timer
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border-2 border-teal-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-teal-500 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-white/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black">Hướng dẫn sử dụng Lớp Học Thông Minh</h3>
              <p className="text-xs text-teal-100 mt-0.5">
                Các tính năng trợ giảng và tổ chức hoạt động vui nhộn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-start gap-3">
              <Users className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-teal-900 font-bold mb-1">1. Quản lý lớp & học sinh</strong>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tạo nhiều lớp học, thêm học sinh kèm ảnh đại diện, đánh dấu yêu thích và quản lý hoa thi đua theo từng môn học.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 flex items-start gap-3">
              <Award className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-rose-900 font-bold mb-1">2. Tích hoa 🌺 & Đổi quà</strong>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cộng/trừ hoa khen thưởng tức thì. Học sinh dùng số bông hoa tích lũy để đổi quà trong Cửa hàng quà tặng.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-emerald-900 font-bold mb-1">3. Vòng quay & Cuộn phim</strong>
                <p className="text-xs text-slate-600 leading-relaxed">
                  7 hiệu ứng lồng cầu 3D sinh động hoặc máy chiếu cuộn phim để gọi tên ngẫu nhiên, tự động loại trừ và thưởng hoa cho em may mắn.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-start gap-3">
              <LayoutGrid className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sky-900 font-bold mb-1">4. Sơ đồ chỗ ngồi 2D & 3D</strong>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Xếp vị trí chỗ ngồi theo các dãy bàn, tự động xếp ngẫu nhiên cả lớp và xuất ảnh PNG độ phân giải cao để in ấn.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-rose-900 font-bold mb-1">5. Chống ồn & Cảnh báo</strong>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Phát cảnh báo toàn màn hình kèm âm thanh, đếm ngược im lặng và đo mức ồn trực tiếp qua microphone máy tính.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-start gap-3">
              <Timer className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-purple-900 font-bold mb-1">6. Đồng hồ đếm ngược</strong>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Vòng tròn đếm ngược trực quan cho các bài tập nhóm, phát tiếng tích tắc 10 giây cuối và chuông báo khi hết giờ.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mt-2">
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2">
              💡 Lưu trữ dữ liệu đám mây
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mọi dữ liệu lớp học được tự động đồng bộ và lưu trữ an toàn trên Google Cloud Firestore và thiết bị của bạn. Thầy/Cô có thể vào mục <strong>Dữ liệu</strong> để kiểm tra trạng thái đồng bộ bất cứ lúc nào.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm shadow-md shadow-teal-600/25 transition-all"
          >
            Đã hiểu & Bắt đầu
          </button>
        </div>
      </div>
    </div>
  );
};
