import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  UserCheck,
  Search,
  Filter,
  RefreshCw,
  KeyRound,
  Lock,
  Unlock,
  Trash2,
  Edit,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  School,
  BookOpen,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  X
} from 'lucide-react';
import { UserAccount, ClassInfo } from '../../types';
import { Avatar } from '../Avatar';
import {
  saveUserToFirestore,
  deleteUserFromFirestore,
  fetchUsersFromFirestore
} from '../../services/dbService';
import { uid } from '../../utils/helpers';

interface AccountsTabProps {
  users: UserAccount[];
  currentUser: UserAccount;
  classes: ClassInfo[];
  onRefreshUsers: () => Promise<void>;
  dbConnected: boolean;
}

export const AccountsTab: React.FC<AccountsTabProps> = ({
  users,
  currentUser,
  classes,
  onRefreshUsers,
  dbConnected
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'teacher'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'locked'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserAccount | null>(null);
  const [passwordModalUser, setPasswordModalUser] = useState<UserAccount | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Visible password toggles: Record<userId, boolean>
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Create form state
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '123456',
    role: 'teacher' as 'admin' | 'teacher',
    subject: 'Toán học',
    school: 'Trường TH Thạnh Yên 1',
    year: '2026 - 2027',
    phone: '',
    note: '',
    assignedClasses: [] as string[]
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshUsers();
      showToast('Đã đồng bộ danh sách tài khoản từ Cloud Firestore!');
    } catch (e) {
      showToast('Không thể đồng bộ cơ sở dữ liệu!', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Toggle show password
  const toggleShowPassword = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Handle Create User
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.username.trim() || !formData.password.trim()) {
      showToast('Vui lòng điền đầy đủ Họ tên, Tên đăng nhập và Mật khẩu!', 'error');
      return;
    }

    const cleanUsername = formData.username.trim().toLowerCase();

    // Check duplicate username
    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      showToast(`Tên đăng nhập "${cleanUsername}" đã tồn tại! Vui lòng chọn tên khác.`, 'error');
      return;
    }

    const newUser: UserAccount = {
      id: uid('usr'),
      username: cleanUsername,
      email: formData.email.trim() || `${cleanUsername}@lophoc.edu.vn`,
      name: formData.name.trim(),
      role: formData.role,
      password: formData.password.trim(),
      subject: formData.subject.trim(),
      school: formData.school.trim(),
      assignedClassIds: formData.assignedClasses,
      status: 'active',
      phone: formData.phone.trim(),
      note: formData.note.trim(),
      createdAt: new Date().toISOString()
    };

    setIsRefreshing(true);
    const ok = await saveUserToFirestore(newUser);
    await onRefreshUsers();
    setIsRefreshing(false);

    if (ok) {
      showToast(`Tạo thành công tài khoản giáo viên "${newUser.name}" trên Database!`);
      setCreateModalOpen(false);
      // Reset form
      setFormData({
        name: '',
        username: '',
        email: '',
        password: '123456',
        role: 'teacher',
        subject: 'Toán học',
        school: 'Trường TH Thạnh Yên 1',
        phone: '',
        note: '',
        assignedClasses: []
      });
    } else {
      showToast('Đã lưu tài khoản cục bộ (kết nối Firestore đang bận).', 'success');
      setCreateModalOpen(false);
    }
  };

  // Handle Edit User
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    setIsRefreshing(true);
    const ok = await saveUserToFirestore(editUser);
    await onRefreshUsers();
    setIsRefreshing(false);

    if (ok) {
      showToast(`Cập nhật thông tin "${editUser.name}" thành công!`);
    } else {
      showToast('Cập nhật thông tin cục bộ thành công.');
    }
    setEditUser(null);
  };

  // Handle Password Reset
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser || !newPassword.trim()) {
      showToast('Vui lòng nhập mật khẩu mới!', 'error');
      return;
    }

    const updated: UserAccount = {
      ...passwordModalUser,
      password: newPassword.trim()
    };

    setIsRefreshing(true);
    await saveUserToFirestore(updated);
    await onRefreshUsers();
    setIsRefreshing(false);

    showToast(`Đã đổi mật khẩu cho tài khoản "${updated.name}" thành công!`);
    setPasswordModalUser(null);
    setNewPassword('');
  };

  // Handle Toggle Lock
  const handleToggleLock = async (targetUser: UserAccount) => {
    if (targetUser.id === currentUser.id) {
      showToast('Bạn không thể tự khóa tài khoản của chính mình!', 'error');
      return;
    }

    const nextStatus = targetUser.status === 'active' ? 'locked' : 'active';
    const updated: UserAccount = { ...targetUser, status: nextStatus };

    setIsRefreshing(true);
    await saveUserToFirestore(updated);
    await onRefreshUsers();
    setIsRefreshing(false);

    showToast(
      nextStatus === 'locked'
        ? `Đã khóa tài khoản "${targetUser.name}"!`
        : `Đã mở khóa tài khoản "${targetUser.name}"!`
    );
  };

  // Handle Delete User
  const handleDeleteUser = async (targetUser: UserAccount) => {
    if (targetUser.id === currentUser.id) {
      showToast('Bạn không thể xóa tài khoản của chính mình!', 'error');
      return;
    }

    if (targetUser.role === 'admin') {
      const adminCount = users.filter((u) => u.role === 'admin').length;
      if (adminCount <= 1) {
        showToast('Hệ thống phải có ít nhất 1 tài khoản Quản trị viên!', 'error');
        return;
      }
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${targetUser.name}" (@${targetUser.username}) khỏi hệ thống?`)) {
      return;
    }

    setIsRefreshing(true);
    await deleteUserFromFirestore(targetUser.id);
    await onRefreshUsers();
    setIsRefreshing(false);

    showToast(`Đã xóa tài khoản "${targetUser.name}" khỏi cơ sở dữ liệu!`);
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.subject && u.subject.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchSearch && matchRole && matchStatus;
  });

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const teacherCount = users.filter((u) => u.role === 'teacher').length;
  const activeCount = users.filter((u) => u.status === 'active').length;

  return (
    <div className="space-y-5">
      {/* Toast message */}
      {message && (
        <div
          className={`p-3.5 rounded-2xl flex items-center gap-2.5 font-bold text-sm shadow-md transition-all ${
            message.type === 'success'
              ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-2 border-rose-300 text-rose-900'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border-2 border-teal-200/80 shadow-md shadow-teal-900/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng số tài khoản
            </span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-teal-950 mt-1">{users.length}</p>
          <span className="text-[11px] text-teal-700 font-semibold">
            {activeCount} tài khoản đang hoạt động
          </span>
        </div>

        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border-2 border-teal-200/80 shadow-md shadow-teal-900/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tài khoản Giáo viên
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-950 mt-1">{teacherCount}</p>
          <span className="text-[11px] text-emerald-700 font-semibold">
            Được cấp quyền quản lý lớp học
          </span>
        </div>

        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border-2 border-teal-200/80 shadow-md shadow-teal-900/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Quản trị viên
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-950 mt-1">{adminCount}</p>
          <span className="text-[11px] text-purple-700 font-semibold">
            Toàn quyền hệ thống & cấp tài khoản
          </span>
        </div>

        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border-2 border-teal-200/80 shadow-md shadow-teal-900/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Cơ sở dữ liệu
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm font-black text-blue-950 mt-1.5 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Cloud Firestore
          </p>
          <span className="text-[11px] text-blue-700 font-semibold block mt-0.5">
            Lưu trữ trực tuyến thời gian thực
          </span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-3xl border-2 border-teal-200/90 shadow-lg shadow-teal-900/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo họ tên, username, môn học, email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-teal-200/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-xs sm:text-sm font-medium bg-teal-50/30"
          />
          <Search className="w-4 h-4 text-teal-600 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-teal-200/80 bg-white font-bold text-xs text-slate-700 outline-none focus:ring-2 focus:ring-teal-300"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="teacher">Chỉ Giáo viên</option>
            <option value="admin">Chỉ Quản trị viên</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-teal-200/80 bg-white font-bold text-xs text-slate-700 outline-none focus:ring-2 focus:ring-teal-300"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="locked">Đã bị khóa</option>
          </select>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 transition-all font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Đồng bộ lại dữ liệu từ Firestore"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Đồng bộ</span>
          </button>

          {/* Add Teacher Button */}
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-teal-600/25 flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tạo Tài Khoản Giáo Viên</span>
          </button>
        </div>
      </div>

      {/* Users List Table / Cards */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border-2 border-teal-200/90 shadow-xl shadow-teal-900/5 overflow-hidden">
        <div className="px-5 py-4 border-b border-teal-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              Danh Sách Tài Khoản Trong Hệ Thống ({filteredUsers.length})
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Toàn bộ thông tin tài khoản được lưu trữ an toàn trên Cơ Sở Dữ Liệu Cloud Firestore
            </p>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-sm">Không tìm thấy tài khoản nào phù hợp.</p>
            <p className="text-xs text-slate-400 mt-1">
              Thầy/Cô hãy thử tìm kiếm với từ khóa khác hoặc nhấn "Tạo Tài Khoản Giáo Viên".
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {filteredUsers.map((user) => {
              const isSelf = user.id === currentUser.id;
              const isLocked = user.status === 'locked';
              const showPass = visiblePasswords[user.id] || false;

              return (
                <div
                  key={user.id}
                  className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                    isLocked ? 'bg-slate-50/70 opacity-80' : 'hover:bg-teal-50/40'
                  }`}
                >
                  {/* Left info */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <Avatar name={user.name} avatar={user.avatar} size="lg" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight truncate">
                          {user.name}
                        </h4>

                        {/* Role badge */}
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-teal-100 text-teal-800 border border-teal-200'
                          }`}
                        >
                          {user.role === 'admin' ? (
                            <ShieldCheck className="w-3 h-3 text-purple-600" />
                          ) : (
                            <UserCheck className="w-3 h-3 text-teal-600" />
                          )}
                          {user.role === 'admin' ? 'Quản Trị Viên' : 'Giáo Viên'}
                        </span>

                        {/* Status badge */}
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isLocked
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isLocked ? 'Đã khóa' : 'Hoạt động'}
                        </span>

                        {isSelf && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            Tài khoản hiện tại của bạn
                          </span>
                        )}
                      </div>

                      {/* Username, Email, School, Subject */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-500">Tên đăng nhập:</span>
                          <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-teal-800">
                            {user.username}
                          </code>
                        </div>

                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{user.email || 'Chưa cập nhật'}</span>
                        </div>

                        {user.subject && (
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                            <span>Môn: {user.subject}</span>
                          </div>
                        )}

                        {user.school && (
                          <div className="flex items-center gap-1.5 truncate">
                            <School className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{user.school}</span>
                          </div>
                        )}
                      </div>

                      {/* Password line (visible to Admin) */}
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
                        <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-bold text-slate-500">Mật khẩu:</span>
                        <code className="bg-amber-50 border border-amber-200 text-amber-900 px-2 py-0.5 rounded font-mono font-bold tracking-wider">
                          {showPass ? user.password : '••••••••'}
                        </code>
                        <button
                          type="button"
                          onClick={() => toggleShowPassword(user.id)}
                          className="p-1 text-slate-400 hover:text-slate-600"
                          title={showPass ? 'Ẩn mật khẩu' : 'Xem mật khẩu'}
                        >
                          {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(user.password);
                            showToast(`Đã sao chép mật khẩu của "${user.name}"!`);
                          }}
                          className="p-1 text-slate-400 hover:text-teal-600"
                          title="Sao chép mật khẩu"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex flex-wrap items-center gap-1.5 self-end lg:self-center">
                    {/* Reset Password */}
                    <button
                      onClick={() => {
                        setPasswordModalUser(user);
                        setNewPassword('');
                      }}
                      className="px-2.5 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title="Đổi / Cấp lại mật khẩu"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Đổi mật khẩu</span>
                    </button>

                    {/* Edit info */}
                    <button
                      onClick={() => setEditUser({ ...user })}
                      className="px-2.5 py-1.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title="Chỉnh sửa thông tin giáo viên"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>

                    {/* Lock / Unlock */}
                    {!isSelf && (
                      <button
                        onClick={() => handleToggleLock(user)}
                        className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isLocked
                            ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                            : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        title={isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                      >
                        {isLocked ? (
                          <>
                            <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Mở khóa</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                            <span>Khóa</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Delete */}
                    {!isSelf && (
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="p-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer"
                        title="Xóa tài khoản khỏi Database"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: CREATE TEACHER ACCOUNT */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-teal-200/90 w-full max-w-xl p-5 sm:p-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-teal-800">
                <UserPlus className="w-5 h-5 text-teal-600" />
                <h3 className="font-black text-lg">Tạo Tài Khoản Giáo Viên Mới</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ và tên giáo viên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ví dụ: Thầy Trần Quang Vinh"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên đăng nhập (Username) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                    placeholder="Ví dụ: gv_vinh"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-medium outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email giáo viên
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Ví dụ: vinh.tran@lophoc.edu.vn"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mật khẩu khởi tạo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mặc định: 123456"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-medium outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vai trò hệ thống
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-bold text-slate-800 outline-none"
                  >
                    <option value="teacher">Giáo viên giảng dạy / Chủ nhiệm</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Môn giảng dạy
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Ví dụ: Toán, Ngữ Văn, Tiếng Anh..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-medium outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trường học
                  </label>
                  <input
                    type="text"
                    value={formData.school}
                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                    placeholder="Trường học..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Niên khóa
                  </label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="2026 - 2027"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-medium outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="09xx..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi chú
                </label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Ví dụ: GVCN Khối 1, phụ trách phòng máy..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-medium outline-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs text-teal-900 font-medium">
                <p className="flex items-center gap-1.5 font-bold mb-0.5">
                  <Database className="w-3.5 h-3.5 text-teal-700" />
                  Lưu trữ trực tiếp trên Firestore Database
                </p>
                Tài khoản sau khi tạo sẽ có thể đăng nhập ngay lập tức trên mọi thiết bị thông qua hệ thống cơ sở dữ liệu đám mây.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-teal-600/25 cursor-pointer"
                >
                  Xác Nhận Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER */}
      {editUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-teal-200/90 w-full max-w-xl p-5 sm:p-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-teal-800">
                <Edit className="w-5 h-5 text-teal-600" />
                <h3 className="font-black text-lg">Chỉnh Sửa Thông Tin Giáo Viên</h3>
              </div>
              <button
                onClick={() => setEditUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ và tên giáo viên
                  </label>
                  <input
                    type="text"
                    required
                    value={editUser.name}
                    onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên đăng nhập (Username)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editUser.username}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vai trò
                  </label>
                  <select
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-bold text-slate-800 outline-none"
                  >
                    <option value="teacher">Giáo viên</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Môn giảng dạy
                  </label>
                  <input
                    type="text"
                    value={editUser.subject || ''}
                    onChange={(e) => setEditUser({ ...editUser, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trường học
                  </label>
                  <input
                    type="text"
                    value={editUser.school || ''}
                    onChange={(e) => setEditUser({ ...editUser, school: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-medium outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi chú
                </label>
                <input
                  type="text"
                  value={editUser.note || ''}
                  onChange={(e) => setEditUser({ ...editUser, note: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-medium outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-md cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET PASSWORD */}
      {passwordModalUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-amber-200 w-full max-w-md p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-amber-800">
                <KeyRound className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-lg">Đổi Mật Khẩu</h3>
              </div>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 mt-4">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                Bạn đang cấp lại mật khẩu cho tài khoản:{' '}
                <strong className="text-amber-950 font-extrabold">
                  {passwordModalUser.name}
                </strong>{' '}
                (<code>{passwordModalUser.username}</code>)
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu mới
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới (ví dụ: 123456)..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm font-medium outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-amber-600/25 cursor-pointer"
                >
                  Cập Nhật Mật Khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
