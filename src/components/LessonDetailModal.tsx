import React, { useState, useEffect } from 'react';
import { X, Sparkles, Save, BookOpen } from 'lucide-react';
import { LessonPlanRow } from '../types';

interface LessonDetailModalProps {
  isOpen: boolean;
  lesson: LessonPlanRow | null;
  onClose: () => void;
  onSave: (updatedLesson: LessonPlanRow) => void;
}

export const LessonDetailModal: React.FC<LessonDetailModalProps> = ({
  isOpen,
  lesson,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<LessonPlanRow | null>(lesson);

  useEffect(() => {
    setFormData(lesson);
  }, [lesson]);

  if (!isOpen || !formData) return null;

  const handleSuggestIntegration = (type: string) => {
    let text = '';
    switch (type) {
      case 'stem':
        text = 'Tích hợp STEM: Khám phá nguyên lý và vận dụng thực tiễn';
        break;
      case 'digital':
        text = 'Tích hợp chuyển đổi số: Sử dụng phần mềm học tập tương tác';
        break;
      case 'environment':
        text = 'Giáo dục bảo vệ môi trường và tiết kiệm năng lượng điện';
        break;
      case 'life_skills':
        text = 'Rèn luyện kỹ năng tự học, hợp tác và tư duy phản biện';
        break;
    }
    setFormData({
      ...formData,
      integrationNote: formData.integrationNote ? `${formData.integrationNote}; ${text}` : text
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave({
        ...formData,
        isCustomized: true
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-teal-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <h3 className="text-base font-black">
              Chỉnh sửa tiết dạy ({`Thứ ${formData.dayOfWeek}, Tiết ${formData.period}`})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Lớp học
              </label>
              <input
                type="text"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Môn học
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Buổi
              </label>
              <select
                value={formData.session}
                onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              >
                <option value="Sáng">Sáng</option>
                <option value="Chiều">Chiều</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Tiết học
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={isNaN(formData.period) ? 1 : formData.period}
                onChange={(e) => setFormData({ ...formData, period: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Ngày thực hiện
              </label>
              <input
                type="text"
                value={formData.dateStr}
                onChange={(e) => setFormData({ ...formData, dateStr: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                placeholder="DD/MM/YYYY"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Tên bài dạy
            </label>
            <textarea
              rows={2}
              value={formData.lessonName}
              onChange={(e) => setFormData({ ...formData, lessonName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              placeholder="Nhập tên bài dạy..."
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-600">
                Nội dung tích hợp / Điều chỉnh
              </label>
              <span className="text-[11px] text-teal-600 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Gợi ý nhanh:
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-2">
              <button
                type="button"
                onClick={() => handleSuggestIntegration('stem')}
                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 cursor-pointer"
              >
                + STEM
              </button>
              <button
                type="button"
                onClick={() => handleSuggestIntegration('digital')}
                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 cursor-pointer"
              >
                + Chuyển đổi số
              </button>
              <button
                type="button"
                onClick={() => handleSuggestIntegration('environment')}
                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
              >
                + Môi trường
              </button>
              <button
                type="button"
                onClick={() => handleSuggestIntegration('life_skills')}
                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 cursor-pointer"
              >
                + Kỹ năng sống
              </button>
            </div>

            <textarea
              rows={2}
              value={formData.integrationNote || ''}
              onChange={(e) => setFormData({ ...formData, integrationNote: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              placeholder="Ghi chú tích hợp STEM, kỹ năng sống, chuyển đổi số..."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
