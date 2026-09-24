import React, { useState } from 'react';
import { Settings, Save, RotateCcw, Building, User, Calendar, FileText } from 'lucide-react';
import { SchoolConfig } from '../types';
import { defaultSchoolConfig } from '../data/defaultData';

interface SettingsTabProps {
  config: SchoolConfig;
  onUpdateConfig: (config: SchoolConfig) => void;
  onResetConfig: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  config,
  onUpdateConfig,
  onResetConfig
}) => {
  const [formData, setFormData] = useState<SchoolConfig>(config);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleChange = (field: keyof SchoolConfig, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm('Khôi phục cấu hình trường và văn bản về mặc định?')) {
      setFormData(defaultSchoolConfig);
      onResetConfig();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border-2 border-teal-200/80 shadow-lg shadow-teal-900/5">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-800">
                Cấu Hình Văn Bản & Thông Tin Kế Hoạch
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                Thiết lập thông tin trường học, chức danh, người ký và ngày bắt đầu tuần 1
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mặc định</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Trường học & Cơ quan */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-teal-800 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-teal-600" />
              <span>Đơn vị & Trường học (Đầu trang bên trái)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Tên trường học (Dòng 1)
                </label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => handleChange('schoolName', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Tổ chuyên môn / Đơn vị trực thuộc (Dòng 2)
                </label>
                <input
                  type="text"
                  value={formData.departmentName}
                  onChange={(e) => handleChange('departmentName', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Tiêu đề & Thời gian */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-black text-teal-800 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Tiêu đề văn bản & Năm học</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Tiêu đề văn bản
                </label>
                <input
                  type="text"
                  value={formData.documentTitle}
                  onChange={(e) => handleChange('documentTitle', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Tên môn học giảng dạy
                </label>
                <input
                  type="text"
                  value={formData.subjectTitle}
                  onChange={(e) => handleChange('subjectTitle', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Năm học
                </label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => handleChange('academicYear', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Ngày bắt đầu tuần 1 (Thứ Hai)
                </label>
                <input
                  type="date"
                  value={formData.startDateWeek1}
                  onChange={(e) => handleChange('startDateWeek1', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Địa danh ký (Ví dụ: Thạnh Yên, Rạch Giá...)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Chức danh & Người ký */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-black text-teal-800 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              <span>Chức danh & Họ tên người ký</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Ban Giám Hiệu */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-black text-slate-500 block uppercase">
                  Ban Giám Hiệu
                </span>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Chức danh</label>
                  <input
                    type="text"
                    value={formData.principalTitle}
                    onChange={(e) => handleChange('principalTitle', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    value={formData.principalName}
                    onChange={(e) => handleChange('principalName', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Tổ Trưởng */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-black text-slate-500 block uppercase">
                  Tổ Trưởng Chuyên Môn
                </span>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Chức danh</label>
                  <input
                    type="text"
                    value={formData.headTeacherTitle}
                    onChange={(e) => handleChange('headTeacherTitle', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    value={formData.headTeacherName}
                    onChange={(e) => handleChange('headTeacherName', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Giáo Viên Giảng Dạy */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-black text-slate-500 block uppercase">
                  Giáo Viên Lập Kế Hoạch
                </span>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Chức danh</label>
                  <input
                    type="text"
                    value={formData.teacherTitle}
                    onChange={(e) => handleChange('teacherTitle', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    value={formData.teacherName}
                    onChange={(e) => handleChange('teacherName', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            {isSaved && (
              <span className="text-xs font-black text-emerald-600 animate-in fade-in">
                ✓ Đã lưu cấu hình thành công!
              </span>
            )}
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu cấu hình</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
