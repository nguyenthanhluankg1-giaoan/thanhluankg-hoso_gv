import React, { useState, useRef } from 'react';
import { Film, Play, RotateCcw, Award, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppState, Student } from '../../types';
import { Avatar } from '../Avatar';
import { uid } from '../../utils/helpers';
import { playCelebration, playBeep } from '../../utils/audio';

interface FilmTabProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

export const FilmTab: React.FC<FilmTabProps> = ({ state, onUpdateState }) => {
  const activeClass = state.classes.find((c) => c.id === state.activeClassId) || state.classes[0];
  const allStudents = state.students.filter((s) => s.classId === state.activeClassId);

  const [isRolling, setIsRolling] = useState(false);
  const [winner, setWinner] = useState<Student | null>(null);
  const [awardAmount, setAwardAmount] = useState(2);
  const [transformX, setTransformX] = useState(0);

  const filmStageRef = useRef<HTMLDivElement>(null);

  const candidates = allStudents.filter((s) => !state.filmExcluded.includes(s.id));

  // Triplicate candidate list to create an infinite rolling strip illusion
  const stripCandidates = [...candidates, ...candidates, ...candidates];

  const rollFilm = async () => {
    if (isRolling) return;

    if (candidates.length === 0) {
      if (state.filmExcluded.length > 0) {
        onUpdateState((prev) => ({ ...prev, filmExcluded: [] }));
        alert('Tất cả học sinh đã được đưa lại vào cuộn phim.');
      } else {
        alert('Không có học sinh trong cuộn phim!');
      }
      return;
    }

    setIsRolling(true);
    setWinner(null);

    // Pick winner
    const pickedWinner = candidates[Math.floor(Math.random() * candidates.length)];
    const winnerSubIndex = candidates.findIndex((s) => s.id === pickedWinner.id);

    // Target the element in the middle replica (index: candidates.length + winnerSubIndex)
    const targetIndex = candidates.length + winnerSubIndex;
    const itemWidth = 142; // Width of person item + gap
    const stageWidth = filmStageRef.current ? filmStageRef.current.clientWidth : 600;
    const targetOffset = -(targetIndex * itemWidth - stageWidth / 2 + itemWidth / 2);

    playBeep(440, 0.2, 0.1);
    setTimeout(() => playBeep(554, 0.2, 0.1), 600);
    setTimeout(() => playBeep(659, 0.2, 0.1), 1200);
    setTimeout(() => playBeep(880, 0.4, 0.15), 2400);

    setTransformX(targetOffset);

    setTimeout(() => {
      setIsRolling(false);
      setWinner(pickedWinner);

      // Record to history
      const newHistory = {
        id: uid('fh'),
        classId: state.activeClassId,
        studentId: pickedWinner.id,
        studentName: pickedWinner.name,
        time: new Date().toISOString()
      };

      onUpdateState((prev) => ({
        ...prev,
        filmHistory: [newHistory, ...prev.filmHistory],
        filmExcluded: prev.settings.filmExclude
          ? [...prev.filmExcluded, pickedWinner.id]
          : prev.filmExcluded
      }));

      playCelebration();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    }, 2850);
  };

  const handleAward = () => {
    if (!winner) return;

    onUpdateState((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === winner.id ? { ...s, coins: (s.coins || 0) + awardAmount } : s
      ),
      transactions: [
        {
          id: uid('tx'),
          classId: prev.activeClassId,
          studentId: winner.id,
          studentName: winner.name,
          amount: awardAmount,
          reason: `Thưởng trò chơi Cuộn phim may mắn`,
          subject: 'Ghi chung / Nề nếp',
          time: new Date().toISOString()
        },
        ...prev.transactions
      ]
    }));

    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.7 }
    });

    alert(`Đã cộng +${awardAmount} bông hoa cho học sinh ${winner.name}!`);
  };

  const restoreAll = () => {
    onUpdateState((prev) => ({
      ...prev,
      filmExcluded: []
    }));
  };

  const clearHistory = () => {
    onUpdateState((prev) => ({
      ...prev,
      filmHistory: prev.filmHistory.filter((h) => h.classId !== prev.activeClassId)
    }));
  };

  const classHistory = state.filmHistory.filter((h) => h.classId === state.activeClassId);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Film Projector Canvas */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-7 border-2 border-teal-100 shadow-md">
          <div className="text-center mb-5">
            <h3 className="text-xl font-black text-slate-800 tracking-wider">
              🎞️ MÁY CHIẾU PHIM MAY MẮN 🎞️
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Hiệu ứng cuộn phim điện ảnh chọn ngẫu nhiên học sinh trả lời bài hoặc nhận thưởng.
            </p>
          </div>

          {/* Film Stage Viewport */}
          <div
            ref={filmStageRef}
            className="relative h-56 rounded-3xl bg-slate-900 border-8 border-slate-950 overflow-hidden shadow-2xl shadow-slate-900/40 flex items-center"
          >
            {/* Moving film strip */}
            <div
              className="flex items-center gap-4 px-6 transition-transform duration-[2850ms] ease-out will-change-transform"
              style={{
                transform: `translateX(${transformX}px)`,
                transitionTimingFunction: 'cubic-bezier(0.1, 0.7, 0.1, 1)'
              }}
            >
              {stripCandidates.map((s, idx) => (
                <div
                  key={`${s.id}_${idx}`}
                  className="w-36 h-44 flex-shrink-0 rounded-2xl bg-sky-950/80 border-2 border-sky-600/40 text-white flex flex-col items-center justify-center gap-2 text-center p-2 shadow-md"
                >
                  <Avatar name={s.name} avatar={s.avatar} size="xl" />
                  <span className="font-extrabold text-xs text-slate-100 truncate w-full">
                    {s.name}
                  </span>
                </div>
              ))}
              {candidates.length === 0 && (
                <div className="text-white text-xs font-bold text-center w-full">
                  Cuộn phim đang trống. Bấm nút Đưa tất cả vào lại ở bên phải.
                </div>
              )}
            </div>

            {/* Golden Central Target Marker */}
            <div className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-36 -translate-x-1/2 border-x-4 border-amber-400 bg-amber-400/10 shadow-[0_0_30px_rgba(251,191,36,0.3)] z-10 flex items-start justify-center pt-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-black/60 px-2 py-0.5 rounded-full border border-amber-400/50">
                MỤC TIÊU
              </span>
            </div>
          </div>

          {/* Winner Announcement Box */}
          <div className="mt-5 p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 text-center min-h-[90px] flex flex-col items-center justify-center">
            {winner ? (
              <div className="animate-in zoom-in-95 duration-200">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                  🏆 PHIM DỪNG LẠI TẠI
                </span>
                <h4 className="text-2xl font-black text-slate-900 mt-0.5">{winner.name}</h4>
                <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                  <select
                    value={awardAmount}
                    onChange={(e) => setAwardAmount(parseInt(e.target.value) || 2)}
                    className="px-3 py-1.5 rounded-xl border border-amber-400 bg-white font-black text-xs text-amber-950"
                  >
                    {[1, 2, 3, 5, 10, 15, 20].map((n) => (
                      <option key={n} value={n}>
                        +{n} hoa 🌺
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAward}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-sm transition-all"
                  >
                    <span>🌺</span>
                    <span>Thưởng hoa ngay</span>
                  </button>
                </div>
              </div>
            ) : (
              <span className="text-xs font-bold text-slate-400">
                {isRolling
                  ? '🎬 Cuộn phim đang quay tốc độ cao...'
                  : 'Bấm nút quay để cuộn phim chọn học sinh ngẫu nhiên'}
              </span>
            )}
          </div>

          {/* Spin Trigger Button */}
          <button
            onClick={rollFilm}
            disabled={isRolling || candidates.length === 0}
            className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-black text-base shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{isRolling ? 'ĐANG QUAY CUỘN PHIM...' : '🎬 BẤM QUAY CUỘN PHIM!'}</span>
          </button>

          {/* Exclude Switch */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 cursor-pointer">
              Tự động loại học sinh sau khi được chọn
            </label>
            <input
              type="checkbox"
              checked={state.settings.filmExclude}
              onChange={(e) =>
                onUpdateState((prev) => ({
                  ...prev,
                  settings: { ...prev.settings, filmExclude: e.target.checked }
                }))
              }
              className="w-4 h-4 rounded text-teal-600"
            />
          </div>
        </div>

        {/* Right: Candidates & History */}
        <div className="lg:col-span-4 space-y-4">
          {/* Candidates Box */}
          <div className="bg-white rounded-3xl p-5 border-2 border-teal-100 shadow-md">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-800">
                Trong cuộn phim ({candidates.length})
              </h3>
              {state.filmExcluded.length > 0 && (
                <button
                  onClick={restoreAll}
                  className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Vào lại ({state.filmExcluded.length})</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2.5 max-h-52 overflow-y-auto pr-1">
              {candidates.map((s) => (
                <div
                  key={s.id}
                  className="p-2 rounded-2xl bg-teal-50/60 border border-teal-100 flex flex-col items-center text-center"
                >
                  <Avatar name={s.name} avatar={s.avatar} size="sm" />
                  <span className="font-bold text-[11px] text-slate-800 truncate w-full mt-1">
                    {s.name.split(' ').slice(-1)[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* History Box */}
          <div className="bg-white rounded-3xl p-5 border-2 border-teal-100 shadow-md">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-800">
                Lịch sử phim ({classHistory.length})
              </h3>
              {classHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-0.5"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Xóa</span>
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {classHistory.slice(0, 10).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-amber-500 font-bold">🎬</span>
                    <strong className="text-slate-800 truncate">{item.studentName}</strong>
                  </div>
                  <span className="text-[11px] text-slate-400 flex-shrink-0">
                    {new Date(item.time).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))}
              {classHistory.length === 0 && (
                <div className="py-6 text-center text-slate-400 text-xs">
                  Chưa có lượt quay phim nào.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
