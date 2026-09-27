import React, { useState, useEffect } from 'react';
import { Folder, ShieldAlert, AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { AppState, UserAccount } from './types';
import {
  loadStoredState,
  saveStoredState,
  getDefaultState,
  getDefaultStateForUser,
  getAccountExpirationInfo
} from './utils/helpers';
import {
  fetchUsersFromFirestore,
  getSavedSessionUser,
  saveSessionUser,
  saveAppStateToFirestore,
  loadAppStateFromFirestore,
  getUserWorkspaceKey,
  INITIAL_DEFAULT_USERS,
  fetchSystemConfig,
  saveSystemConfig
} from './services/dbService';

import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { ClassroomNavBar } from './components/ClassroomNavBar';
import { GuideModal } from './components/GuideModal';

import { HomeTab } from './components/tabs/HomeTab';
import { AccountsTab } from './components/tabs/AccountsTab';
import { ClassesTab } from './components/tabs/ClassesTab';
import { StudentsTab } from './components/tabs/StudentsTab';
import { AttendanceTab } from './components/tabs/AttendanceTab';
import { SeatingTab } from './components/tabs/SeatingTab';
import { TimetableTab } from './components/tabs/TimetableTab';
import { RewardsTab } from './components/tabs/RewardsTab';
import { WheelTab } from './components/tabs/WheelTab';
import { FilmTab } from './components/tabs/FilmTab';
import { NoiseTab } from './components/tabs/NoiseTab';
import { CountdownTab } from './components/tabs/CountdownTab';
import { LinksTab } from './components/tabs/LinksTab';
import { StatsTab } from './components/tabs/StatsTab';
import { DataTab } from './components/tabs/DataTab';
import { SettingsTab } from './components/tabs/SettingsTab';
import { KhdhModule } from './components/KhdhModule';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getSavedSessionUser());
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_DEFAULT_USERS);
  const [dbConnected, setDbConnected] = useState<boolean>(true);
  const [state, setState] = useState<AppState>(() => loadStoredState(getSavedSessionUser()));
  const [systemLogo, setSystemLogo] = useState<string>('');
  const [savedTime, setSavedTime] = useState<string>('vừa xong');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  // Initial load of users & state from Firestore
  useEffect(() => {
    let active = true;

    async function initializeFromCloud() {
      try {
        const config = await fetchSystemConfig();
        if (config && config.schoolLogo && active) {
          setSystemLogo(config.schoolLogo);
        }
      } catch (err) {
        console.warn('System config fetch error:', err);
      }

      try {
        const uList = await fetchUsersFromFirestore();
        if (active) {
          setUsers(uList);
          setDbConnected(true);

          // If current user is logged in, refresh session with latest status
          const savedUser = getSavedSessionUser();
          if (savedUser) {
            const found = uList.find((u) => u.id === savedUser.id);
            if (found) {
              if (found.status === 'locked') {
                saveSessionUser(null);
                setCurrentUser(null);
              } else {
                setCurrentUser(found);
                saveSessionUser(found);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Cloud users initialization error:', err);
      }

      try {
        const savedUser = getSavedSessionUser();
        if (savedUser && active) {
          const wsKey = getUserWorkspaceKey(savedUser);
          const cloudState = await loadAppStateFromFirestore(wsKey, savedUser);
          if (cloudState && active) {
            setState(cloudState);
            saveStoredState(savedUser, cloudState);
          }
        }
      } catch (err) {
        console.warn('Cloud app state initialization error:', err);
      }
    }

    initializeFromCloud();
    return () => {
      active = false;
    };
  }, []);

  // Auto-save whenever state changes: local storage + debounced cloud Firestore save for this specific user
  useEffect(() => {
    if (!currentUser) return;

    saveStoredState(currentUser, state);
    const now = new Date();
    setSavedTime(
      now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    );

    const wsKey = getUserWorkspaceKey(currentUser);
    const timer = setTimeout(() => {
      saveAppStateToFirestore(wsKey, state, {
        userId: currentUser.id,
        teacherName: currentUser.name,
        role: currentUser.role
      }).catch((err) =>
        console.warn('Debounced firestore save error:', err)
      );
    }, 1200);

    return () => clearTimeout(timer);
  }, [state, currentUser]);

  const handleUpdateSystemLogo = async (logo: string) => {
    setSystemLogo(logo);
    await saveSystemConfig({ schoolLogo: logo });
  };

  const handleUpdateState = (updater: (prev: AppState) => AppState) => {
    setState((prev) => updater(prev));
  };

  const handleResetState = () => {
    if (!currentUser) return;
    const fresh = getDefaultStateForUser(currentUser);
    setState(fresh);
    saveStoredState(currentUser, fresh);
    const wsKey = getUserWorkspaceKey(currentUser);
    saveAppStateToFirestore(wsKey, fresh, {
      userId: currentUser.id,
      teacherName: currentUser.name,
      role: currentUser.role
    }).catch(console.warn);
  };

  const handleNavigate = (page: string) => {
    handleUpdateState((prev) => ({ ...prev, currentPage: page }));
    setMobileSidebarOpen(false);
  };

  const handleLogin = async (user: UserAccount) => {
    saveSessionUser(user);
    setCurrentUser(user);

    // 1. Immediately load local isolated state for this specific user so UI switches without delay
    const localUserState = loadStoredState(user);
    localUserState.currentPage = user.role === 'admin' ? 'accounts' : 'home';
    setState(localUserState);

    // 2. Fetch the user's isolated workspace from Firestore in the background
    try {
      const wsKey = getUserWorkspaceKey(user);
      const cloudState = await loadAppStateFromFirestore(wsKey, user);
      if (cloudState) {
        cloudState.currentPage = user.role === 'admin' ? 'accounts' : 'home';
        setState(cloudState);
        saveStoredState(user, cloudState);
      }
    } catch (err) {
      console.warn('Error fetching cloud state on login:', err);
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      const wsKey = getUserWorkspaceKey(currentUser);
      saveStoredState(currentUser, state);
      saveAppStateToFirestore(wsKey, state, {
        userId: currentUser.id,
        teacherName: currentUser.name,
        role: currentUser.role
      }).catch(console.warn);
    }
    saveSessionUser(null);
    setCurrentUser(null);
    setMobileSidebarOpen(false);
  };

  const handleRefreshUsers = async () => {
    const list = await fetchUsersFromFirestore();
    setUsers(list);
    setDbConnected(true);
  };

  // If not logged in, show Login Screen
  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        users={users}
        dbConnected={dbConnected}
        systemLogo={systemLogo}
      />
    );
  }

  const activeClass =
    state.classes.find((c) => c.id === state.activeClassId) || state.classes[0];
  const activeStudents = state.students.filter((s) => s.classId === state.activeClassId);

  // Determine topbar titles
  const getPageInfo = () => {
    switch (state.currentPage) {
      case 'home':
        if (currentUser.role === 'admin') {
          return {
            title: 'Bảng Điều Khiển Quản Trị Hệ Thống',
            subtitle: `Xin chào Quản trị viên ${currentUser.name} · Phân quyền & Giám sát hệ thống`
          };
        }
        return {
          title: 'Bảng Điều Khiển Lớp Học',
          subtitle: `Chào mừng Thầy/Cô ${currentUser.name}${activeClass?.name ? ` · Lớp ${activeClass.name}` : ''}`
        };
      case 'accounts':
        return {
          title: 'Quản Trị Tài Khoản Giáo Viên',
          subtitle: 'Phân quyền, cấp tài khoản giáo viên và lưu trữ đồng bộ trên Cloud Firestore'
        };
      case 'classes':
        return {
          title: 'Quản Lý Danh Sách Lớp',
          subtitle: 'Thêm mới, chuyển đổi và quản lý thông tin các lớp học'
        };
      case 'students':
        return {
          title: 'Học Sinh & Thi Đua Tích Hoa 🌺',
          subtitle: `Danh sách học sinh${activeClass?.name ? ` lớp ${activeClass.name}` : ''} và hệ thống khen thưởng nề nếp`
        };
      case 'attendance':
        return {
          title: 'Điểm Danh Học Sinh',
          subtitle: `Sổ điểm danh hàng ngày${activeClass?.name ? ` lớp ${activeClass.name}` : ''}`
        };
      case 'seating':
        return {
          title: 'Sơ Đồ Chỗ Ngồi Lớp Học',
          subtitle: `Sơ đồ trực quan${activeClass?.name ? ` lớp ${activeClass.name}` : ''} (Chế độ xem 2D & 3D)`
        };
      case 'timetable':
        return {
          title: 'Thời Khóa Biểu Tuần',
          subtitle: `Lịch học các buổi sáng và chiều${activeClass?.name ? ` lớp ${activeClass.name}` : ''}`
        };
      case 'rewards':
        return {
          title: 'Cửa Hàng Đổi Quà',
          subtitle: 'Dùng bông hoa thi đua tích lũy để đổi quà tặng học tập'
        };
      case 'wheel':
        return {
          title: 'Lồng Cầu / Vòng Quay May Mắn',
          subtitle: 'Quay số gọi tên ngẫu nhiên với 7 hiệu ứng vật lý vui nhộn'
        };
      case 'film':
        return {
          title: 'Máy Chiếu Phim May Mắn',
          subtitle: 'Cuộn phim điện ảnh chọn ngẫu nhiên học sinh nhận thưởng'
        };
      case 'noise':
        return {
          title: 'Chống Ồn & Cảnh Báo Lớp Học',
          subtitle: 'Cảnh báo tức thì và máy đo âm thanh phòng học qua Microphone'
        };
      case 'countdown':
        return {
          title: 'Đồng Hồ Đếm Ngược Hoạt Động',
          subtitle: 'Hỗ trợ thảo luận nhóm, thi đua nhanh và làm bài tập'
        };
      case 'links':
        return {
          title: 'Tiện Ích Liên Kết Giáo Dục',
          subtitle: 'Lưu trữ nhanh các cổng học liệu, bài tập và phần mềm học tập'
        };
      case 'stats':
        return {
          title: 'Báo Cáo & Thống Kê Thi Đua',
          subtitle: `Bảng vàng vinh danh và xếp hạng thi đua${activeClass?.name ? ` lớp ${activeClass.name}` : ''}`
        };
      case 'data':
        return {
          title: 'Quản Lý Dữ Liệu & Cơ Sở Dữ Liệu',
          subtitle: 'Đồng bộ cơ sở dữ liệu Cloud Firestore và quản trị dữ liệu ứng dụng'
        };
      case 'settings':
        return {
          title: 'Cài Đặt Hệ Thống & Giáo Viên',
          subtitle: 'Cập nhật hồ sơ giảng dạy cá nhân và danh mục môn học'
        };
      case 'khdh':
        return {
          title: 'Kế Hoạch Dạy Học (KHDH)',
          subtitle: 'Quản lý kế hoạch dạy học, phân phối chương trình, thời khóa biểu & xuất file Word'
        };
      default:
        return {
          title: 'Lớp Học Thông Minh',
          subtitle: 'Trợ lý quản trị lớp học & hoạt động vui nhộn'
        };
    }
  };

  const pageInfo = getPageInfo();
  const currentUserExpInfo = getAccountExpirationInfo(currentUser);
  const isCurrentUserExpired = currentUser?.role !== 'admin' && currentUserExpInfo.isExpired;

  return (
    <div className="min-h-screen min-h-[100dvh] w-full overflow-x-hidden bg-gradient-to-br from-teal-50/70 via-emerald-50/40 to-teal-100/30 text-slate-800 flex flex-col lg:flex-row relative">
      {/* EXPIRED ACCOUNT LOCK OVERLAY */}
      {isCurrentUserExpired && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border-4 border-rose-300 w-full max-w-lg p-6 sm:p-8 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-rose-100 border-4 border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold text-xs uppercase tracking-wider">
                Hết Quyền Sử Dụng Tính Năng
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                Tài Khoản Đã Hết Thời Hạn Hoạt Động
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Xin chào Thầy/Cô <strong className="text-slate-800">{currentUser?.name}</strong> (@{currentUser?.username})
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-left text-xs sm:text-sm text-rose-950 font-medium space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-900">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>Thông báo khóa quyền truy cập:</span>
              </div>
              <p>
                Số ngày hoạt động được Quản trị viên cấp phép cho tài khoản của Thầy/Cô đã hết hạn vào ngày{' '}
                <strong className="font-extrabold underline">{currentUserExpInfo.formattedExpiresAt}</strong>.
              </p>
              <p>
                Tất cả các tính năng giảng dạy, lồng cầu, điểm danh và KHDH đã tự động tạm khóa.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200 text-left text-xs text-teal-900 font-medium">
              <strong className="font-bold text-teal-950 block mb-0.5">📞 Hướng dẫn đăng ký gia hạn:</strong>
              Vui lòng liên hệ với Ban Giám Hiệu hoặc Quản trị viên hệ thống để được đăng ký gia hạn thêm số ngày hoạt động. Khi Admin gia hạn xong, Thầy/Cô nhấn nút "Kiểm tra lại trạng thái" dưới đây để tiếp tục sử dụng.
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={async () => {
                  const list = await fetchUsersFromFirestore();
                  setUsers(list);
                  const fresh = list.find((u) => u.id === currentUser?.id);
                  if (fresh) {
                    setCurrentUser(fresh);
                    saveSessionUser(fresh);
                  }
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Kiểm Tra Lại Trạng Thái</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng Xuất</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Sidebar navigation */}
      <Sidebar
        currentPage={state.currentPage}
        onNavigate={handleNavigate}
        studentCount={activeStudents.length}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        onOpenGuide={() => setGuideModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        systemLogo={systemLogo}
        onUpdateLogo={handleUpdateSystemLogo}
      />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 px-2 sm:px-4 lg:px-6 py-2 sm:py-3.5 space-y-3 sm:space-y-4">
        {/* Topbar */}
        <Topbar
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          savedTime={savedTime}
          classes={state.classes}
          activeClassId={state.activeClassId}
          onSelectClass={(id) => handleUpdateState((prev) => ({ ...prev, activeClassId: id }))}
          teacher={state.teacher}
          studentCount={activeStudents.length}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
          dbConnected={dbConnected}
        />

        {/* Thanh chọn công cụ Quản lý lớp học ở bên phải (như mục Soạn giáo án) */}
        {state.currentPage !== 'khdh' && (
          <ClassroomNavBar
            currentPage={state.currentPage}
            onNavigate={handleNavigate}
            studentCount={activeStudents.length}
            currentUser={currentUser}
            activeClassName={activeClass?.name}
          />
        )}

        {/* Tab content area */}
        <main className="flex-1 pb-10">
          {state.currentPage === 'home' && (
            <HomeTab
              state={state}
              onNavigate={handleNavigate}
              onUpdateState={handleUpdateState}
              currentUser={currentUser}
              users={users}
            />
          )}

          {state.currentPage === 'accounts' && (
            <AccountsTab
              users={users}
              currentUser={currentUser}
              classes={state.classes}
              onRefreshUsers={handleRefreshUsers}
              dbConnected={dbConnected}
            />
          )}

          {state.currentPage === 'classes' && (
            <ClassesTab
              state={state}
              onUpdateState={handleUpdateState}
              onSwitchClass={(id) => handleUpdateState((prev) => ({ ...prev, activeClassId: id }))}
              onNavigate={handleNavigate}
            />
          )}

          {state.currentPage === 'students' && (
            <StudentsTab
              state={state}
              onUpdateState={handleUpdateState}
              onNavigate={handleNavigate}
            />
          )}

          {state.currentPage === 'attendance' && (
            <AttendanceTab
              state={state}
              onUpdateState={handleUpdateState}
            />
          )}

          {state.currentPage === 'seating' && (
            <SeatingTab
              state={state}
              onUpdateState={handleUpdateState}
            />
          )}

          {state.currentPage === 'timetable' && (
            <TimetableTab
              state={state}
              onUpdateState={handleUpdateState}
            />
          )}

          {state.currentPage === 'rewards' && (
            <RewardsTab
              state={state}
              onUpdateState={handleUpdateState}
            />
          )}

          {state.currentPage === 'wheel' && (
            <WheelTab
              state={state}
              onUpdateState={handleUpdateState}
            />
          )}

          {state.currentPage === 'film' && (
            <FilmTab
              state={state}
              onUpdateState={handleUpdateState}
            />
          )}

          {state.currentPage === 'noise' && (
            <NoiseTab />
          )}

          {state.currentPage === 'countdown' && (
            <CountdownTab
              state={state}
              onUpdateState={handleUpdateState}
            />
          )}

          {state.currentPage === 'links' && (
            <LinksTab
              state={state}
              onUpdateState={handleUpdateState}
            />
          )}

          {state.currentPage === 'stats' && (
            <StatsTab
              state={state}
            />
          )}

          {state.currentPage === 'data' && (
            <DataTab
              state={state}
              onUpdateState={handleUpdateState}
              onResetState={handleResetState}
              currentUser={currentUser}
            />
          )}

          {state.currentPage === 'settings' && (
            <SettingsTab
              state={state}
              onUpdateState={handleUpdateState}
            />
          )}

          {state.currentPage === 'khdh' && (
            <KhdhModule currentUser={currentUser} activeClassName={activeClass?.name} />
          )}
        </main>
      </div>

      {/* Guide Modal */}
      <GuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />
    </div>
  );
}
