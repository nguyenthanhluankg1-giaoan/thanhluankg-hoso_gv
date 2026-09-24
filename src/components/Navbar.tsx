import React from 'react';
import { FileText, Calendar, BookOpen, Sparkles, Settings } from 'lucide-react';

export type KhdhTabId = 'document' | 'ppct' | 'tkb' | 'ai' | 'settings';

interface NavbarProps {
  activeTab: KhdhTabId;
  onTabChange: (tab: KhdhTabId) => void;
  title?: string;
  academicYear?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  title = 'KẾ HOẠCH DẠY HỌC',
  academicYear = '2024 - 2025'
}) => {
  const tabs = [
    { id: 'document' as KhdhTabId, label: 'Kế hoạch dạy học', icon: FileText },
    { id: 'ppct' as KhdhTabId, label: 'Phân phối CT', icon: BookOpen },
    { id: 'tkb' as KhdhTabId, label: 'Thời khóa biểu', icon: Calendar },
    { id: 'ai' as KhdhTabId, label: 'SOẠN GIÁO ÁN', icon: Sparkles, badge: 'AI' },
    { id: 'settings' as KhdhTabId, label: 'Cấu hình văn bản', icon: Settings }
  ];

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-teal-100 shadow-sm sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-3 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <FileText className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                  {title}
                </h1>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  {academicYear}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500">
                Hệ thống quản lý kế hoạch dạy học & phân phối chương trình
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 font-black'
                      : 'text-slate-600 hover:text-teal-700 hover:bg-teal-50/70'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
