import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import {
  UserAccount,
  AppState,
  SchoolConfig,
  PpctItem,
  TimetableSlot,
  LessonPlanRow,
  DetailedLessonPlan,
  ConfiguredClass
} from '../types';
import { getDefaultState } from '../utils/helpers';

// Operation types for error handling
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const LOCAL_USERS_KEY = 'lopHoc_system_users_v1';
const CURRENT_USER_SESSION_KEY = 'lopHoc_current_user_session';

export const INITIAL_DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr_admin',
    username: 'admin',
    email: 'admin@lophoc.edu.vn',
    name: 'Quản Trị Viên Hệ Thống',
    role: 'admin',
    password: 'admin123',
    subject: 'Quản trị hệ thống',
    school: 'Trường TH Thạnh Yên 1',
    status: 'active',
    note: 'Tài khoản Quản trị viên cấp cao toàn quyền quản lý tài khoản giáo viên và hệ thống.',
    createdAt: new Date().toISOString()
  }
];

// Helper to get local cached users
export function getLocalCachedUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading local users cache', e);
  }
  return INITIAL_DEFAULT_USERS;
}

// Helper to save local cached users
export function setLocalCachedUsers(users: UserAccount[]) {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error writing local users cache', e);
  }
}

/**
 * Fetch all user accounts from Firestore.
 * If database is empty, seed default accounts.
 */
export async function fetchUsersFromFirestore(): Promise<UserAccount[]> {
  const usersCol = collection(db, 'users');
  try {
    const snapshot = await getDocs(usersCol);

    if (snapshot.empty) {
      console.log('No users found in Firestore. Seeding default accounts...');
      // Seed default accounts to Firestore
      for (const u of INITIAL_DEFAULT_USERS) {
        await setDoc(doc(db, 'users', u.id), u);
      }
      setLocalCachedUsers(INITIAL_DEFAULT_USERS);
      return INITIAL_DEFAULT_USERS;
    }

    const list: UserAccount[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as UserAccount);
    });

    // Make sure admin exists
    const hasAdmin = list.some((u) => u.role === 'admin');
    if (!hasAdmin) {
      const adminAcc = INITIAL_DEFAULT_USERS[0];
      await setDoc(doc(db, 'users', adminAcc.id), adminAcc);
      list.unshift(adminAcc);
    }

    setLocalCachedUsers(list);
    return list;
  } catch (err: any) {
    // If it's a connection or offline error, use local cache silently with a helpful log
    if (err?.code === 'unavailable' || err?.message?.includes('unavailable') || err?.message?.includes('offline') || err?.code === 'failed-precondition') {
      console.warn('Firestore is currently operating offline/unavailable, using local cache.');
      return getLocalCachedUsers();
    }
    
    // Otherwise log and fallback
    console.warn('Firestore fetch users notice:', err?.message || err);
    return getLocalCachedUsers();
  }
}

/**
 * Create or update a user in Firestore
 */
export async function saveUserToFirestore(user: UserAccount): Promise<boolean> {
  const path = `users/${user.id}`;
  try {
    await setDoc(doc(db, 'users', user.id), user);
    // Update local cache
    const currentList = getLocalCachedUsers();
    const idx = currentList.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      currentList[idx] = user;
    } else {
      currentList.push(user);
    }
    setLocalCachedUsers(currentList);
    return true;
  } catch (err: any) {
    if (err?.code === 'unavailable' || err?.message?.includes('unavailable') || err?.message?.includes('offline')) {
      console.warn('Firestore unavailable, saved to local cache only.');
      return false;
    }
    console.warn('Save user Firestore notice:', err?.message || err);
    return false;
  }
}

/**
 * Delete a user from Firestore
 */
export async function deleteUserFromFirestore(userId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'users', userId));
    const currentList = getLocalCachedUsers().filter((u) => u.id !== userId);
    setLocalCachedUsers(currentList);
    return true;
  } catch (err) {
    console.error('Failed to delete user from Firestore:', err);
    const currentList = getLocalCachedUsers().filter((u) => u.id !== userId);
    setLocalCachedUsers(currentList);
    return false;
  }
}

/**
 * Get unique workspace document key for a user
 */
export function getUserWorkspaceKey(user?: UserAccount | null | string): string {
  if (!user) return 'workspace_guest';
  const userId = typeof user === 'string' ? user : user.id;
  return `workspace_${userId}`;
}

/**
 * Helper to recursively remove empty string keys from an object.
 * Firestore does not allow empty string keys in maps.
 */
function sanitizeFirestoreData(data: any): any {
  if (Array.isArray(data)) {
    return data.map(sanitizeFirestoreData);
  } else if (data !== null && typeof data === 'object' && !(data instanceof Date)) {
    const sanitized: any = {};
    for (const key in data) {
      if (key === '') {
        console.warn('Stripping empty string key from Firestore data');
        continue;
      }
      sanitized[key] = sanitizeFirestoreData(data[key]);
    }
    return sanitized;
  }
  return data;
}

/**
 * Save Classroom App State to Firestore in isolated workspace
 */
export async function saveAppStateToFirestore(
  key: string,
  state: AppState,
  meta?: { userId?: string; teacherName?: string; role?: string }
): Promise<boolean> {
  const path = `workspaces/${key}`;
  try {
    const docRef = doc(db, 'workspaces', key);
    const sanitizedState = sanitizeFirestoreData(state);
    
    await setDoc(docRef, {
      ...sanitizedState,
      ownerUserId: meta?.userId || state.ownerUserId || '',
      ownerName: meta?.teacherName || state.teacher?.name || '',
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err: any) {
    if (err?.code === 'unavailable' || err?.message?.includes('unavailable') || err?.message?.includes('offline')) {
      console.warn('Firestore unavailable, state saved to local cache.');
      return false;
    }
    console.warn('Save app state Firestore notice:', err?.message || err);
    return false;
  }
}

/**
 * Load Classroom App State from Firestore in isolated workspace
 */
export async function loadAppStateFromFirestore(
  key: string,
  user?: UserAccount | null
): Promise<AppState | null> {
  try {
    // 1. Try loading from isolated workspaces collection
    const docRef = doc(db, 'workspaces', key);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as AppState;
      if (data && data.version) {
        return data;
      }
    }

    return null;
  } catch (err) {
    console.error('Failed to load classroom state from Firestore:', err);
    return null;
  }
}

/**
 * Get user-isolated LocalStorage keys
 */
export function getUserKhdhStorageKeys(userId?: string | null) {
  const prefix = userId ? `khdh_u_${userId}` : 'khdh_u_guest';
  return {
    CONFIG: `${prefix}_config_v1`,
    PPCT: `${prefix}_ppct_list_v1`,
    TIMETABLE: `${prefix}_timetable_v1`,
    CUSTOMIZED_WEEKS: `${prefix}_customized_weeks_v1`,
    CONFIGURED_CLASSES: `${prefix}_configured_classes_v1`,
    SAVED_PLANS: `${prefix}_saved_lesson_plans_v1`,
    ACTIVE_TAB: `${prefix}_active_tab_v1`
  };
}

/**
 * Save KHDH Data to Firestore
 */
export async function saveKhdhDataToFirestore(
  userId: string,
  data: {
    config: SchoolConfig;
    ppctList: PpctItem[];
    timetable: TimetableSlot[];
    customizedWeeks: Record<number, LessonPlanRow[]>;
    configuredClasses?: ConfiguredClass[];
  }
): Promise<boolean> {
  const sanitized = sanitizeFirestoreData(data);
  try {
    const docRef = doc(db, 'khdh_data', userId || 'shared');
    await setDoc(docRef, {
      ...sanitized,
      userId: userId || 'shared',
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err: any) {
    if (err?.code === 'unavailable' || err?.message?.includes('unavailable') || err?.message?.includes('offline')) {
      console.warn('Firestore unavailable, KHDH data saved locally only.');
      return false;
    }
    console.warn('Save KHDH data Firestore notice:', err?.message || err);
    return false;
  }
}

/**
 * Load KHDH Data from Firestore
 */
export async function loadKhdhDataFromFirestore(userId: string): Promise<{
  config?: SchoolConfig;
  ppctList?: PpctItem[];
  timetable?: TimetableSlot[];
  customizedWeeks?: Record<number, LessonPlanRow[]>;
  configuredClasses?: ConfiguredClass[];
} | null> {
  try {
    const docRef = doc(db, 'khdh_data', userId || 'shared');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as any;
    }
  } catch (err) {
    console.warn('Load KHDH data Firestore notice:', err);
  }
  return null;
}

/**
 * Save Lesson Plans Library to Firestore for specific user
 */
export async function saveLessonPlansToFirestore(
  userId: string,
  plans: DetailedLessonPlan[]
): Promise<boolean> {
  const sanitized = sanitizeFirestoreData({ plans });
  try {
    const docRef = doc(db, 'lesson_plans', userId || 'shared');
    await setDoc(docRef, {
      userId: userId || 'shared',
      plans: sanitized.plans || [],
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err: any) {
    if (err?.code === 'unavailable' || err?.message?.includes('unavailable') || err?.message?.includes('offline')) {
      console.warn('Firestore unavailable, Lesson Plans saved locally only.');
      return false;
    }
    console.warn('Save Lesson Plans Firestore notice:', err?.message || err);
    return false;
  }
}

/**
 * Load Lesson Plans Library from Firestore for specific user
 */
export async function loadLessonPlansFromFirestore(
  userId: string
): Promise<DetailedLessonPlan[] | null> {
  try {
    const docRef = doc(db, 'lesson_plans', userId || 'shared');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && Array.isArray(data.plans)) {
        return data.plans as DetailedLessonPlan[];
      }
    }
  } catch (err) {
    console.warn('Load Lesson Plans Firestore notice:', err);
  }
  return null;
}

/**
 * Fetch global system configuration (e.g. school logo)
 */
export async function fetchSystemConfig(): Promise<any> {
  try {
    const docRef = doc(db, 'system', 'config');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.warn('Failed to fetch system config:', err);
  }
  return null;
}

/**
 * Save global system configuration
 */
export async function saveSystemConfig(config: any): Promise<boolean> {
  try {
    const docRef = doc(db, 'system', 'config');
    await setDoc(docRef, {
      ...config,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.error('Failed to save system config:', err);
    return false;
  }
}

/**
 * Session storage for current logged in user
 */
export function getSavedSessionUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading saved session', e);
  }
  return null;
}

export function saveSessionUser(user: UserAccount | null) {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_SESSION_KEY);
    }
  } catch (e) {
    console.error('Error saving session user', e);
  }
}
