import React, { useState } from 'react';
import {
  Database,
  AlertTriangle,
  RefreshCw,
  Cloud,
  CheckCircle2,
  Users,
  GraduationCap,
  Award,
  CalendarCheck,
  HardDrive,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { AppState, UserAccount } from '../../types';
import {
  saveAppStateToFirestore,
  loadAppStateFromFirestore,
  getUserWorkspaceKey
} from '../../services/dbService';

interface DataTabProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onResetState: () => void;
  currentUser?: UserAccount | null;
}

export const DataTab: React.FC<DataTabProps> = ({
  state,
  onUpdateState,
  onResetState,
  currentUser
}) => {
  const [cloudLoading, setCloudLoading] = useState(false);
  const [cloudMsg, setCloudMsg] = useState<string | null>(null);

  const workspaceKey = getUserWorkspaceKey(currentUser);
  const isTeacher = currentUser?.role === 'teacher';

  const totalClasses = state.classes.length;
  const totalStudents = state.students.length;
  const totalAttendanceRecords = Object.keys(state.attendance || {}).length;
  const totalTransactions = (state.transactions || []).length;
  const totalRewards = (state.rewards || []).length;

  const handleSyncToFirestore = async () => {
    setCloudLoading(true);
    setCloudMsg(null);
    try {
      const ok = await saveAppStateToFirestore(workspaceKey, state, {
        userId: currentUser?.id,
        teacherName: currentUser?.name,
        role: currentUser?.role
      });
      if (ok) {
        setCloudMsg(
          `Đã đồng bộ dữ liệu của không gian [${workspaceKey}] lên Cloud Firestore thành công!`
        );
      } else {
        setCloudMsg('Đồng bộ thất bại, vui lòng kiểm tra kết nối mạng.');
      }
    } catch (e) {
      setCloudMsg('Có lỗi xảy ra khi đồng bộ.');
    } finally {
      setCloudLoading(false);
      setTimeout(() => setCloudMsg(null), 4000);
    }
  };

  const handleSyncFromFirestore = async () => {
    if (
      !window.confirm(
        'Tải lại dữ liệu mới nhất từ Cloud Firestore? Dữ liệu chưa lưu tại máy có thể bị ghi đè.'
      )
    ) {
      return;
    }
    setCloudLoading(true);
    setCloudMsg(null);
    try {
      const data = await loadAppStateFromFirestore(workspaceKey, currentUser);
      if (data) {
        onUpdateState(() => data);
        setCloudMsg(`Đã tải và áp dụng dữ liệu mới nhất của [${workspaceKey}] từ Cloud Firestore!`);
      } else {
        setCloudMsg('Chưa tìm thấy dữ liệu trên Cloud Firestore cho không gian này.');
      }
    } catch (e) {
      setCloudMsg('Lỗi khi tải từ Firestore.');
    } finally {
      setCloudLoading(false);
      setTimeout(() => setCloudMsg(null), 4000);
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Bạn có chắc chắn muốn đặt lại toàn bộ ứng dụng về dữ liệu mẫu ban đầu? Mọi dữ liệu tự tạo sẽ được thiết lập lại.'
      )
    ) {
      onResetState();
      alert('Đã khôi phục dữ liệu mẫu ban đầu.');
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex items-center gap-2 p-5 rounded-3xl bg-white border-2 border-teal-100 shadow-md">
        <span className="p-1.5 rounded-xl bg-teal-100 text-teal-800">
          <Database className="w-5 h-5" />
        </span>
        <div>
          <h2 className="text-xl font-black text-slate-800">Quản lý Dữ liệu & Cơ Sở Dữ Liệu</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Dữ liệu lớp học được lưu trữ tự động trên Google Cloud Firestore và đồng bộ liên tục.
          </p>
        </div>
      </div>

      {cloudMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{cloudMsg}</span>
        </div>
      )}

      {/* Cloud Database Sync Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cloud className="w-5 h-5 text-teal-300 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-200">
              Cơ Sở Dữ Liệu Đám Mây Trực Tuyến
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-black border border-emerald-400/40">
              Cloud Firestore Live
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">
            Đồng Bộ Dữ Liệu {isTeacher ? `Giáo Viên (${currentUser?.name})` : 'Hệ Thống'}
          </h3>
          <p className="text-xs text-teal-100/80 mt-1 max-w-xl leading-relaxed">
            Không gian lưu trữ độc lập: <code className="bg-black/30 px-2 py-0.5 rounded font-mono text-amber-300">{workspaceKey}</code>. 
            Mọi thao tác của Thầy/Cô được phân lập an toàn, các tài khoản khác và quản trị viên không thể xem hoặc ghi đè.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto">
          <button
            onClick={handleSyncToFirestore}
            disabled={cloudLoading}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-white hover:bg-teal-50 text-teal-950 font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Cloud className="w-4 h-4 text-teal-600" />
            <span>{cloudLoading ? 'Đang lưu...' : 'Lưu lên Cloud ngay'}</span>
          </button>

          <button
            onClick={handleSyncFromFirestore}
            disabled={cloudLoading}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-teal-700/80 hover:bg-teal-700 text-white font-extrabold text-xs border border-teal-500/60 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${cloudLoading ? 'animate-spin' : ''}`} />
            <span>Tải lại từ Cloud</span>
          </button>
        </div>
      </div>

      {/* Database Overview & Statistics */}
      <div className="p-6 rounded-3xl bg-white border-2 border-teal-100 shadow-md">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <HardDrive className="w-5 h-5 text-teal-700" />
          <h3 className="text-base font-black text-slate-800">
            Tổng Quan Lưu Trữ Cơ Sở Dữ Liệu
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xl font-black text-teal-950">{totalClasses}</span>
              <span className="text-xs font-bold text-teal-700">Lớp học</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xl font-black text-emerald-950">{totalStudents}</span>
              <span className="text-xs font-bold text-emerald-700">Học sinh</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center flex-shrink-0">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xl font-black text-amber-950">
                {totalAttendanceRecords}
              </span>
              <span className="text-xs font-bold text-amber-700">Ngày điểm danh</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xl font-black text-purple-950">{totalRewards}</span>
              <span className="text-xs font-bold text-purple-700">Quà đổi thưởng</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold text-slate-700">
              Cơ sở dữ liệu đang hoạt động trực tuyến
            </span>
          </div>
          <span className="text-slate-400">
            Tổng cộng {totalTransactions} giao dịch khen thưởng đã được ghi nhận
          </span>
        </div>
      </div>

      {/* Danger Zone: Reset all */}
      <div className="p-6 rounded-3xl bg-rose-50/70 border-2 border-rose-200 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-800 font-black text-base">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Vùng dữ liệu cảnh báo</span>
          </div>
          <p className="text-xs text-rose-700/80 mt-1 max-w-xl leading-relaxed">
            Đặt lại toàn bộ ứng dụng về dữ liệu mẫu (Lớp 9/1 với danh sách học sinh mẫu). Thao tác này
            sẽ tái lập dữ liệu mặc định ban đầu.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex-shrink-0 flex items-center justify-center gap-2 py-2.5 px-5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Đặt lại dữ liệu mẫu</span>
        </button>
      </div>
    </div>
  );
};
