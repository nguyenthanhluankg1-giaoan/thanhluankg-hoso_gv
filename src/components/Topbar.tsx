import React from 'react';
import { CheckCircle2, Menu, Database, LogOut, ShieldCheck, UserCheck } from 'lucide-react';
import { ClassInfo, TeacherProfile, UserAccount } from '../types';
import { Avatar } from './Avatar';

interface TopbarProps {
  title: string;
  subtitle: string;
  savedTime: string;
  classes: ClassInfo[];
  activeClassId: string;
  onSelectClass: (id: string) => void;
  teacher: TeacherProfile;
  studentCount: number;
  onOpenMobileSidebar: () => void;
  currentUser?: UserAccount | null;
  onLogout?: () => void;
  dbConnected?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  title,
  subtitle,
  savedTime,
  classes,
  activeClassId,
  onSelectClass,
  teacher,
  studentCount,
  onOpenMobileSidebar,
  currentUser,
  onLogout,
  dbConnected = true
}) => {
  return (
    <header className="sticky top-3.5 z-30 bg-white/95 backdrop-blur-md border-2 border-teal-200/80 rounded-3xl shadow-lg shadow-teal-900/5 p-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3">
      {/* Page titles */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-xl border border-teal-200 text-teal-700 lg:hidden hover:bg-teal-50 cursor-pointer"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-slate-800 tracking-tight truncate">
            {title}
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate hidden sm:block mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Top right actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        {/* Workspace isolation indicator */}
        {currentUser?.role !== 'admin' ? (
          <div
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800"
            title="Dữ liệu lớp học của Thầy/Cô được bảo mật độc lập, các giáo viên khác và quản trị viên không thể xem hay sửa."
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Riêng tư</span>
          </div>
        ) : (
          <div
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-[11px] font-bold text-purple-800"
            title="Tài khoản quản trị viên: chỉ quản lý tài khoản và hệ thống, không can thiệp hay hiển thị thao tác của giáo viên."
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Quản trị</span>
          </div>
        )}

        {/* Firestore Database Live Status */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 font-bold text-[10px]"
          title="Dữ liệu được lưu trữ trực tuyến trên Google Cloud Firestore theo từng tài khoản"
        >
          <Database className="w-3 h-3 text-teal-600 animate-pulse" />
          <span className="hidden md:inline">Cloud {savedTime}</span>
          <span className="md:hidden">{savedTime}</span>
        </div>

        {/* Class switcher or Admin mode */}
        {currentUser?.role === 'admin' ? (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-purple-100/70 border border-purple-200 text-purple-900 font-extrabold text-xs sm:text-sm">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Chế độ Quản trị</span>
          </div>
        ) : classes && classes.length > 0 ? (
          <div className="relative">
            <select
              value={activeClassId}
              onChange={(e) => onSelectClass(e.target.value)}
              className="appearance-none bg-purple-50 hover:bg-purple-100/80 text-purple-900 font-extrabold text-xs sm:text-sm py-2 px-3 sm:px-4 pr-7 sm:pr-8 rounded-2xl border border-purple-200 shadow-sm cursor-pointer outline-none focus:ring-2 focus:ring-purple-400 transition-all"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} · {cls.id === activeClassId ? `${studentCount} HS` : cls.grade}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-purple-700 text-xs">
              ▼
            </span>
          </div>
        ) : null}

        {/* User profile & Logout */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200">
          <Avatar
            name={currentUser ? currentUser.name : teacher.name}
            avatar={currentUser?.avatar || teacher.avatar}
            size="sm"
          />
          <div className="hidden xl:block leading-tight text-left">
            <div className="flex items-center gap-1">
              <strong className="block text-xs sm:text-sm font-extrabold text-slate-800 max-w-[130px] truncate">
                {currentUser ? currentUser.name : teacher.name}
              </strong>
            </div>
            <span className="text-[11px] text-teal-700 font-bold max-w-[130px] truncate flex items-center gap-1">
              {currentUser?.role === 'admin' ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-purple-600 inline" />
                  <span className="text-purple-700">Quản trị viên</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3 h-3 text-teal-600 inline" />
                  <span>{currentUser?.subject || teacher.role}</span>
                </>
              )}
            </span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

