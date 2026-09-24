import React, { useState, useEffect } from 'react';
import { Navbar, KhdhTabId } from './Navbar';
import { DocumentPreview } from './DocumentPreview';
import { PpctManager } from './PpctManager';
import { TkbManager } from './TkbManager';
import { AiAssistantTab } from './AiAssistantTab';
import { SettingsTab } from './SettingsTab';
import { SchoolConfig, PpctItem, TimetableSlot, LessonPlanRow, ConfiguredClass, UserAccount } from '../types';
import {
  defaultSchoolConfig,
  defaultPpctList,
  defaultTimetable
} from '../data/defaultData';
import {
  saveKhdhDataToFirestore,
  loadKhdhDataFromFirestore,
  getSavedSessionUser,
  getUserKhdhStorageKeys
} from '../services/dbService';

const DEFAULT_CONFIGURED_CLASSES: ConfiguredClass[] = [
  { id: 'c-3a1', name: '3A1', grade: 3 },
  { id: 'c-3a2', name: '3A2', grade: 3 },
  { id: 'c-4a1', name: '4A1', grade: 4 },
  { id: 'c-4a2', name: '4A2', grade: 4 },
  { id: 'c-5a1', name: '5A1', grade: 5 },
  { id: 'c-5a2', name: '5A2', grade: 5 },
  { id: 'c-cc', name: 'Chào cờ', grade: 0 },
  { id: 'c-shl', name: 'Sinh hoạt lớp', grade: 0 }
];

interface KhdhModuleProps {
  currentUser?: UserAccount | null;
}

export const KhdhModule: React.FC<KhdhModuleProps> = ({ currentUser: propCurrentUser }) => {
  const activeUser = propCurrentUser || getSavedSessionUser();
  const userId = activeUser?.id || 'shared';
  const keys = getUserKhdhStorageKeys(activeUser?.id);

  // 1. School config state
  const [config, setConfig] = useState<SchoolConfig>(() => {
    try {
      const saved = localStorage.getItem(keys.CONFIG) || localStorage.getItem('khdh_school_config_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
    } catch (e) {
      console.error('Error loading khdh config:', e);
    }
    return defaultSchoolConfig;
  });

  // 2. PPCT list state
  const [ppctList, setPpctList] = useState<PpctItem[]>(() => {
    try {
      const saved = localStorage.getItem(keys.PPCT) || localStorage.getItem('khdh_ppct_list_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading khdh ppct:', e);
    }
    return defaultPpctList;
  });

  // 3. Timetable state
  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    try {
      const saved = localStorage.getItem(keys.TIMETABLE) || localStorage.getItem('khdh_timetable_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading khdh timetable:', e);
    }
    return defaultTimetable;
  });

  // 4. Customized weeks state
  const [customizedWeeks, setCustomizedWeeks] = useState<Record<number, LessonPlanRow[]>>(() => {
    try {
      const saved = localStorage.getItem(keys.CUSTOMIZED_WEEKS) || localStorage.getItem('khdh_customized_weeks_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading khdh customized weeks:', e);
    }
    return {};
  });

  // 5. Configured classes state
  const [configuredClasses, setConfiguredClasses] = useState<ConfiguredClass[]>(() => {
    try {
      const saved = localStorage.getItem(keys.CONFIGURED_CLASSES) || localStorage.getItem('khdh_configured_classes_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading configured classes:', e);
    }
    return DEFAULT_CONFIGURED_CLASSES;
  });

  // 6. Active Tab
  const [activeTab, setActiveTab] = useState<KhdhTabId>(() => {
    try {
      const saved = localStorage.getItem(keys.ACTIVE_TAB) || localStorage.getItem('khdh_active_tab_v1');
      if (saved && ['document', 'ppct', 'tkb', 'ai', 'settings'].includes(saved)) {
        return saved as KhdhTabId;
      }
    } catch {}
    return 'document';
  });

  useEffect(() => {
    const handleCustomTabChange = (e: any) => {
      if (e.detail && ['document', 'ppct', 'tkb', 'ai', 'settings'].includes(e.detail)) {
        setActiveTab(e.detail);
      }
    };
    window.addEventListener('khdh_change_tab', handleCustomTabChange);
    return () => window.removeEventListener('khdh_change_tab', handleCustomTabChange);
  }, []);

  useEffect(() => {
    try {
      window.dispatchEvent(new CustomEvent('khdh_tab_updated', { detail: activeTab }));
    } catch {}
  }, [activeTab]);

  // Load from Firestore whenever currentUser changes or on initial mount
  useEffect(() => {
    let active = true;
    async function loadFromCloud() {
      const currentUserId = activeUser?.id || 'shared';
      const userKeys = getUserKhdhStorageKeys(activeUser?.id);

      // Fast sync with user local storage cache first
      try {
        const savedCfg = localStorage.getItem(userKeys.CONFIG);
        if (savedCfg && active) setConfig(JSON.parse(savedCfg));
        const savedPpct = localStorage.getItem(userKeys.PPCT);
        if (savedPpct && active) setPpctList(JSON.parse(savedPpct));
        const savedTkb = localStorage.getItem(userKeys.TIMETABLE);
        if (savedTkb && active) setTimetable(JSON.parse(savedTkb));
        const savedWeeks = localStorage.getItem(userKeys.CUSTOMIZED_WEEKS);
        if (savedWeeks && active) setCustomizedWeeks(JSON.parse(savedWeeks));
        const savedCls = localStorage.getItem(userKeys.CONFIGURED_CLASSES);
        if (savedCls && active) setConfiguredClasses(JSON.parse(savedCls));
      } catch (err) {
        console.warn('Local storage parse on user switch:', err);
      }

      // Fetch cloud state from Firestore
      try {
        const cloudData = await loadKhdhDataFromFirestore(currentUserId);
        if (cloudData && active) {
          if (cloudData.config) {
            setConfig(cloudData.config);
            localStorage.setItem(userKeys.CONFIG, JSON.stringify(cloudData.config));
          }
          if (cloudData.ppctList) {
            setPpctList(cloudData.ppctList);
            localStorage.setItem(userKeys.PPCT, JSON.stringify(cloudData.ppctList));
          }
          if (cloudData.timetable) {
            setTimetable(cloudData.timetable);
            localStorage.setItem(userKeys.TIMETABLE, JSON.stringify(cloudData.timetable));
          }
          if (cloudData.customizedWeeks) {
            setCustomizedWeeks(cloudData.customizedWeeks);
            localStorage.setItem(userKeys.CUSTOMIZED_WEEKS, JSON.stringify(cloudData.customizedWeeks));
          }
          if (cloudData.configuredClasses && Array.isArray(cloudData.configuredClasses)) {
            setConfiguredClasses(cloudData.configuredClasses);
            localStorage.setItem(userKeys.CONFIGURED_CLASSES, JSON.stringify(cloudData.configuredClasses));
          }
        }
      } catch (err) {
        console.warn('Error loading KHDH cloud data:', err);
      }
    }

    loadFromCloud();
    return () => {
      active = false;
    };
  }, [activeUser?.id]);

  // Save to localStorage & Firestore with debouncing
  useEffect(() => {
    const userKeys = getUserKhdhStorageKeys(activeUser?.id);
    try {
      localStorage.setItem(userKeys.CONFIG, JSON.stringify(config));
      localStorage.setItem(userKeys.PPCT, JSON.stringify(ppctList));
      localStorage.setItem(userKeys.TIMETABLE, JSON.stringify(timetable));
      localStorage.setItem(userKeys.CUSTOMIZED_WEEKS, JSON.stringify(customizedWeeks));
      localStorage.setItem(userKeys.CONFIGURED_CLASSES, JSON.stringify(configuredClasses));
    } catch (e) {
      console.warn('Error saving KHDH local cache:', e);
    }

    const timer = setTimeout(() => {
      saveKhdhDataToFirestore(activeUser?.id || 'shared', {
        config,
        ppctList,
        timetable,
        customizedWeeks,
        configuredClasses
      }).catch((err) => console.warn('Error saving KHDH to Firestore:', err));
    }, 1000);

    return () => clearTimeout(timer);
  }, [config, ppctList, timetable, customizedWeeks, configuredClasses, activeUser?.id]);

  const handleTabChange = (tab: KhdhTabId) => {
    setActiveTab(tab);
    try {
      const userKeys = getUserKhdhStorageKeys(activeUser?.id);
      localStorage.setItem(userKeys.ACTIVE_TAB, tab);
    } catch {}
  };

  const handleSaveWeekRows = (weekNumber: number, rows: LessonPlanRow[]) => {
    setCustomizedWeeks((prev) => ({
      ...prev,
      [weekNumber]: rows
    }));
  };

  const handleResetWeekRows = (weekNumber: number) => {
    setCustomizedWeeks((prev) => {
      const updated = { ...prev };
      delete updated[weekNumber];
      return updated;
    });
  };

  const handleResetPpct = () => {
    setPpctList(defaultPpctList);
  };

  const handleResetTimetable = () => {
    setTimetable(defaultTimetable);
  };

  const handleResetConfig = () => {
    setConfig(defaultSchoolConfig);
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-50/50">
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        title={config.documentTitle || 'KẾ HOẠCH DẠY HỌC'}
        academicYear={config.academicYear || '2026 - 2027'}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'document' && (
          <DocumentPreview
            config={config}
            ppctList={ppctList}
            timetable={timetable}
            customizedWeeks={customizedWeeks}
            onSaveWeekRows={handleSaveWeekRows}
            onResetWeekRows={handleResetWeekRows}
          />
        )}

        {activeTab === 'ppct' && (
          <PpctManager
            ppctList={ppctList}
            onUpdatePpctList={setPpctList}
            onResetPpctList={handleResetPpct}
          />
        )}

        {activeTab === 'tkb' && (
          <TkbManager
            timetable={timetable}
            onUpdateTimetable={setTimetable}
            onResetTimetable={handleResetTimetable}
            configuredClasses={configuredClasses}
            onUpdateConfiguredClasses={setConfiguredClasses}
          />
        )}

        {activeTab === 'ai' && <AiAssistantTab currentUser={activeUser} />}

        {activeTab === 'settings' && (
          <SettingsTab
            config={config}
            onUpdateConfig={setConfig}
            onResetConfig={handleResetConfig}
          />
        )}
      </main>
    </div>
  );
};
