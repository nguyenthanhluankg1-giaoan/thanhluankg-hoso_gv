import React from 'react';
import {
  Home,
  School,
  GraduationCap,
  ClipboardCheck,
  LayoutGrid,
  CalendarDays,
  Gift,
  Sparkles,
  Film,
  VolumeX,
  Timer,
  Link as LinkIcon,
  BarChart3,
  Database,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { UserAccount } from '../types';

interface ClassroomNavBarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  studentCount: number;
  currentUser?: UserAccount | null;
  activeClassName?: string;
}

export const ClassroomNavBar: React.FC<ClassroomNavBarProps> = ({
  currentPage,
  onNavigate,
  studentCount,
  currentUser,
  activeClassName
}) => {
  const isAdmin = currentUser?.role === 'admin';

  const navItems = isAdmin
    ? [
        { id: 'accounts', label: 'Quản trị TK', icon: ShieldCheck, badge: 'ADMIN' },
        { id: 'home', label: 'Tổng quan hệ thống', icon: Home, badge: '' },
        { id: 'data', label: 'Dữ liệu hệ thống', icon: Database, badge: '' },
        { id: 'settings', label: 'Cài đặt hệ thống', icon: Settings, badge: '' }
      ]
    : [
        { id: 'home', label: 'Trang chủ', icon: Home, badge: '' },
        { id: 'classes', label: 'Lớp học', icon: School, badge: '' },
        { id: 'students', label: 'Học sinh', icon: GraduationCap, badge: studentCount > 0 ? `${studentCount}` : '' },
        { id: 'attendance', label: 'Điểm danh', icon: ClipboardCheck, badge: '' },
        { id: 'seating', label: 'Sơ đồ lớp', icon: LayoutGrid, badge: '' },
        { id: 'timetable', label: 'Thời khóa biểu', icon: CalendarDays, badge: '' },
        { id: 'rewards', label: 'Đổi quà', icon: Gift, badge: 'HOT' },
        { id: 'wheel', label: 'Vòng quay', icon: Sparkles, badge: 'HOT' },
        { id: 'film', label: 'Cuộn phim', icon: Film, badge: 'NEW' },
        { id: 'noise', label: 'Chống ồn', icon: VolumeX, badge: '' },
        { id: 'countdown', label: 'Đếm ngược', icon: Timer, badge: '' },
        { id: 'links', label: 'Liên kết', icon: LinkIcon, badge: '' },
        { id: 'stats', label: 'Thống kê', icon: BarChart3, badge: '' },
        { id: 'data', label: 'Dữ liệu', icon: Database, badge: '' },
        { id: 'settings', label: 'Cài đặt', icon: Settings, badge: '' }
      ];

  return (
    <div className="bg-white/90 backdrop-blur-md border border-teal-200/90 rounded-2xl shadow-sm p-2 mb-3">
      <div className="flex items-center justify-between gap-3 overflow-x-auto scrollbar-none py-0.5 px-1">
        <div className="flex items-center gap-2 shrink-0 pr-2 border-r border-slate-200/80">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-500 text-white flex items-center justify-center font-black text-xs shadow-sm shadow-teal-600/20">
            <School className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="hidden sm:block">
            <h3 className="text-xs font-black text-slate-800 tracking-tight leading-none">
              QUẢN LÝ LỚP HỌC
            </h3>
            {activeClassName && (
              <span className="text-[10px] font-bold text-teal-700 block mt-0.5">
                Lớp {activeClassName}
              </span>
            )}
          </div>
        </div>

        {/* Horizontal navbar selection list */}
        <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md shadow-teal-600/20 font-black'
                    : 'text-slate-600 hover:text-teal-800 hover:bg-teal-50/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : item.badge === 'HOT'
                        ? 'bg-rose-100 text-rose-600'
                        : item.badge === 'NEW'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-teal-100 text-teal-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
