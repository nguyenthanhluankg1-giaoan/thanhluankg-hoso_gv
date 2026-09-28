import React, { useState, useEffect, useRef } from 'react';
import {
  Swords,
  RotateCcw,
  Award,
  Trash2,
  Sparkles,
  CheckCircle2,
  XCircle,
  Timer,
  Trophy,
  Users,
  Flame,
  Volume2,
  VolumeX,
  RefreshCw,
  Zap,
  Folder,
  GraduationCap,
  ChevronRight,
  BookOpen,
  Maximize2,
  Minimize2,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppState, Student, QuizQuestion } from '../../types';
import { Avatar } from '../Avatar';
import { uid } from '../../utils/helpers';
import { playCelebration, playBeep } from '../../utils/audio';

interface FilmTabProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

const DEFAULT_TUG_QUESTIONS: QuizQuestion[] = [
  {
    id: 'tug-q1',
    question: 'Số lớn nhất có hai chữ số là số nào?',
    options: ['89', '90', '99', '100'],
    correctIndex: 2,
    subject: 'Toán',
    grade: 'all',
    explanation: 'Số 99 là số lớn nhất có hai chữ số.'
  },
  {
    id: 'tug-q2',
    question: 'Từ nào sau đây là từ chỉ hoạt động?',
    options: ['Bông hoa', 'Chạy bộ', 'Ngôi nhà', 'Cái bàn'],
    correctIndex: 1,
    subject: 'Tiếng Việt',
    grade: 'all',
    explanation: '"Chạy bộ" là từ chỉ hoạt động của con người.'
  },
  {
    id: 'tug-q3',
    question: 'Mặt Trời mọc ở hướng nào?',
    options: ['Hướng Tây', 'Hướng Đông', 'Hướng Nam', 'Hướng Bắc'],
    correctIndex: 1,
    subject: 'Tự nhiên và Xã hội',
    grade: 'all',
    explanation: 'Mặt Trời mọc ở hướng Đông và lặn ở hướng Tây.'
  },
  {
    id: 'tug-q4',
    question: 'Phép tính nào sau đây có kết quả bằng 15?',
    options: ['7 + 8', '6 + 8', '9 + 5', '8 + 8'],
    correctIndex: 0,
    subject: 'Toán',
    grade: 'all',
    explanation: '7 + 8 = 15.'
  },
  {
    id: 'tug-q5',
    question: 'Thủ đô của Việt Nam tên là gì?',
    options: ['Đà Nẵng', 'Thành phố Hồ Chí Minh', 'Hà Nội', 'Hải Phòng'],
    correctIndex: 2,
    subject: 'Lịch sử và Địa lí',
    grade: 'all',
    explanation: 'Hà Nội là thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.'
  },
  {
    id: 'tug-q6',
    question: 'Đâu là thiết bị xuất dữ liệu chính của máy tính?',
    options: ['Bàn phím', 'Con chuột', 'Màn hình', 'Micro'],
    correctIndex: 2,
    subject: 'Tin học',
    grade: 'all',
    explanation: 'Màn hình là thiết bị xuất hình ảnh và thông tin.'
  }
];

export const FilmTab: React.FC<FilmTabProps> = ({ state, onUpdateState }) => {
  const activeClass = state.classes.find((c) => c.id === state.activeClassId) || state.classes[0];
  const allStudents = state.students.filter((s) => s.classId === state.activeClassId);

  // Container & Fullscreen State (Only for Arena & Quiz)
  const gameStageRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (gameStageRef.current?.requestFullscreen) {
        gameStageRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Teams & Players
  const [teamRed, setTeamRed] = useState<Student[]>([]);
  const [teamBlue, setTeamBlue] = useState<Student[]>([]);
  const [redPlayer, setRedPlayer] = useState<Student | null>(null);
  const [bluePlayer, setBluePlayer] = useState<Student | null>(null);

  // Game Engine State
  const [gameMode, setGameMode] = useState<'quiz' | 'manual'>('quiz');
  const [ropePosition, setRopePosition] = useState<number>(0); // -100 (Red Wins) to +100 (Blue Wins)
  const [redScore, setRedScore] = useState<number>(0);
  const [blueScore, setBlueScore] = useState<number>(0);
  const [showScoreboard, setShowScoreboard] = useState<boolean>(true);
  const [scoreNotice, setScoreNotice] = useState<string | null>(null);
  const [currentTurn, setCurrentTurn] = useState<'red' | 'blue' | 'both'>('red');
  const [matchWinner, setMatchWinner] = useState<'red' | 'blue' | null>(null);
  const [awardAmount, setAwardAmount] = useState<number>(3);
  const [pullingTeamAnimation, setPullingTeamAnimation] = useState<'red' | 'blue' | null>(null);

  // Sound & Quiz Filter State
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedSubject, setSelectedSubject] = useState<string>(state.wheelQuizSubject || 'all');
  const [selectedGrade, setSelectedGrade] = useState<string | number>(state.wheelQuizGrade || 'all');
  const [selectedFolderId, setSelectedFolderId] = useState<string>(state.wheelQuizFolderId || 'all');

  // Question State
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [questionIndex, setQuestionIndex] = useState<number>(0);

  // Independent Timer for Tug-of-War Game
  const [tugTimerSeconds, setTugTimerSeconds] = useState<number>(20); // Default 20s
  const [timeLeft, setTimeLeft] = useState<number>(tugTimerSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Track students who have already participated in 5v5 Tug-of-War rounds
  const [playedStudentIds, setPlayedStudentIds] = useState<string[]>([]);

  // Split 5 students per team without repeating until all have played
  const split5v5NoRepeat = () => {
    if (allStudents.length === 0) return;

    // Filter students who haven't played yet in current cycle
    let unplayed = allStudents.filter((s) => !playedStudentIds.includes(s.id));

    // If fewer than 10 students remain unplayed (or all available have played), reset cycle!
    if (unplayed.length < Math.min(10, allStudents.length)) {
      unplayed = [...allStudents];
      setPlayedStudentIds([]);
    }

    // Shuffle unplayed students
    const shuffled = [...unplayed].sort(() => Math.random() - 0.5);

    // Pick 5 for Team Red, 5 for Team Blue
    const redCount = Math.min(5, Math.ceil(shuffled.length / 2));
    const blueCount = Math.min(5, shuffled.length - redCount);

    const red = shuffled.slice(0, redCount);
    const blue = shuffled.slice(redCount, redCount + blueCount);

    setTeamRed(red);
    setTeamBlue(blue);
    setRedPlayer(red[0] || null);
    setBluePlayer(blue[0] || null);

    // Mark selected student IDs as played
    const selectedIds = [...red.map((s) => s.id), ...blue.map((s) => s.id)];
    setPlayedStudentIds((prev) => Array.from(new Set([...prev, ...selectedIds])));

    if (soundEnabled) playBeep(659, 0.2, 0.1);
  };

  const resetPlayedCycle = () => {
    setPlayedStudentIds([]);
    if (allStudents.length === 0) return;
    const shuffled = [...allStudents].sort(() => Math.random() - 0.5);
    const redCount = Math.min(5, Math.ceil(shuffled.length / 2));
    const blueCount = Math.min(5, shuffled.length - redCount);
    const red = shuffled.slice(0, redCount);
    const blue = shuffled.slice(redCount, redCount + blueCount);
    setTeamRed(red);
    setTeamBlue(blue);
    setRedPlayer(red[0] || null);
    setBluePlayer(blue[0] || null);
    const selectedIds = [...red.map((s) => s.id), ...blue.map((s) => s.id)];
    setPlayedStudentIds(selectedIds);
    if (soundEnabled) playBeep(523, 0.15, 0.1);
  };

  // Initialize Teams on Class change
  useEffect(() => {
    setPlayedStudentIds([]);
    split5v5NoRepeat();
  }, [state.activeClassId]);

  // Active Shuffled Question Data
  interface ActiveQuestionData {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
    subject?: string;
  }

  const [activeQuestion, setActiveQuestion] = useState<ActiveQuestionData | null>(null);
  const [isQuestionStarted, setIsQuestionStarted] = useState<boolean>(false);
  const [askedQuestionIds, setAskedQuestionIds] = useState<string[]>([]);

  // Function to start a new question with auto-shuffled options
  const startRandomQuestion = () => {
    if (availableQuestions.length === 0) return;

    // Filter unasked questions
    let unasked = availableQuestions.filter((q) => !askedQuestionIds.includes(q.id));
    if (unasked.length === 0) {
      unasked = [...availableQuestions];
      setAskedQuestionIds([]);
    }

    // Pick random question
    const rawQuestion = unasked[Math.floor(Math.random() * unasked.length)];
    setAskedQuestionIds((prev) => [...prev, rawQuestion.id]);

    // Shuffle options & re-index correctIndex
    const originalCorrectText = rawQuestion.options[rawQuestion.correctIndex];
    const shuffledOptions = [...rawQuestion.options].sort(() => Math.random() - 0.5);
    const newCorrectIndex = shuffledOptions.findIndex((opt) => opt === originalCorrectText);

    setActiveQuestion({
      id: rawQuestion.id,
      question: rawQuestion.question,
      options: shuffledOptions,
      correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : rawQuestion.correctIndex,
      explanation: rawQuestion.explanation,
      subject: rawQuestion.subject
    });

    setIsQuestionStarted(true);
    setSelectedAnswerIndex(null);
    setIsAnswerRevealed(false);
    setTimeLeft(tugTimerSeconds);
    setIsTimerRunning(tugTimerSeconds > 0);

    if (soundEnabled) playBeep(523, 0.2, 0.15);
  };

  // Filter available questions from AppState or Fallback
  const availableQuestions = React.useMemo(() => {
    const allQ = state.quizQuestions && state.quizQuestions.length > 0
      ? state.quizQuestions
      : DEFAULT_TUG_QUESTIONS;

    return allQ.filter((q) => {
      // Grade filter
      if (selectedGrade !== 'all') {
        const targetG = String(selectedGrade);
        const qG = String(q.grade || 'all');
        if (qG !== 'all' && qG !== targetG) return false;
      }
      // Subject filter
      if (selectedSubject !== 'all' && q.subject && q.subject !== selectedSubject) {
        return false;
      }
      // Folder filter
      if (selectedFolderId !== 'all') {
        if (selectedFolderId === 'uncategorized') {
          if (q.folderId) return false;
        } else if (q.folderId !== selectedFolderId) {
          return false;
        }
      }
      return true;
    });
  }, [state.quizQuestions, selectedGrade, selectedSubject, selectedFolderId]);

  // Load Question on Index or Filter change
  useEffect(() => {
    if (availableQuestions.length > 0) {
      const q = availableQuestions[questionIndex % availableQuestions.length];
      setCurrentQuestion(q);
    } else {
      setCurrentQuestion(DEFAULT_TUG_QUESTIONS[0]);
    }
    setSelectedAnswerIndex(null);
    setIsAnswerRevealed(false);
    setTimeLeft(tugTimerSeconds);
    setIsTimerRunning(false);
  }, [availableQuestions, questionIndex, tugTimerSeconds]);

  // Countdown timer logic
  useEffect(() => {
    let timer: any = null;
    if (isTimerRunning && timeLeft > 0 && !isAnswerRevealed && !matchWinner) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            if (soundEnabled) playBeep(220, 0.4, 0.2);
            return 0;
          }
          if (prev <= 5 && soundEnabled) {
            playBeep(600, 0.1, 0.05);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft, isAnswerRevealed, matchWinner, soundEnabled]);

  // Pull Rope Function
  const pullRope = (team: 'red' | 'blue', delta: number) => {
    if (matchWinner) return;

    setPullingTeamAnimation(team);
    setTimeout(() => setPullingTeamAnimation(null), 800);

    setRopePosition((prev) => {
      const nextPos = team === 'red' ? prev - delta : prev + delta;
      
      // Check Winner Threshold (-80 for Red, +80 for Blue)
      if (nextPos <= -75) {
        triggerWinner('red');
        return -85;
      }
      if (nextPos >= 75) {
        triggerWinner('blue');
        return 85;
      }
      return nextPos;
    });
  };

  // Launch fireworks cannon sequence & celebration sound
  const launchFireworksSequence = (winnerTeam: 'red' | 'blue') => {
    if (soundEnabled) playCelebration();

    const colors = winnerTeam === 'red'
      ? ['#ef4444', '#f59e0b', '#dc2626', '#fbbf24', '#ffffff']
      : ['#0284c7', '#06b6d4', '#2563eb', '#fbbf24', '#ffffff'];

    // 1. Initial Grand Cannon Burst
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors
    });

    // 2. Continuous Fireworks Cannon Loop (5 seconds)
    const duration = 5 * 1000;
    const end = Date.now() + duration;

    const interval: any = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }

      // Left Fireworks Cannon
      confetti({
        particleCount: 45,
        angle: 60,
        spread: 60,
        origin: { x: 0.05, y: 0.7 },
        colors
      });

      // Right Fireworks Cannon
      confetti({
        particleCount: 45,
        angle: 120,
        spread: 60,
        origin: { x: 0.95, y: 0.7 },
        colors
      });
    }, 650);
  };

  // Trigger Match Winner
  const triggerWinner = (winnerTeam: 'red' | 'blue') => {
    setMatchWinner(winnerTeam);
    setIsTimerRunning(false);

    if (winnerTeam === 'red') {
      setRedScore((s) => s + 1);
    } else {
      setBlueScore((s) => s + 1);
    }

    launchFireworksSequence(winnerTeam);

    // Record to history
    const winningStudent = winnerTeam === 'red' ? redPlayer : bluePlayer;
    const newHistory = {
      id: uid('tug'),
      classId: state.activeClassId,
      studentId: winningStudent?.id || uid('s'),
      studentName: `Đội ${winnerTeam === 'red' ? 'Đỏ 🔴' : 'Xanh 🔵'} (${winningStudent?.name || 'Toàn đội'})`,
      time: new Date().toISOString()
    };

    onUpdateState((prev) => ({
      ...prev,
      filmHistory: [newHistory, ...prev.filmHistory]
    }));
  };

  // Handle Answer Click
  const handleSelectAnswer = (optionIdx: number, targetTeam?: 'red' | 'blue') => {
    const q = activeQuestion || currentQuestion;
    if (isAnswerRevealed || matchWinner || !q) return;

    setSelectedAnswerIndex(optionIdx);
    setIsAnswerRevealed(true);
    setIsTimerRunning(false);

    const isCorrect = optionIdx === q.correctIndex;
    const answeringTeam = targetTeam || (currentTurn === 'blue' ? 'blue' : 'red');

    if (isCorrect) {
      if (soundEnabled) playCelebration();
      
      // Increment score for answering correctly
      if (answeringTeam === 'red') {
        setRedScore((s) => s + 1);
        setScoreNotice('🎉 Đội Đỏ trả lời ĐÚNG (+1 điểm, Kéo dây +25px)!');
        pullRope('red', 25);
      } else {
        setBlueScore((s) => s + 1);
        setScoreNotice('🎉 Đội Xanh trả lời ĐÚNG (+1 điểm, Kéo dây +25px)!');
        pullRope('blue', 25);
      }

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 }
      });
    } else {
      if (soundEnabled) playBeep(200, 0.4, 0.2);
      // Opponent gets to pull rope towards them!
      const opponent = answeringTeam === 'red' ? 'blue' : 'red';
      if (opponent === 'red') {
        setRedScore((s) => s + 1);
        setScoreNotice('🔴 Đội Đỏ được +1 điểm do đối phương trả lời Sai (Kéo dây +15px)!');
        pullRope('red', 15);
      } else {
        setBlueScore((s) => s + 1);
        setScoreNotice('🔵 Đội Xanh được +1 điểm do đối phương trả lời Sai (Kéo dây +15px)!');
        pullRope('blue', 15);
      }
    }
  };

  const handleAwardTeamPoint = (team: 'red' | 'blue') => {
    if (matchWinner) return;
    if (soundEnabled) playCelebration();

    if (team === 'red') {
      setRedScore((s) => s + 1);
      setScoreNotice('🔴 Đội Đỏ +1 điểm & Kéo dây +25px!');
      pullRope('red', 25);
    } else {
      setBlueScore((s) => s + 1);
      setScoreNotice('🔵 Đội Xanh +1 điểm & Kéo dây +25px!');
      pullRope('blue', 25);
    }

    confetti({
      particleCount: 35,
      spread: 45,
      origin: { y: 0.7 }
    });
  };

  // Next Question
  const handleNextQuestion = () => {
    setQuestionIndex((prev) => prev + 1);
    // Switch turn
    setCurrentTurn((prev) => (prev === 'red' ? 'blue' : 'red'));
    // Start next random question with shuffled options
    startRandomQuestion();
  };

  // Randomize 2 Players
  const pickRandomPlayers = () => {
    if (teamRed.length > 0) {
      const r = teamRed[Math.floor(Math.random() * teamRed.length)];
      setRedPlayer(r);
    }
    if (teamBlue.length > 0) {
      const b = teamBlue[Math.floor(Math.random() * teamBlue.length)];
      setBluePlayer(b);
    }
    if (soundEnabled) playBeep(523, 0.15, 0.1);
  };

  // Auto Split Teams
  const autoSplitTeams = () => {
    if (allStudents.length === 0) return;
    const shuffled = [...allStudents].sort(() => Math.random() - 0.5);
    const mid = Math.ceil(shuffled.length / 2);
    const red = shuffled.slice(0, mid);
    const blue = shuffled.slice(mid);
    setTeamRed(red);
    setTeamBlue(blue);
    setRedPlayer(red[0] || null);
    setBluePlayer(blue[0] || null);
    if (soundEnabled) playBeep(659, 0.2, 0.1);
  };

  // Complete Reset Match / Rope / Questions back to initial state
  const resetMatch = () => {
    setRopePosition(0);
    setRedScore(0);
    setBlueScore(0);
    setMatchWinner(null);
    setIsQuestionStarted(false);
    setActiveQuestion(null);
    setSelectedAnswerIndex(null);
    setIsAnswerRevealed(false);
    setTimeLeft(tugTimerSeconds);
    setIsTimerRunning(false);
    setCurrentTurn('red');
    setAskedQuestionIds([]);
    setScoreNotice('🔄 Đã đặt lại toàn bộ trận đấu Kéo co về trạng thái ban đầu!');
    split5v5NoRepeat();
    if (soundEnabled) playBeep(440, 0.25, 0.15);
  };

  const resetScore = () => {
    setRedScore(0);
    setBlueScore(0);
    setScoreNotice('Đã đặt lại tỷ số về 0 - 0');
  };

  // Award Flowers to Winning Team / Student
  const handleAwardWinner = () => {
    if (!matchWinner) return;

    const winningTeam = matchWinner === 'red' ? teamRed : teamBlue;
    const targetStudentIds = winningTeam.map((s) => s.id);

    onUpdateState((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        targetStudentIds.includes(s.id) ? { ...s, coins: (s.coins || 0) + awardAmount } : s
      ),
      transactions: [
        {
          id: uid('tx'),
          classId: prev.activeClassId,
          studentId: matchWinner === 'red' ? (redPlayer?.id || 'team') : (bluePlayer?.id || 'team'),
          studentName: `Chiến thắng Kéo co (Đội ${matchWinner === 'red' ? 'Đỏ' : 'Xanh'})`,
          amount: awardAmount,
          reason: `Thưởng chiến thắng Trò chơi Kéo co (+${awardAmount} hoa/mỗi HS)`,
          subject: selectedSubject !== 'all' ? selectedSubject : 'Trò chơi Kéo co',
          time: new Date().toISOString()
        },
        ...prev.transactions
      ]
    }));

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });

    alert(`🎉 Đã cộng +${awardAmount} bông hoa cho ${winningTeam.length} học sinh Đội ${matchWinner === 'red' ? 'Đỏ 🔴' : 'Xanh 🔵'}!`);
  };

  const clearHistory = () => {
    onUpdateState((prev) => ({
      ...prev,
      filmHistory: prev.filmHistory.filter((h) => h.classId !== prev.activeClassId)
    }));
  };

  const classHistory = state.filmHistory.filter((h) => h.classId === state.activeClassId);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Banner & Control Bar */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-sky-600 rounded-3xl p-4 sm:p-5 text-white shadow-xl shadow-rose-950/10 border border-white/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
              <Swords className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300 stroke-[2.5] animate-bounce" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider flex items-center gap-2 justify-center md:justify-start">
                <span>🚩 TRÒ CHƠI KÉO CO HỌC TẬP</span>
              </h2>
              <p className="text-xs text-rose-100 font-semibold mt-0.5">
                Thi đấu kéo co kịch tính giữa <strong className="text-amber-200">Đội Đỏ 🔴</strong> và <strong className="text-sky-200">Đội Xanh 🔵</strong> – Vừa trả lời câu hỏi vừa giành chiến thắng!
              </p>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-center">
            <button
              onClick={toggleFullscreen}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md animate-pulse"
              title="Mở toàn màn hình chỉ hiển thị Bàn thi đấu và Câu hỏi"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span>{isFullscreen ? 'Thoát Toàn màn hình' : '🖥️ TOÀN MÀN HÌNH TIVI'}</span>
            </button>

            <button
              onClick={() => setGameMode(gameMode === 'quiz' ? 'manual' : 'quiz')}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                gameMode === 'quiz'
                  ? 'bg-amber-100 text-slate-900 hover:bg-amber-200'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{gameMode === 'quiz' ? 'Trắc nghiệm' : 'Kéo co Thủ công'}</span>
            </button>

            <button
              onClick={() => setShowScoreboard(!showScoreboard)}
              className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all"
              title={showScoreboard ? 'Ẩn bảng điểm số' : 'Hiện bảng điểm số'}
            >
              <span>{showScoreboard ? '👁️ Ẩn tỷ số' : '🙈 Hiện tỷ số'}</span>
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all"
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={resetMatch}
              className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Đặt lại dây kéo</span>
            </button>

            <button
              onClick={resetScore}
              className="px-2.5 py-2 rounded-xl bg-rose-500/80 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1"
              title="Đặt lại tỷ số về 0 - 0"
            >
              <span>Xóa điểm (0-0)</span>
            </button>
          </div>
        </div>
      </div>

      {/* UNIFIED MATCH ARENA & QUIZ CARD */}
      <div
        ref={gameStageRef}
        className={`bg-slate-900 rounded-3xl relative overflow-hidden text-white transition-all ${
          isFullscreen
            ? 'fixed inset-0 z-50 bg-slate-950 p-4 sm:p-6 md:p-8 flex flex-col justify-between h-screen overflow-hidden border-0 rounded-none'
            : 'p-4 sm:p-5 border-4 border-slate-800 shadow-2xl space-y-3'
        }`}
      >
        {/* Background Stadium Grid & Lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-90 pointer-events-none" />

        {/* Fullscreen Bar Header if in Fullscreen */}
        {isFullscreen && (
          <div className="relative z-10 flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-sky-600 text-white shadow-xl border border-white/20">
            <div className="flex items-center gap-2.5">
              <Swords className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300 animate-bounce shrink-0" />
              <h3 className="text-sm sm:text-base font-black uppercase tracking-wider">
                SÂN THI ĐẤU KÉO CO & CÂU HỎI
              </h3>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowScoreboard(!showScoreboard)}
                className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm transition-all"
              >
                <span>{showScoreboard ? '👁️ Ẩn tỷ số' : '🙈 Hiện tỷ số'}</span>
              </button>

              <button
                onClick={resetMatch}
                className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Đặt lại dây</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all"
              >
                <Minimize2 className="w-4 h-4" />
                <span>Thoát Fullscreen</span>
              </button>
            </div>
          </div>
        )}

        {/* 1. ARENA HEADER & SCOREBOARD */}
        <div className={`relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/80 ${isFullscreen ? 'pb-3' : 'pb-2.5'}`}>
          {/* Team Red Info */}
          <div className="flex items-center gap-2.5">
            <div className={`rounded-2xl bg-red-600/30 border border-red-500/50 flex items-center justify-center font-black text-red-400 shadow ${isFullscreen ? 'w-12 h-12 text-xl' : 'w-8 h-8 text-sm'}`}>
              🔴
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`font-black uppercase text-red-400 tracking-wider ${isFullscreen ? 'text-sm' : 'text-[11px]'}`}>ĐỘI ĐỎ</span>
                <span className={`rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30 ${isFullscreen ? 'text-xs px-2 py-0.5' : 'text-[9px] px-1.5 py-0.2'}`}>
                  {teamRed.length} HS
                </span>
              </div>
              <p className={`font-bold text-slate-200 ${isFullscreen ? 'text-sm sm:text-base mt-0.5' : 'text-xs'}`}>
                Đại diện: <strong className="text-red-300">{redPlayer ? redPlayer.name : 'Chưa chọn'}</strong>
              </p>
            </div>
          </div>

          {/* Center Match Score */}
          {showScoreboard ? (
            <div className={`text-center rounded-2xl bg-slate-800/90 border border-slate-700 shadow-inner ${isFullscreen ? 'px-6 py-2' : 'px-3 py-1'}`}>
              <div className={`font-black text-amber-400 uppercase tracking-widest ${isFullscreen ? 'text-xs' : 'text-[8px]'}`}>TỶ SỐ CÂU ĐÚNG</div>
              <div className={`font-black text-white tracking-widest leading-none ${isFullscreen ? 'text-3xl sm:text-5xl mt-1' : 'text-lg mt-0.5'}`}>
                <span className="text-red-400">{redScore}</span>
                <span className="mx-2 text-slate-500">:</span>
                <span className="text-sky-400">{blueScore}</span>
              </div>
            </div>
          ) : (
            <div className={`text-center rounded-xl bg-slate-800/50 border border-slate-700/50 ${isFullscreen ? 'px-4 py-2' : 'px-2.5 py-0.5'}`}>
              <span className={`font-bold text-slate-400 ${isFullscreen ? 'text-xs' : 'text-[10px]'}`}>ĐÃ ẨN BẢNG ĐIỂM</span>
            </div>
          )}

          {/* Team Blue Info */}
          <div className="flex items-center gap-2.5 text-right">
            <div>
              <div className="flex items-center justify-end gap-1.5">
                <span className={`rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30 ${isFullscreen ? 'text-xs px-2 py-0.5' : 'text-[9px] px-1.5 py-0.2'}`}>
                  {teamBlue.length} HS
                </span>
                <span className={`font-black uppercase text-sky-400 tracking-wider ${isFullscreen ? 'text-sm' : 'text-[11px]'}`}>ĐỘI XANH</span>
              </div>
              <p className={`font-bold text-slate-200 ${isFullscreen ? 'text-sm sm:text-base mt-0.5' : 'text-xs'}`}>
                Đại diện: <strong className="text-sky-300">{bluePlayer ? bluePlayer.name : 'Chưa chọn'}</strong>
              </p>
            </div>
            <div className={`rounded-2xl bg-sky-600/30 border border-sky-500/50 flex items-center justify-center font-black text-sky-400 shadow ${isFullscreen ? 'w-12 h-12 text-xl' : 'w-8 h-8 text-sm'}`}>
              🔵
            </div>
          </div>
        </div>

        {/* 2. COMPACT TUG OF WAR ARENA */}
        <div className={`relative z-10 rounded-2xl bg-gradient-to-b from-emerald-950/80 via-emerald-900/40 to-slate-900 border border-emerald-500/30 overflow-hidden shadow-inner flex flex-col justify-between ${isFullscreen ? 'py-4 px-6 my-2' : 'py-2.5 px-3'}`}>
          {/* Top Field Indicators */}
          <div className={`flex items-center justify-between font-black uppercase tracking-wider text-slate-300 px-1 ${isFullscreen ? 'text-xs sm:text-sm' : 'text-[9px]'}`}>
            <span className="text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/30">
              🏁 Đích Đỏ (-80px)
            </span>
            <span className="text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
              ⚖️ Trung tâm
            </span>
            <span className="text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-500/30">
              🏁 Đích Xanh (+80px)
            </span>
          </div>

          {/* Animated Characters & Rope Track */}
          <div className={`relative my-1 flex items-center justify-center ${isFullscreen ? 'h-28 sm:h-36' : 'h-16'}`}>
            {/* Center Line Marker */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.8)] z-0 border-dashed" />
            <div className="absolute left-[15%] top-0 bottom-0 w-0.5 bg-red-500/50 border-dashed" />
            <div className="absolute right-[15%] top-0 bottom-0 w-0.5 bg-sky-500/50 border-dashed" />

            {/* Red Team Puller */}
            <div
              className={`absolute left-1 sm:left-4 z-10 flex items-center gap-1.5 transition-transform duration-500 ${
                pullingTeamAnimation === 'red' ? '-translate-x-2 scale-105' : ''
              }`}
            >
              {redPlayer && (
                <div className="flex flex-col items-center">
                  <Avatar name={redPlayer.name} avatar={redPlayer.avatar} size={isFullscreen ? 'lg' : 'sm'} />
                  <span className={`font-black text-red-200 mt-0.5 truncate bg-red-950/80 px-1.5 py-0.5 rounded border border-red-500/40 ${isFullscreen ? 'text-xs max-w-[100px]' : 'text-[9px] max-w-[65px]'}`}>
                    {redPlayer.name}
                  </span>
                </div>
              )}
              <div className={`font-black text-red-400 animate-pulse ${isFullscreen ? 'text-3xl' : 'text-lg'}`}>💪</div>
            </div>

            {/* Rope & Moving Knot */}
            <div className="relative w-full max-w-2xl flex items-center justify-center">
              <div className={`w-full bg-amber-800 border-y border-amber-600 rounded-full shadow relative overflow-hidden ${isFullscreen ? 'h-3 sm:h-4' : 'h-2'}`}>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,_transparent_25%,_rgba(255,255,255,0.2)_50%,_transparent_75%)] bg-[length:16px_16px]" />
              </div>

              {/* Knot */}
              <div
                className="absolute z-20 top-1/2 -translate-y-1/2 transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) flex flex-col items-center"
                style={{
                  transform: `translate(-50%, -50%) translateX(${ropePosition * (isFullscreen ? 3.5 : 2.5)}px)`
                }}
              >
                <div className={`rounded-full bg-gradient-to-tr from-red-600 to-amber-500 border border-white shadow-[0_0_15px_rgba(239,68,68,0.9)] flex items-center justify-center animate-pulse ${isFullscreen ? 'w-10 h-10' : 'w-6 h-6'}`}>
                  <Flame className={`text-white fill-current ${isFullscreen ? 'w-6 h-6' : 'w-3.5 h-3.5'}`} />
                </div>
                <span className={`font-black uppercase text-amber-300 bg-black/80 rounded border border-amber-400/50 mt-0.5 whitespace-nowrap ${isFullscreen ? 'text-xs px-2 py-0.5' : 'text-[8px] px-1 py-0.2'}`}>
                  {ropePosition < 0 ? `Đỏ ${Math.abs(ropePosition)}px` : ropePosition > 0 ? `Xanh ${ropePosition}px` : '0px'}
                </span>
              </div>
            </div>

            {/* Blue Team Puller */}
            <div
              className={`absolute right-1 sm:right-4 z-10 flex items-center gap-1.5 transition-transform duration-500 ${
                pullingTeamAnimation === 'blue' ? 'translate-x-2 scale-105' : ''
              }`}
            >
              <div className={`font-black text-sky-400 animate-pulse ${isFullscreen ? 'text-3xl' : 'text-lg'}`}>💪</div>
              {bluePlayer && (
                <div className="flex flex-col items-center">
                  <Avatar name={bluePlayer.name} avatar={bluePlayer.avatar} size={isFullscreen ? 'lg' : 'sm'} />
                  <span className={`font-black text-sky-200 mt-0.5 truncate bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-500/40 ${isFullscreen ? 'text-xs max-w-[100px]' : 'text-[9px] max-w-[65px]'}`}>
                    {bluePlayer.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Match Winner Grand Fireworks & Flying Flag Overlay */}
          {matchWinner ? (
            <div className={`relative overflow-hidden rounded-2xl border-2 p-3 sm:p-4 text-center animate-in zoom-in-95 duration-300 my-1 ${
              matchWinner === 'red'
                ? 'bg-gradient-to-r from-red-950 via-rose-900 to-amber-950 border-amber-400 shadow-[0_0_30px_rgba(239,68,68,0.6)]'
                : 'bg-gradient-to-r from-sky-950 via-blue-900 to-amber-950 border-amber-400 shadow-[0_0_30px_rgba(56,189,248,0.6)]'
            }`}>
              {/* Flying Flags Background Floating Animations */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35 flex justify-between px-3 items-center">
                <span className="text-2xl sm:text-4xl animate-bounce duration-1000">🚩</span>
                <span className="text-2xl sm:text-4xl animate-pulse duration-700 delay-100">🎆</span>
                <span className="text-2xl sm:text-4xl animate-bounce duration-1000 delay-200">🏁</span>
                <span className="text-2xl sm:text-4xl animate-pulse duration-700 delay-300">💥</span>
                <span className="text-2xl sm:text-4xl animate-bounce duration-1000 delay-500">🚩</span>
              </div>

              <div className="relative z-10 space-y-1.5">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <span className="text-xl sm:text-3xl animate-bounce">🎆</span>
                  <span className="text-xl sm:text-3xl animate-pulse">🚩</span>
                  <h3 className={`font-black uppercase tracking-wider text-amber-300 flex items-center justify-center gap-1.5 drop-shadow-[0_2px_8px_rgba(251,191,36,0.8)] ${isFullscreen ? 'text-xl sm:text-3xl' : 'text-sm sm:text-base'}`}>
                    <Trophy className={`text-amber-300 animate-bounce ${isFullscreen ? 'w-7 h-7 sm:w-9 sm:h-9' : 'w-5 h-5'}`} />
                    <span>
                      {matchWinner === 'red' ? '🔴 ĐỘI ĐỎ XUẤT SẮC CHIẾN THẮNG! 🏆' : '🔵 ĐỘI XANH XUẤT SẮC CHIẾN THẮNG! 🏆'}
                    </span>
                  </h3>
                  <span className="text-xl sm:text-3xl animate-pulse">🚩</span>
                  <span className="text-xl sm:text-3xl animate-bounce">🎆</span>
                </div>

                <p className={`font-extrabold text-amber-100 ${isFullscreen ? 'text-xs sm:text-base' : 'text-[11px]'}`}>
                  🎉 Chúc mừng các chiến binh kéo co tài năng đã giành cờ chiến thắng rực rỡ!
                </p>

                {/* Victory Actions Toolbar */}
                <div className="mt-2 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                  <button
                    onClick={() => launchFireworksSequence(matchWinner)}
                    className={`rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:scale-105 active:scale-95 text-slate-950 font-black shadow-lg shadow-amber-500/30 flex items-center gap-1.5 transition-all cursor-pointer ${isFullscreen ? 'px-4 py-2 text-xs sm:text-sm' : 'px-2.5 py-1 text-xs'}`}
                  >
                    <span>🎆 BẮN PHÁO HOA MỚI</span>
                  </button>

                  <button
                    onClick={handleAwardWinner}
                    className={`rounded-xl bg-rose-500 hover:bg-rose-600 hover:scale-105 active:scale-95 text-white font-black shadow-lg shadow-rose-500/30 flex items-center gap-1.5 transition-all cursor-pointer ${isFullscreen ? 'px-4 py-2 text-xs sm:text-sm' : 'px-2.5 py-1 text-xs'}`}
                  >
                    <span>🌺 Thưởng hoa toàn đội</span>
                  </button>

                  <button
                    onClick={resetMatch}
                    className={`rounded-xl bg-slate-800 hover:bg-slate-700 hover:scale-105 active:scale-95 text-white font-black border border-slate-600 flex items-center gap-1.5 transition-all cursor-pointer ${isFullscreen ? 'px-4 py-2 text-xs sm:text-sm' : 'px-2.5 py-1 text-xs'}`}
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
                    <span>🔄 Đấu trận mới</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                onClick={() => pullRope('red', 20)}
                className={`flex-1 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black shadow border border-red-400/40 active:scale-95 transition-all truncate ${isFullscreen ? 'py-2.5 px-4 text-sm sm:text-base' : 'py-1 px-2 text-[10px]'}`}
              >
                🔴 ĐỎ KÉO (+20px)
              </button>

              <button
                onClick={pickRandomPlayers}
                className={`rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-extrabold border border-amber-500/40 transition-all shrink-0 ${isFullscreen ? 'py-2.5 px-4 text-xs sm:text-sm' : 'py-1 px-2 text-[10px]'}`}
              >
                <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
                Đổi HS
              </button>

              <button
                onClick={() => pullRope('blue', 20)}
                className={`flex-1 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-black shadow border border-sky-400/40 active:scale-95 transition-all truncate ${isFullscreen ? 'py-2.5 px-4 text-sm sm:text-base' : 'py-1 px-2 text-[10px]'}`}
              >
                🔵 XANH KÉO (+20px)
              </button>
            </div>
          )}
        </div>

        {/* 3. INTEGRATED QUIZ SECTION */}
        {gameMode === 'quiz' && (
          <div className={`relative z-10 pt-2 border-t border-slate-700/80 flex flex-col justify-between ${isFullscreen ? 'flex-1 space-y-4 pt-4' : 'space-y-2.5'}`}>
            {/* Quiz Filters & Turn Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`flex items-center gap-1.5 bg-slate-800/80 rounded-xl border border-slate-700 ${isFullscreen ? 'px-3 py-1.5' : 'px-2 py-0.5'}`}>
                  <BookOpen className="w-4 h-4 text-teal-400" />
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className={`bg-transparent font-bold text-slate-200 focus:outline-none ${isFullscreen ? 'text-xs sm:text-sm' : 'text-[11px]'}`}
                  >
                    <option value="all" className="bg-slate-900">Tất cả môn</option>
                    {(state.subjects || ['Toán', 'Tiếng Việt', 'Tin học', 'Khoa học', 'Đạo đức']).map((s) => (
                      <option key={s} value={s} className="bg-slate-900">{s}</option>
                    ))}
                  </select>
                </div>

                <div className={`flex items-center gap-1.5 bg-slate-800/80 rounded-xl border border-slate-700 ${isFullscreen ? 'px-3 py-1.5' : 'px-2 py-0.5'}`}>
                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className={`bg-transparent font-bold text-slate-200 focus:outline-none ${isFullscreen ? 'text-xs sm:text-sm' : 'text-[11px]'}`}
                  >
                    <option value="all" className="bg-slate-900">Tất cả khối</option>
                    {[1, 2, 3, 4, 5].map((g) => (
                      <option key={g} value={g} className="bg-slate-900">Khối {g}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Turn & Timer Controls */}
              <div className="flex items-center gap-2">
                {/* Independent Timer Adjustment Dropdown */}
                <div className={`flex items-center gap-1 bg-slate-800/90 rounded-xl border border-slate-700 ${isFullscreen ? 'px-3 py-1.5' : 'px-2 py-0.5'}`}>
                  <Timer className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] font-bold text-slate-300 hidden sm:inline">Thời gian:</span>
                  <select
                    value={tugTimerSeconds}
                    onChange={(e) => setTugTimerSeconds(parseInt(e.target.value) || 0)}
                    className="bg-transparent font-extrabold text-amber-300 text-[11px] focus:outline-none cursor-pointer"
                  >
                    <option value={0} className="bg-slate-900">Không giới hạn</option>
                    <option value={10} className="bg-slate-900">10 giây</option>
                    <option value={15} className="bg-slate-900">15 giây</option>
                    <option value={20} className="bg-slate-900">20 giây</option>
                    <option value={30} className="bg-slate-900">30 giây</option>
                    <option value={45} className="bg-slate-900">45 giây</option>
                    <option value={60} className="bg-slate-900">60 giây</option>
                  </select>
                </div>

                <button
                  onClick={() => setCurrentTurn(currentTurn === 'red' ? 'blue' : 'red')}
                  className={`rounded-xl font-black flex items-center gap-1 border transition-all ${isFullscreen ? 'px-3 py-1.5 text-xs sm:text-sm' : 'px-2 py-0.5 text-[11px]'} ${
                    currentTurn === 'red'
                      ? 'bg-red-950/80 text-red-300 border-red-500/50'
                      : 'bg-sky-950/80 text-sky-300 border-sky-500/50'
                  }`}
                >
                  <span>Lượt: {currentTurn === 'red' ? '🔴 ĐỘI ĐỎ' : '🔵 ĐỘI XANH'}</span>
                </button>

                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`rounded-xl font-bold flex items-center gap-1 border transition-all ${isFullscreen ? 'px-3 py-1.5 text-xs sm:text-sm' : 'px-2 py-0.5 text-[11px]'} ${
                    isTimerRunning
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400 animate-pulse'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                  title={isTimerRunning ? 'Tạm dừng đếm ngược' : 'Bắt đầu đếm ngược'}
                >
                  <Timer className="w-4 h-4" />
                  <span>{timeLeft}s</span>
                </button>
              </div>
            </div>

            {/* Question Text & Options or Start Game Button */}
            {!isQuestionStarted || !activeQuestion ? (
              <div className={`p-5 sm:p-8 rounded-2xl bg-gradient-to-r from-teal-950 via-slate-800 to-sky-950 border border-teal-500/30 text-center text-white space-y-3 my-2 ${isFullscreen ? 'p-8 sm:p-12 space-y-5 my-auto' : ''}`}>
                <div className={`mx-auto rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center animate-bounce ${isFullscreen ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-12 h-12'}`}>
                  <Zap className={`text-amber-300 fill-current ${isFullscreen ? 'w-10 h-10' : 'w-6 h-6'}`} />
                </div>
                <div>
                  <h3 className={`font-black text-amber-200 uppercase tracking-wide ${isFullscreen ? 'text-xl sm:text-3xl' : 'text-sm sm:text-base'}`}>
                    SẴN SÀNG THI ĐẤU CÂU HỎI KÉO CO
                  </h3>
                  <p className={`text-slate-300 font-semibold max-w-md mx-auto mt-1 ${isFullscreen ? 'text-sm sm:text-base' : 'text-xs'}`}>
                    Bấm nút bên dưới để bắt đầu xuất hiện câu hỏi ngẫu nhiên và tự động đảo vị trí đáp án!
                  </p>
                </div>
                <button
                  onClick={startRandomQuestion}
                  className={`rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto ${isFullscreen ? 'px-8 py-4 text-base sm:text-xl' : 'px-5 py-2.5 text-xs sm:text-sm'}`}
                >
                  <Play className={`fill-current text-slate-950 ${isFullscreen ? 'w-6 h-6' : 'w-4 h-4'}`} />
                  <span>▶️ BẮT ĐẦU CÂU HỎI NGẪU NHIÊN</span>
                </button>
              </div>
            ) : (
              <div className={`flex flex-col justify-between flex-1 ${isFullscreen ? 'space-y-4' : 'space-y-2.5'}`}>
                {/* Question Box */}
                <div className={`rounded-2xl bg-gradient-to-r from-teal-950 via-slate-800 to-sky-950 border border-teal-500/30 text-white shadow ${isFullscreen ? 'p-5 sm:p-6' : 'p-3'}`}>
                  <div className={`flex items-center justify-between text-teal-300 font-bold mb-1 ${isFullscreen ? 'text-xs sm:text-sm' : 'text-[10px]'}`}>
                    <span>⚡ CÂU HỎI ({availableQuestions.length} câu trong ngân hàng)</span>
                    {activeQuestion.subject && <span>Môn: {activeQuestion.subject}</span>}
                  </div>
                  <h3 className={`font-black leading-snug text-teal-50 ${isFullscreen ? 'text-base sm:text-2xl' : 'text-xs sm:text-sm'}`}>
                    {activeQuestion.question}
                  </h3>
                </div>

                {/* 4 Options Grid (2x2) */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${isFullscreen ? 'gap-4' : 'gap-2'}`}>
                  {activeQuestion.options.map((opt, optionIdx) => {
                    const letters = ['A', 'B', 'C', 'D'];
                    const isSelected = selectedAnswerIndex === optionIdx;
                    const isCorrect = optionIdx === activeQuestion.correctIndex;

                    let optionStyle = 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-100';
                    if (isAnswerRevealed) {
                      if (isCorrect) {
                        optionStyle = 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-400 font-black';
                      } else if (isSelected && !isCorrect) {
                        optionStyle = 'bg-rose-600 text-white border-rose-400 font-bold';
                      } else {
                        optionStyle = 'bg-slate-950/60 text-slate-500 border-slate-800 opacity-50';
                      }
                    }

                    return (
                      <button
                        key={optionIdx}
                        onClick={() => handleSelectAnswer(optionIdx)}
                        disabled={isAnswerRevealed || !!matchWinner}
                        className={`rounded-2xl border text-left font-extrabold flex items-center gap-3 transition-all ${optionStyle} ${isFullscreen ? 'p-4 sm:p-5 text-sm sm:text-lg' : 'p-2.5 text-xs'}`}
                      >
                        <span className={`rounded-xl bg-slate-700 text-amber-300 flex items-center justify-center font-black shrink-0 ${isFullscreen ? 'w-8 h-8 text-base' : 'w-4 h-4 text-[10px]'}`}>
                          {letters[optionIdx]}
                        </span>
                        <span className="flex-1 leading-snug">{opt}</span>
                        {isAnswerRevealed && isCorrect && (
                          <CheckCircle2 className={`text-white shrink-0 ${isFullscreen ? 'w-6 h-6' : 'w-4 h-4'}`} />
                        )}
                        {isAnswerRevealed && isSelected && !isCorrect && (
                          <XCircle className={`text-white shrink-0 ${isFullscreen ? 'w-6 h-6' : 'w-4 h-4'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Answer Explanation */}
                {isAnswerRevealed && (
                  <div className={`rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 space-y-1 animate-in fade-in duration-200 ${isFullscreen ? 'p-3.5 text-sm' : 'p-2.5 text-xs'}`}>
                    <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>ĐÁP ÁN CHÍNH XÁC: {['A', 'B', 'C', 'D'][activeQuestion.correctIndex]}. {activeQuestion.options[activeQuestion.correctIndex]}</span>
                    </div>
                    {activeQuestion.explanation && (
                      <p className="pl-5 text-emerald-300/90 text-xs">
                        💡 {activeQuestion.explanation}
                      </p>
                    )}
                  </div>
                )}

                {/* Instant Score & Next Controls */}
                <div className={`flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 ${isFullscreen ? 'pt-3' : 'pt-1'}`}>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAwardTeamPoint('red')}
                      className={`rounded-xl bg-red-900/60 hover:bg-red-800/80 text-red-200 font-black border border-red-500/40 flex items-center gap-1 transition-all ${isFullscreen ? 'px-4 py-2 text-xs sm:text-sm' : 'px-2 py-0.5 text-[10px]'}`}
                    >
                      🔴 Đỏ +1 điểm
                    </button>
                    <button
                      onClick={() => handleAwardTeamPoint('blue')}
                      className={`rounded-xl bg-sky-900/60 hover:bg-sky-800/80 text-sky-200 font-black border border-sky-500/40 flex items-center gap-1 transition-all ${isFullscreen ? 'px-4 py-2 text-xs sm:text-sm' : 'px-2 py-0.5 text-[10px]'}`}
                    >
                      🔵 Xanh +1 điểm
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsAnswerRevealed(!isAnswerRevealed)}
                      className={`rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all ${isFullscreen ? 'px-4 py-2 text-xs sm:text-sm' : 'px-2.5 py-1 text-[11px]'}`}
                    >
                      {isAnswerRevealed ? 'Ẩn đáp án' : 'Hiện đáp án'}
                    </button>

                    <button
                      onClick={handleNextQuestion}
                      className={`rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black shadow flex items-center gap-1.5 transition-all ${isFullscreen ? 'px-5 py-2 text-sm sm:text-base' : 'px-3 py-1 text-xs'}`}
                      title="Chuyển sang câu hỏi ngẫu nhiên tiếp theo và tự động đảo đáp án"
                    >
                      <span>Câu tiếp ngẫu nhiên</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ROSTER & MATCH HISTORY (Excluded from Fullscreen) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Team Roster Column */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-5 border-2 border-teal-100 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-teal-600" />
                <span>Chia Đội Chơi Kéo Co (Mỗi đội 5 HS)</span>
              </h3>
              <p className="text-[11px] text-teal-700 font-bold mt-0.5">
                🎯 Tiến trình quay vòng: <strong className="text-rose-600">{playedStudentIds.length}/{allStudents.length} HS đã tham gia</strong>
                {allStudents.length > playedStudentIds.length ? ` (Còn ${allStudents.length - playedStudentIds.length} em chưa lật)` : ' (Đã đủ 100% lớp - Sắp bắt đầu vòng mới!)'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={split5v5NoRepeat}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow flex items-center gap-1 transition-all"
                title="Chia 5 HS Đội Đỏ & 5 HS Đội Xanh từ danh sách chưa tham gia"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>🎲 Chia 5v5 Mới (Không trùng)</span>
              </button>

              <button
                onClick={resetPlayedCycle}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                title="Đặt lại tiến trình quay vòng để chọn lại từ đầu danh sách"
              >
                🔄 Đặt lại vòng
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Red Team Roster */}
            <div className="p-3.5 rounded-2xl bg-red-50/60 border border-red-100">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-red-100">
                <span className="font-extrabold text-xs text-red-700">🔴 ĐỘI ĐỎ ({teamRed.length})</span>
                <button
                  onClick={() => {
                    if (teamRed.length > 0) {
                      setRedPlayer(teamRed[Math.floor(Math.random() * teamRed.length)]);
                    }
                  }}
                  className="text-[10px] font-bold text-red-600 hover:underline"
                >
                  🎲 Chọn đại diện
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                {teamRed.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setRedPlayer(s)}
                    className={`p-1.5 rounded-xl border text-center cursor-pointer transition-all ${
                      redPlayer?.id === s.id
                        ? 'bg-red-600 text-white border-red-700 font-black shadow-sm'
                        : 'bg-white text-slate-800 border-red-100 hover:bg-red-100'
                    }`}
                  >
                    <Avatar name={s.name} avatar={s.avatar} size="xs" />
                    <span className="block font-bold text-[10px] truncate mt-0.5">{s.name.split(' ').slice(-1)[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Blue Team Roster */}
            <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-sky-100">
                <span className="font-extrabold text-xs text-sky-700">🔵 ĐỘI XANH ({teamBlue.length})</span>
                <button
                  onClick={() => {
                    if (teamBlue.length > 0) {
                      setBluePlayer(teamBlue[Math.floor(Math.random() * teamBlue.length)]);
                    }
                  }}
                  className="text-[10px] font-bold text-sky-600 hover:underline"
                >
                  🎲 Chọn đại diện
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                {teamBlue.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setBluePlayer(s)}
                    className={`p-1.5 rounded-xl border text-center cursor-pointer transition-all ${
                      bluePlayer?.id === s.id
                        ? 'bg-sky-600 text-white border-sky-700 font-black shadow-sm'
                        : 'bg-white text-slate-800 border-sky-100 hover:bg-sky-100'
                    }`}
                  >
                    <Avatar name={s.name} avatar={s.avatar} size="xs" />
                    <span className="block font-bold text-[10px] truncate mt-0.5">{s.name.split(' ').slice(-1)[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* History Column */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border-2 border-teal-100 shadow-md">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Lịch sử thắng ({classHistory.length})</span>
            </h3>
            {classHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-[11px] text-rose-600 font-bold hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Xóa</span>
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {classHistory.map((h) => (
              <div
                key={h.id}
                className="p-2.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🏆</span>
                  <div>
                    <span className="font-extrabold text-slate-900 block">{h.studentName}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(h.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {classHistory.length === 0 && (
              <div className="text-center py-6 text-slate-400 font-bold text-xs">
                Chưa có lịch sử trận đấu kéo co.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
