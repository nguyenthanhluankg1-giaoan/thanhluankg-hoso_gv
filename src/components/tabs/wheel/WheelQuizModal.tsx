import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sparkles, Clock, CheckCircle2, XCircle, Award, RotateCcw, HelpCircle, ArrowRight, Volume2, Plus, Shuffle, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion, Student } from '../../../types';
import { Avatar } from '../../Avatar';
import { playCelebration, playTick, playAlarm, playBeep } from '../../../utils/audio';

interface WheelQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  classNameStr?: string;
  question: QuizQuestion;
  durationSeconds: number;
  remainingCount?: number;
  totalCount?: number;
  isResetCycle?: boolean;
  shuffleOptions?: boolean;
  onNextQuestion: () => void;
  onAwardCoins: (coins: number, reason: string) => void;
  onSpinAgain?: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
const OPTION_STYLES = [
  { letterBg: 'bg-blue-600 text-white', borderHover: 'hover:border-blue-400 hover:bg-blue-50/40' },
  { letterBg: 'bg-emerald-600 text-white', borderHover: 'hover:border-emerald-400 hover:bg-emerald-50/40' },
  { letterBg: 'bg-amber-600 text-white', borderHover: 'hover:border-amber-400 hover:bg-amber-50/40' },
  { letterBg: 'bg-purple-600 text-white', borderHover: 'hover:border-purple-400 hover:bg-purple-50/40' }
];

export const WheelQuizModal: React.FC<WheelQuizModalProps> = ({
  isOpen,
  onClose,
  student,
  classNameStr = '',
  question,
  durationSeconds,
  remainingCount,
  totalCount,
  isResetCycle,
  shuffleOptions = true,
  onNextQuestion,
  onAwardCoins,
  onSpinAgain
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(durationSeconds);
  const [timerActive, setTimerActive] = useState<boolean>(true);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [awardedCoins, setAwardedCoins] = useState<number | null>(null);
  const [shuffleSeed, setShuffleSeed] = useState<number>(0);
  const [isShuffleEnabled, setIsShuffleEnabled] = useState<boolean>(shuffleOptions);

  // Sync isShuffleEnabled when prop changes
  useEffect(() => {
    setIsShuffleEnabled(shuffleOptions);
  }, [shuffleOptions]);

  // Compute shuffled options so that answers are non-repetitive across questions
  // and correctIndex accurately maps to the new position
  const { displayOptions, correctDisplayIndex } = useMemo(() => {
    const rawOptions = question.options || [];
    if (!isShuffleEnabled || rawOptions.length <= 1) {
      return {
        displayOptions: rawOptions,
        correctDisplayIndex: question.correctIndex
      };
    }

    // Map items with original index
    const mapped = rawOptions.map((opt, origIdx) => ({
      text: opt,
      isCorrect: origIdx === question.correctIndex,
      origIdx
    }));

    // Seeded Fisher-Yates shuffle
    // Using question.id and shuffleSeed to ensure consistent state during one question view
    const arr = [...mapped];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }

    const newCorrectIdx = arr.findIndex((item) => item.isCorrect);
    return {
      displayOptions: arr.map((item) => item.text),
      correctDisplayIndex: newCorrectIdx >= 0 ? newCorrectIdx : question.correctIndex
    };
    // Include shuffleSeed and question.id so changing question re-shuffles
  }, [question.id, question.options, question.correctIndex, isShuffleEnabled, shuffleSeed]);

  // Reset state when question or duration changes
  useEffect(() => {
    setTimeLeft(durationSeconds);
    setTimerActive(true);
    setSelectedIdx(null);
    setIsAnswered(false);
    setIsTimeUp(false);
    setShowAnswer(false);
    setAwardedCoins(null);
    // Increment shuffle seed for brand-new order on each question display
    setShuffleSeed((prev) => prev + 1);
  }, [question.id, durationSeconds]);

  // Countdown timer effect
  useEffect(() => {
    if (!isOpen || !timerActive || isAnswered || isTimeUp) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimeUp(true);
          setTimerActive(false);
          playAlarm();
          return 0;
        }

        // Ticking audio when <= 5 seconds
        if (prev <= 6) {
          playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, timerActive, isAnswered, isTimeUp]);

  const handleSelectOption = (index: number) => {
    if (isAnswered || isTimeUp || showAnswer) return;

    setSelectedIdx(index);
    setIsAnswered(true);
    setShowAnswer(true);
    setTimerActive(false);

    const isCorrect = index === correctDisplayIndex;
    if (isCorrect) {
      playCelebration();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      const coins = question.rewardCoins || 2;
      setAwardedCoins(coins);
      onAwardCoins(coins, `Trả lời đúng câu hỏi trắc nghiệm: ${question.question.slice(0, 30)}...`);
    } else {
      playBeep(320, 0.35, 0.2);
    }
  };

  const handleRevealAnswer = () => {
    setShowAnswer(true);
    setTimerActive(false);
    playBeep(650, 0.2, 0.15);
  };

  const handleAddTime = () => {
    setTimeLeft((prev) => prev + 10);
    setIsTimeUp(false);
    setShowAnswer(false);
    setTimerActive(true);
    playBeep(700, 0.15, 0.1);
  };

  const handleManualAward = (amount: number) => {
    onAwardCoins(amount, `Thưởng câu hỏi trắc nghiệm`);
    setAwardedCoins((prev) => (prev || 0) + amount);
    confetti({
      particleCount: 40,
      spread: 45,
      origin: { y: 0.7 }
    });
  };

  const toggleShuffle = () => {
    if (isAnswered || isTimeUp || showAnswer) return;
    setIsShuffleEnabled((prev) => !prev);
    setShuffleSeed((prev) => prev + 1);
  };

  if (!isOpen) return null;

  const isCorrectAnswer = selectedIdx !== null && selectedIdx === correctDisplayIndex;

  // Progress percentage for timer bar
  const rawPercent = durationSeconds > 0 ? (timeLeft / durationSeconds) * 100 : 0;
  const timerPercent = isNaN(rawPercent) ? 0 : Math.max(0, Math.min(100, rawPercent));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border-4 border-teal-500 my-auto relative overflow-hidden">
        {/* Top Glow Background accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 via-amber-400 to-teal-500" />

        {/* Header: Student chosen info & Subject Tag */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Avatar name={student.name} avatar={student.avatar} size="md" />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                  Học sinh được chọn
                </span>
                {question.subject && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    Môn: {question.subject}
                  </span>
                )}
                {typeof remainingCount === 'number' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200">
                    🎲 Không trùng ({remainingCount} câu còn lại)
                  </span>
                )}
              </div>
              {isResetCycle && (
                <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                  ✨ Đã hoàn thành 1 lượt tất cả câu hỏi, tự động quay vòng mới!
                </div>
              )}
              <h3 className="text-lg sm:text-xl font-black text-slate-800 leading-tight mt-0.5">
                {student.name}
              </h3>
              <p className="text-xs text-slate-500">
                Lớp {classNameStr} · Đang có: <b className="text-rose-600">🌺 {student.coins || 0} hoa</b>
              </p>
            </div>
          </div>

          {/* Countdown Display Badge & Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 self-end sm:self-center flex-wrap">
            {/* Auto shuffle toggle */}
            <button
              type="button"
              disabled={isAnswered || isTimeUp || showAnswer}
              onClick={toggleShuffle}
              title={isShuffleEnabled ? 'Đang tự động đảo đáp án (Bấm để bật/tắt hoặc xáo lại)' : 'Bấm để bật tự động đảo vị trí đáp án'}
              className={`px-2.5 py-1.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 border ${
                isShuffleEnabled
                  ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300'
                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
              } ${isAnswered || isTimeUp || showAnswer ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Shuffle className={`w-3.5 h-3.5 ${isShuffleEnabled ? 'text-purple-600' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">
                {isShuffleEnabled ? 'Đảo đáp án' : 'Không đảo'}
              </span>
            </button>

            {/* Reveal Answer button for teacher (available anytime) */}
            {!showAnswer && (
              <button
                type="button"
                onClick={handleRevealAnswer}
                title="Bấm để hiển thị đáp án đúng"
                className="px-2.5 py-1.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem đáp án</span>
              </button>
            )}

            {/* Countdown timer badge */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl font-black text-sm transition-all shadow-xs border ${
                isTimeUp
                  ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                  : timeLeft <= 5
                  ? 'bg-amber-100 text-amber-900 border-amber-300 animate-bounce'
                  : 'bg-teal-50 text-teal-800 border-teal-200'
              }`}
            >
              <Clock className={`w-4 h-4 ${timeLeft <= 5 ? 'text-amber-700' : 'text-teal-600'}`} />
              <span>
                {isTimeUp ? 'Hết giờ!' : `${timeLeft}s`}
              </span>
            </div>

            <button
              onClick={onNextQuestion}
              title="Đổi câu hỏi ngẫu nhiên khác"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đổi câu</span>
            </button>
          </div>
        </div>

        {/* Visual Countdown Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3 mb-4">
          <div
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${
              timeLeft <= 5
                ? 'bg-rose-500'
                : timeLeft <= 10
                ? 'bg-amber-500'
                : 'bg-teal-500'
            }`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>

        {/* Question Prompt */}
        <div className="bg-gradient-to-br from-slate-50 to-teal-50/40 p-4 sm:p-5 rounded-2xl border-2 border-teal-100 mb-5 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <span className="p-1.5 rounded-xl bg-teal-600 text-white font-black text-xs shrink-0 mt-0.5">
                Câu hỏi
              </span>
              <p className="text-base sm:text-lg font-black text-slate-800 leading-relaxed">
                {question.question}
              </p>
            </div>
            <span className="shrink-0 px-2.5 py-1 rounded-xl bg-rose-100 text-rose-900 font-extrabold text-xs border border-rose-300 flex items-center gap-1">
              <span>🌺 +{question.rewardCoins || 2}</span>
              <span className="hidden sm:inline">hoa</span>
            </span>
          </div>
        </div>

        {/* 4 Multiple Choice Options (Auto-shuffled) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {displayOptions.map((opt, idx) => {
            const isThisSelected = selectedIdx === idx;
            const isThisCorrect = idx === correctDisplayIndex;
            const style = OPTION_STYLES[idx] || OPTION_STYLES[0];

            let cardStyle = 'bg-white border-2 border-slate-200 text-slate-800';
            if (showAnswer) {
              if (isThisCorrect) {
                cardStyle = 'bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-bold shadow-md shadow-emerald-500/10 scale-[1.01]';
              } else if (isThisSelected) {
                cardStyle = 'bg-rose-50 border-2 border-rose-500 text-rose-950 font-bold opacity-90';
              } else {
                cardStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
              }
            } else {
              if (isTimeUp) {
                cardStyle = 'bg-slate-50 border-2 border-slate-200 text-slate-700 opacity-90';
              } else {
                cardStyle += ` ${style.borderHover} hover:shadow-md cursor-pointer transition-all active:scale-98`;
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered || isTimeUp || showAnswer}
                onClick={() => handleSelectOption(idx)}
                className={`p-3.5 rounded-2xl text-left flex items-center justify-between gap-3 transition-all ${cardStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${
                      showAnswer
                        ? isThisCorrect
                          ? 'bg-emerald-600 text-white'
                          : isThisSelected
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-300 text-slate-600'
                        : style.letterBg
                    }`}
                  >
                    {OPTION_LETTERS[idx]}
                  </span>
                  <span className="text-sm font-semibold">{opt}</span>
                </div>

                {/* Status indicator on right */}
                {showAnswer && (
                  <div>
                    {isThisCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : isThisSelected ? (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Time up banner before reveal */}
        {isTimeUp && !showAnswer && (
          <div className="p-4 rounded-2xl mb-4 bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm animate-in fade-in zoom-in-98">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <span className="font-black text-sm block">⏰ Đã hết thời gian suy nghĩ!</span>
                <span className="text-xs text-amber-800">
                  Học sinh hãy đưa ra câu trả lời trực tiếp. Bấm nút để kiểm tra đáp án đúng.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleAddTime}
                className="px-3 py-2 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+10s suy nghĩ</span>
              </button>
              <button
                type="button"
                onClick={handleRevealAnswer}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs transition-all shadow-md shadow-teal-700/20 flex items-center justify-center gap-1.5 cursor-pointer animate-bounce"
              >
                <Eye className="w-4 h-4" />
                <span>Hiển thị đáp án</span>
              </button>
            </div>
          </div>
        )}

        {/* Feedback Banner after reveal or selection */}
        {showAnswer && (
          <div
            className={`p-4 rounded-2xl mb-4 border transition-all animate-in fade-in zoom-in-98 ${
              isCorrectAnswer
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : isTimeUp
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {isCorrectAnswer ? (
                  <>
                    <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="font-black text-sm">
                      🎉 CHÍNH XÁC! Chúc mừng {student.name} đã nhận +{awardedCoins || question.rewardCoins || 2} bông hoa 🌺!
                    </span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-black text-sm block">
                        {isTimeUp ? '⏰ Kết quả đáp án đúng:' : 'Chưa chính xác!'}
                      </span>
                      <span className="text-xs text-slate-800">
                        Đáp án đúng là: <b>{OPTION_LETTERS[correctDisplayIndex]}. {displayOptions[correctDisplayIndex]}</b>
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Extra Coin Button for Teacher */}
              <div className="flex items-center gap-1.5">
                {isTimeUp && (
                  <button
                    onClick={handleAddTime}
                    className="px-2.5 py-1 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 text-xs font-black transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+10s làm lại</span>
                  </button>
                )}
                {!isCorrectAnswer && (
                  <button
                    onClick={() => handleManualAward(1)}
                    className="px-2.5 py-1 rounded-xl bg-teal-100 hover:bg-teal-200 text-teal-900 text-xs font-black transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5 text-teal-700" />
                    <span>+1 hoa khích lệ 🌺</span>
                  </button>
                )}
              </div>
            </div>

            {/* Optional Explanation */}
            {question.explanation && (
              <p className="text-xs mt-2 pt-2 border-t border-slate-200/60 opacity-90">
                💡 <b>Giải thích:</b> {question.explanation}
              </p>
            )}
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Quick manual flower award */}
            <span className="text-xs font-bold text-slate-500">Thưởng thêm:</span>
            {[1, 2, 5].map((amt) => (
              <button
                key={amt}
                onClick={() => handleManualAward(amt)}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-900 font-extrabold text-xs transition-all border border-slate-200 flex items-center gap-0.5 cursor-pointer"
              >
                <span>+{amt}</span>
                <span>🌺</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-extrabold text-xs transition-all cursor-pointer"
            >
              Đóng
            </button>

            {onSpinAgain && (
              <button
                onClick={() => {
                  onClose();
                  onSpinAgain();
                }}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Quay tiếp</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

