import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  Check,
  X,
  Search,
  HelpCircle,
  BookOpen,
  Sparkles,
  Shuffle,
  Folder,
  FolderPlus,
  FolderOpen,
  Tag,
  CheckSquare,
  Square,
  MoveRight
} from 'lucide-react';
import { QuizQuestion, QuestionFolder, DEFAULT_SUBJECTS } from '../../../types';
import { DEFAULT_QUIZ_QUESTIONS } from '../../../data/defaultQuestions';
import { DEFAULT_QUESTION_FOLDERS, uid } from '../../../utils/helpers';

interface QuestionBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuizQuestion[];
  folders: QuestionFolder[];
  onSaveQuestions: (questions: QuizQuestion[]) => void;
  onSaveFolders: (folders: QuestionFolder[]) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

const FOLDER_COLORS = [
  { hex: '#0284c7', name: 'Xanh biển' },
  { hex: '#10b981', name: 'Xanh lá' },
  { hex: '#f59e0b', name: 'Vàng cam' },
  { hex: '#8b5cf6', name: 'Tím mộng mị' },
  { hex: '#ec4899', name: 'Hồng tươi' },
  { hex: '#6366f1', name: 'Chàm chàm' },
  { hex: '#ef4444', name: 'Đỏ nổi bật' },
  { hex: '#14b8a6', name: 'Xanh ngọc' }
];

export const QuestionBankModal: React.FC<QuestionBankModalProps> = ({
  isOpen,
  onClose,
  questions,
  folders,
  onSaveQuestions,
  onSaveFolders
}) => {
  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all'); // 'all', 'uncategorized', or folderId
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Batch selection state
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  // Folder CRUD modal state
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState('');
  const [folderDesc, setFolderDesc] = useState('');
  const [folderColor, setFolderColor] = useState('#0284c7');

  // New question form state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formQuestion, setFormQuestion] = useState('');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrectIndex, setFormCorrectIndex] = useState<number>(0);
  const [formSubject, setFormSubject] = useState<string>('Toán');
  const [formFolderId, setFormFolderId] = useState<string>('');
  const [formRewardCoins, setFormRewardCoins] = useState<number>(2);
  const [formExplanation, setFormExplanation] = useState<string>('');

  if (!isOpen) return null;

  const currentFolders = folders && folders.length > 0 ? folders : DEFAULT_QUESTION_FOLDERS;

  // Subjects list
  const subjectsList = Array.from(
    new Set([
      'all',
      'Tin học',
      'Công nghệ',
      'Toán',
      'Tiếng Việt',
      'Khoa học',
      'Tự nhiên & Xã hội',
      'Lịch sử & Địa lý',
      'Tiếng Anh',
      'Đạo đức',
      'Đố vui',
      ...DEFAULT_SUBJECTS.filter(
        (s) => !['Ghi chung / Nề nếp', 'Sinh hoạt lớp', 'Chào cờ'].includes(s)
      ),
      ...questions.map((q) => q.subject || '').filter(Boolean)
    ])
  );

  // Filter questions by search, subject, AND folder
  const filteredQuestions = questions.filter((q) => {
    // Match Folder
    let matchFolder = true;
    if (selectedFolder === 'uncategorized') {
      matchFolder = !q.folderId;
    } else if (selectedFolder !== 'all') {
      matchFolder = q.folderId === selectedFolder;
    }

    // Match Subject
    const matchSubject = selectedSubject === 'all' || q.subject === selectedSubject;

    // Match Search
    const matchSearch =
      search.trim() === '' ||
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      q.options.some((opt) => opt.toLowerCase().includes(search.toLowerCase()));

    return matchFolder && matchSubject && matchSearch;
  });

  const resetForm = () => {
    setEditingId(null);
    setIsAddingNew(false);
    setFormQuestion('');
    setFormOptions(['', '', '', '']);
    setFormCorrectIndex(0);
    setFormSubject('Toán');
    setFormFolderId(selectedFolder !== 'all' && selectedFolder !== 'uncategorized' ? selectedFolder : '');
    setFormRewardCoins(2);
    setFormExplanation('');
  };

  const handleStartEdit = (q: QuizQuestion) => {
    setEditingId(q.id);
    setIsAddingNew(true);
    setFormQuestion(q.question);
    setFormOptions([...q.options]);
    setFormCorrectIndex(q.correctIndex);
    setFormSubject(q.subject || 'Toán');
    setFormFolderId(q.folderId || '');
    setFormRewardCoins(q.rewardCoins || 2);
    setFormExplanation(q.explanation || '');
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi!');
      return;
    }

    if (formOptions.some((opt) => !opt.trim())) {
      alert('Vui lòng nhập đủ 4 phương án A, B, C, D!');
      return;
    }

    if (editingId) {
      // Edit existing
      const updated = questions.map((q) =>
        q.id === editingId
          ? {
              ...q,
              question: formQuestion.trim(),
              options: formOptions.map((o) => o.trim()),
              correctIndex: formCorrectIndex,
              subject: formSubject,
              folderId: formFolderId || undefined,
              rewardCoins: formRewardCoins,
              explanation: formExplanation.trim()
            }
          : q
      );
      onSaveQuestions(updated);
    } else {
      // Add new
      const newQ: QuizQuestion = {
        id: uid('quiz'),
        question: formQuestion.trim(),
        options: formOptions.map((o) => o.trim()),
        correctIndex: formCorrectIndex,
        subject: formSubject,
        folderId: formFolderId || undefined,
        rewardCoins: formRewardCoins,
        explanation: formExplanation.trim()
      };
      onSaveQuestions([newQ, ...questions]);
    }

    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa câu hỏi này khỏi ngân hàng?')) {
      onSaveQuestions(questions.filter((q) => q.id !== id));
      if (editingId === id) {
        resetForm();
      }
      setSelectedQuestionIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleResetToDefault = () => {
    if (
      confirm(
        'Bạn có chắc muốn khôi phục bộ câu hỏi mẫu chuẩn? Các câu hỏi hiện tại sẽ được cập nhật.'
      )
    ) {
      onSaveQuestions([...DEFAULT_QUIZ_QUESTIONS]);
      onSaveFolders([...DEFAULT_QUESTION_FOLDERS]);
      resetForm();
    }
  };

  // Folder management handlers
  const handleOpenNewFolder = () => {
    setEditingFolderId(null);
    setFolderName('');
    setFolderDesc('');
    setFolderColor('#0284c7');
    setIsFolderModalOpen(true);
  };

  const handleOpenEditFolder = (f: QuestionFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolderId(f.id);
    setFolderName(f.name);
    setFolderDesc(f.description || '');
    setFolderColor(f.color || '#0284c7');
    setIsFolderModalOpen(true);
  };

  const handleSaveFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) {
      alert('Vui lòng nhập tên thư mục!');
      return;
    }

    if (editingFolderId) {
      const updatedFolders = currentFolders.map((f) =>
        f.id === editingFolderId
          ? { ...f, name: folderName.trim(), description: folderDesc.trim(), color: folderColor }
          : f
      );
      onSaveFolders(updatedFolders);
    } else {
      const newFolder: QuestionFolder = {
        id: uid('folder'),
        name: folderName.trim(),
        description: folderDesc.trim(),
        color: folderColor,
        createdAt: new Date().toISOString()
      };
      onSaveFolders([...currentFolders, newFolder]);
    }

    setIsFolderModalOpen(false);
  };

  const handleDeleteFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      confirm(
        'Bạn có chắc muốn xóa thư mục này? Các câu hỏi thuộc thư mục sẽ chuyển sang "Chưa xếp thư mục" (không bị xóa câu hỏi).'
      )
    ) {
      // Remove folder
      const updatedFolders = currentFolders.filter((f) => f.id !== folderId);
      onSaveFolders(updatedFolders);

      // Unassign questions
      const updatedQuestions = questions.map((q) =>
        q.folderId === folderId ? { ...q, folderId: undefined } : q
      );
      onSaveQuestions(updatedQuestions);

      if (selectedFolder === folderId) {
        setSelectedFolder('all');
      }
    }
  };

  // Batch selection handlers
  const toggleSelectAll = () => {
    if (selectedQuestionIds.length === filteredQuestions.length) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(filteredQuestions.map((q) => q.id));
    }
  };

  const toggleSelectQuestion = (id: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBatchMoveToFolder = (targetFolderId: string) => {
    if (selectedQuestionIds.length === 0) return;
    const updated = questions.map((q) =>
      selectedQuestionIds.includes(q.id)
        ? { ...q, folderId: targetFolderId === 'uncategorized' ? undefined : targetFolderId }
        : q
    );
    onSaveQuestions(updated);
    setSelectedQuestionIds([]);
  };

  const handleBatchDeleteQuestions = () => {
    if (selectedQuestionIds.length === 0) return;
    if (confirm(`Bạn có chắc muốn xóa ${selectedQuestionIds.length} câu hỏi đã chọn?`)) {
      const updated = questions.filter((q) => !selectedQuestionIds.includes(q.id));
      onSaveQuestions(updated);
      setSelectedQuestionIds([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl border-2 border-teal-200 my-auto flex flex-col max-h-[94vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
                <span>Ngân Hàng Câu Hỏi Trắc Nghiệm</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-extrabold hidden sm:inline-block">
                  {questions.length} câu hỏi
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Quản lý thư mục bài tập & câu hỏi ngẫu nhiên khi quay vòng quay may mắn
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenNewFolder}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs transition-all cursor-pointer shadow-2xs"
              title="Tạo thư mục mới để gom nhóm câu hỏi"
            >
              <FolderPlus className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Thư mục mới</span>
            </button>

            {!isAddingNew && (
              <button
                onClick={() => {
                  resetForm();
                  setIsAddingNew(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md shadow-teal-700/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm câu hỏi</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 py-3.5 space-y-4 pr-1">
          {/* FOLDERS NAVIGATION BAR */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-amber-500" />
                <span>Thư mục lưu trữ câu hỏi ({currentFolders.length}):</span>
              </span>
              <button
                type="button"
                onClick={handleOpenNewFolder}
                className="text-[11px] font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo thư mục</span>
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {/* All Folder pill */}
              <button
                type="button"
                onClick={() => setSelectedFolder('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  selectedFolder === 'all'
                    ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Tất cả câu hỏi</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedFolder === 'all'
                      ? 'bg-slate-700 text-slate-100'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {questions.length}
                </span>
              </button>

              {/* Uncategorized Folder pill */}
              <button
                type="button"
                onClick={() => setSelectedFolder('uncategorized')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  selectedFolder === 'uncategorized'
                    ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Chưa xếp thư mục</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedFolder === 'uncategorized'
                      ? 'bg-teal-800 text-teal-100'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {questions.filter((q) => !q.folderId).length}
                </span>
              </button>

              {/* Custom Folders */}
              {currentFolders.map((f) => {
                const count = questions.filter((q) => q.folderId === f.id).length;
                const isSelected = selectedFolder === f.id;
                const colorHex = f.color || '#0284c7';

                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFolder(f.id)}
                    className={`group relative px-3 py-1.5 rounded-xl text-xs font-extrabold border flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? 'text-white shadow-xs border-transparent'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                    style={{
                      backgroundColor: isSelected ? colorHex : undefined
                    }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/40"
                      style={{ backgroundColor: isSelected ? '#ffffff' : colorHex }}
                    />
                    <span>{f.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isSelected ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>

                    {/* Quick folder action buttons */}
                    <div className="flex items-center gap-1 ml-1 opacity-80 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditFolder(f, e)}
                        className={`p-1 rounded-md transition-all ${
                          isSelected
                            ? 'hover:bg-white/20 text-white'
                            : 'hover:bg-slate-100 text-slate-500'
                        }`}
                        title="Chỉnh sửa tên/màu thư mục"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteFolder(f.id, e)}
                        className={`p-1 rounded-md transition-all ${
                          isSelected
                            ? 'hover:bg-rose-500/30 text-rose-100'
                            : 'hover:bg-rose-50 text-rose-500'
                        }`}
                        title="Xóa thư mục"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add / Edit Question Form */}
          {isAddingNew && (
            <form
              onSubmit={handleSaveQuestion}
              className="bg-teal-50/50 p-4 sm:p-5 rounded-3xl border-2 border-teal-200 space-y-3.5 animate-in slide-in-from-top-2 duration-200"
            >
              <div className="flex items-center justify-between pb-2 border-b border-teal-200/60">
                <h4 className="text-sm font-black text-teal-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>{editingId ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi trắc nghiệm mới'}</span>
                </h4>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Hủy bỏ
                </button>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Nội dung câu hỏi: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="Ví dụ: Số lớn nhất có hai chữ số khác nhau là số nào?"
                  className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* 4 Options & Correct Answer Radio */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-extrabold text-slate-700">
                    4 Phương án trả lời (chọn nút tròn để đánh dấu đáp án đúng): <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const items = formOptions.map((opt, idx) => ({
                        text: opt,
                        isCorrect: idx === formCorrectIndex
                      }));
                      for (let i = items.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        const temp = items[i];
                        items[i] = items[j];
                        items[j] = temp;
                      }
                      setFormOptions(items.map((it) => it.text));
                      const newCorrect = items.findIndex((it) => it.isCorrect);
                      if (newCorrect >= 0) setFormCorrectIndex(newCorrect);
                    }}
                    title="Đảo ngẫu nhiên vị trí các đáp án (không làm mất đáp án đúng)"
                    className="px-2 py-0.5 rounded-lg bg-white border border-teal-300 text-teal-700 text-[11px] font-bold hover:bg-teal-50 flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>Đảo ngẫu nhiên vị trí</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {OPTION_LETTERS.map((letter, idx) => (
                    <div
                      key={letter}
                      className={`flex items-center gap-2 p-2.5 rounded-2xl border-2 transition-all ${
                        formCorrectIndex === idx
                          ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        id={`opt_${letter}`}
                        name="correctOption"
                        checked={formCorrectIndex === idx}
                        onChange={() => setFormCorrectIndex(idx)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <label
                        htmlFor={`opt_${letter}`}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 cursor-pointer ${
                          formCorrectIndex === idx
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {letter}
                      </label>
                      <input
                        type="text"
                        required
                        value={formOptions[idx]}
                        onChange={(e) => {
                          const next = [...formOptions];
                          next[idx] = e.target.value;
                          setFormOptions(next);
                        }}
                        placeholder={`Phương án ${letter}`}
                        className="flex-1 px-2.5 py-1 text-xs bg-transparent border-b border-dashed border-slate-300 focus:border-teal-500 focus:outline-none font-medium"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata Row: Folder, Subject, Coins, Explanation */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {/* Select Folder */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Thư mục lưu trữ:
                  </label>
                  <select
                    value={formFolderId}
                    onChange={(e) => setFormFolderId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="">-- Chưa xếp thư mục --</option>
                    {currentFolders.map((f) => (
                      <option key={f.id} value={f.id}>
                        📁 {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Môn học / Chủ đề:
                  </label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="Tin học, Công nghệ, Toán..."
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-semibold mb-1"
                  />
                  <div className="flex flex-wrap gap-1">
                    {['Tin học', 'Công nghệ', 'Toán', 'Tiếng Việt', 'Đố vui'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormSubject(s)}
                        className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          formSubject === s
                            ? 'bg-teal-600 text-white'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Coins */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Hoa thưởng:
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 5].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setFormRewardCoins(amt)}
                        className={`flex-1 py-1 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                          formRewardCoins === amt
                            ? 'bg-rose-400 text-slate-900 border-rose-500 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        +{amt} 🌺
                      </button>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Giải thích đáp án:
                  </label>
                  <input
                    type="text"
                    value={formExplanation}
                    onChange={(e) => setFormExplanation(e.target.value)}
                    placeholder="Mẹo nhớ hoặc lời giải..."
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md shadow-teal-700/20 cursor-pointer"
                >
                  {editingId ? 'Cập nhật câu hỏi' : 'Lưu vào ngân hàng'}
                </button>
              </div>
            </form>
          )}

          {/* Search, Subject Filter & Batch Actions Bar */}
          <div className="space-y-2.5">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
              {/* Search input */}
              <div className="relative w-full md:w-64 shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm câu hỏi..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Subject pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 scrollbar-thin">
                <span className="text-[11px] font-bold text-slate-400 shrink-0">Môn:</span>
                {subjectsList.map((sub) => {
                  const count =
                    sub === 'all'
                      ? filteredQuestions.length
                      : questions.filter((q) => q.subject === sub).length;
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSelectedSubject(sub)}
                      className={`px-2.5 py-1 rounded-full text-xs font-extrabold whitespace-nowrap border flex items-center gap-1 transition-all cursor-pointer ${
                        selectedSubject === sub
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                      }`}
                    >
                      <span>{sub === 'all' ? 'Tất cả' : sub}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                          selectedSubject === sub
                            ? 'bg-teal-700 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BATCH ACTION BAR (When 1 or more questions selected) */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-1.5 font-extrabold text-amber-900 hover:text-amber-950 cursor-pointer"
                >
                  {selectedQuestionIds.length === filteredQuestions.length && filteredQuestions.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-amber-600" />
                  ) : (
                    <Square className="w-4 h-4 text-amber-600" />
                  )}
                  <span>
                    {selectedQuestionIds.length > 0
                      ? `Đã chọn (${selectedQuestionIds.length}/${filteredQuestions.length})`
                      : 'Chọn tất cả câu hỏi đang hiển thị'}
                  </span>
                </button>
              </div>

              {selectedQuestionIds.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-amber-900">Chuyển vào thư mục:</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleBatchMoveToFolder(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                    className="px-2.5 py-1 rounded-xl border border-amber-300 bg-white font-bold text-xs text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="" disabled>
                      -- Chọn thư mục đích --
                    </option>
                    <option value="uncategorized">-- Chưa xếp thư mục --</option>
                    {currentFolders.map((f) => (
                      <option key={f.id} value={f.id}>
                        📁 {f.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleBatchDeleteQuestions}
                    className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa đã chọn</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* QUESTIONS LIST */}
          <div className="space-y-2.5">
            {filteredQuestions.map((q, idx) => {
              const matchedFolder = currentFolders.find((f) => f.id === q.folderId);
              const isChecked = selectedQuestionIds.includes(q.id);

              return (
                <div
                  key={q.id}
                  className={`p-3.5 sm:p-4 rounded-2xl bg-white border-2 transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isChecked
                      ? 'border-amber-400 bg-amber-50/20'
                      : 'border-slate-100 hover:border-teal-200'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    {/* Checkbox for batch select */}
                    <button
                      type="button"
                      onClick={() => toggleSelectQuestion(q.id)}
                      className="mt-1 text-slate-400 hover:text-amber-600 transition-all cursor-pointer shrink-0"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-amber-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300" />
                      )}
                    </button>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-5 h-5 rounded-lg bg-teal-50 text-teal-800 font-black text-[11px] flex items-center justify-center">
                          {idx + 1}
                        </span>

                        {/* Subject Tag */}
                        {q.subject && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800">
                            {q.subject}
                          </span>
                        )}

                        {/* Folder Tag */}
                        {matchedFolder ? (
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white flex items-center gap-1"
                            style={{ backgroundColor: matchedFolder.color || '#0284c7' }}
                          >
                            <Folder className="w-2.5 h-2.5" />
                            <span>{matchedFolder.name}</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                            Chưa xếp thư mục
                          </span>
                        )}

                        {/* Reward coins tag */}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-900">
                          🌺 +{q.rewardCoins || 2} hoa
                        </span>
                      </div>

                      <p className="text-sm font-black text-slate-800 leading-snug">
                        {q.question}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs text-slate-600 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`px-2 py-1 rounded-lg border text-[11px] truncate ${
                              oIdx === q.correctIndex
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                            title={opt}
                          >
                            <b>{OPTION_LETTERS[oIdx]}.</b> {opt}
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">
                          💡 {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleStartEdit(q)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 transition-all cursor-pointer"
                      title="Chỉnh sửa câu hỏi"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 transition-all cursor-pointer"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredQuestions.length === 0 && (
              <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-40 text-teal-600" />
                <p className="text-sm font-extrabold text-slate-600">Không tìm thấy câu hỏi nào</p>
                <p className="text-xs text-slate-400 mt-1">
                  Hãy chọn thư mục/môn học khác hoặc bấm nút "Thêm câu hỏi" để tạo mới!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3.5 border-t border-slate-100 shrink-0">
          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 text-xs font-extrabold text-teal-700 hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục câu hỏi & thư mục mẫu chuẩn</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all w-full sm:w-auto cursor-pointer"
          >
            Đóng ngân hàng câu hỏi
          </button>
        </div>
      </div>

      {/* CREATE / EDIT FOLDER MODAL */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in zoom-in-95 duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border-2 border-amber-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-black text-slate-800 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-amber-500" />
                <span>{editingFolderId ? 'Chỉnh sửa thư mục' : 'Tạo thư mục câu hỏi mới'}</span>
              </h4>
              <button
                onClick={() => setIsFolderModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFolder} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Tên thư mục câu hỏi: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Ví dụ: Ôn tập Giữa kỳ 1, Kiểm tra 15 phút..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Mô tả ngắn (tùy chọn):
                </label>
                <input
                  type="text"
                  value={folderDesc}
                  onChange={(e) => setFolderDesc(e.target.value)}
                  placeholder="Ghi chú về mục đích hoặc danh sách bài học..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Màu sắc đại diện:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {FOLDER_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setFolderColor(c.hex)}
                      className={`py-1.5 px-2 rounded-xl border flex items-center gap-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                        folderColor === c.hex
                          ? 'border-slate-800 ring-2 ring-slate-800/20 font-black shadow-xs'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: c.hex }} />
                      <span className="truncate">{c.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  {editingFolderId ? 'Lưu thay đổi' : 'Tạo thư mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
