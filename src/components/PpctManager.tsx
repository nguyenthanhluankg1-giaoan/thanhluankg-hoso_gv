import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  Download,
  Upload,
  Search,
  Filter,
  Save,
  X,
  BookOpen,
  AlertTriangle,
  FileSpreadsheet,
  FileDown
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { PpctItem } from '../types';
import { defaultPpctList } from '../data/defaultData';

interface PpctManagerProps {
  ppctList: PpctItem[];
  onUpdatePpctList: (list: PpctItem[]) => void;
  onResetPpctList: () => void;
}

export const PpctManager: React.FC<PpctManagerProps> = ({
  ppctList,
  onUpdatePpctList,
  onResetPpctList
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [isAddingOrEditing, setIsAddingOrEditing] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<PpctItem | null>(null);
  const [showClearModal, setShowClearModal] = useState<boolean>(false);

  // Form state for add/edit
  const [formGrade, setFormGrade] = useState<number>(3);
  const [formSubject, setFormSubject] = useState<string>('Tin học');
  const [formWeek, setFormWeek] = useState<number>(1);
  const [formPeriodIndex, setFormPeriodIndex] = useState<number>(1);
  const [formLessonName, setFormLessonName] = useState<string>('');
  const [formIntegrationNote, setFormIntegrationNote] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');

  const grades = useMemo(() => {
    const set = new Set<string>();
    ppctList.forEach((item) => set.add(String(item.grade)));
    return Array.from(set).sort();
  }, [ppctList]);

  const subjects = useMemo(() => {
    const set = new Set<string>();
    ppctList.forEach((item) => set.add(item.subject));
    return Array.from(set).sort();
  }, [ppctList]);

  // Filtered list
  const filteredList = useMemo(() => {
    return ppctList.filter((item) => {
      const matchGrade = selectedGrade === 'all' || String(item.grade) === selectedGrade;
      const matchSubject = selectedSubject === 'all' || item.subject === selectedSubject;
      const matchKeyword =
        !searchKeyword ||
        item.lessonName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (item.integrationNote && item.integrationNote.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        (item.notes && item.notes.toLowerCase().includes(searchKeyword.toLowerCase()));
      return matchGrade && matchSubject && matchKeyword;
    }).sort((a, b) => {
      if (Number(a.grade) !== Number(b.grade)) return Number(a.grade) - Number(b.grade);
      if (a.week !== b.week) return a.week - b.week;
      return a.periodIndex - b.periodIndex;
    });
  }, [ppctList, selectedGrade, selectedSubject, searchKeyword]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormGrade(selectedGrade !== 'all' ? Number(selectedGrade) : 3);
    setFormSubject(selectedSubject !== 'all' ? selectedSubject : 'Tin học');
    setFormWeek(1);
    setFormPeriodIndex(1);
    setFormLessonName('');
    setFormIntegrationNote('');
    setFormNotes('');
    setIsAddingOrEditing(true);
  };

  const handleOpenEditModal = (item: PpctItem) => {
    setEditingItem(item);
    setFormGrade(Number(item.grade));
    setFormSubject(item.subject);
    setFormWeek(item.week);
    setFormPeriodIndex(item.periodIndex);
    setFormLessonName(item.lessonName);
    setFormIntegrationNote(item.integrationNote || '');
    setFormNotes(item.notes || '');
    setIsAddingOrEditing(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLessonName.trim()) return;

    if (editingItem) {
      // Edit existing
      const updated = ppctList.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              grade: formGrade,
              subject: formSubject,
              week: formWeek,
              periodIndex: formPeriodIndex,
              lessonName: formLessonName,
              integrationNote: formIntegrationNote,
              notes: formNotes
            }
          : item
      );
      onUpdatePpctList(updated);
    } else {
      // Add new
      const newItem: PpctItem = {
        id: `ppct-${Date.now()}`,
        grade: formGrade,
        subject: formSubject,
        week: formWeek,
        periodIndex: formPeriodIndex,
        lessonName: formLessonName,
        integrationNote: formIntegrationNote,
        notes: formNotes
      };
      onUpdatePpctList([...ppctList, newItem]);
    }

    setIsAddingOrEditing(false);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tiết phân phối chương trình này?')) {
      onUpdatePpctList(ppctList.filter((item) => item.id !== id));
    }
  };

  const handleClearAllPpct = () => {
    onUpdatePpctList([]);
    setShowClearModal(false);
  };

  const handleClearFilteredPpct = () => {
    const filteredIds = new Set(filteredList.map((item) => item.id));
    onUpdatePpctList(ppctList.filter((item) => !filteredIds.has(item.id)));
    setShowClearModal(false);
  };

  const handleDownloadSampleExcel = () => {
    const sampleRows = [
      {
        'STT': 1,
        'Khối lớp': 3,
        'Môn học': 'Tin học',
        'Tuần': 1,
        'Tiết theo PPCT': 1,
        'Tên bài dạy': 'Bài 1. Thông tin và quyết định (Tiết 1)',
        'Nội dung tích hợp / Điều chỉnh': '[1.3.CB1a] Truy cập và khai thác thông tin số',
        'Ghi chú': 'Chủ đề 1. Máy tính và em'
      },
      {
        'STT': 2,
        'Khối lớp': 3,
        'Môn học': 'Tin học',
        'Tuần': 1,
        'Tiết theo PPCT': 2,
        'Tên bài dạy': 'Bài 1. Thông tin và quyết định (Tiết 2)',
        'Nội dung tích hợp / Điều chỉnh': '[STEM] Thực hành phân loại thông tin',
        'Ghi chú': 'Luyện tập & Vận dụng'
      },
      {
        'STT': 3,
        'Khối lớp': 3,
        'Môn học': 'Tin học',
        'Tuần': 2,
        'Tiết theo PPCT': 3,
        'Tên bài dạy': 'Bài 2. Xử lí thông tin (Tiết 1)',
        'Nội dung tích hợp / Điều chỉnh': '[CĐS] An toàn và văn hóa trên môi trường số',
        'Ghi chú': 'Khám phá kiến thức'
      },
      {
        'STT': 4,
        'Khối lớp': 4,
        'Môn học': 'Tin học',
        'Tuần': 1,
        'Tiết theo PPCT': 1,
        'Tên bài dạy': 'Bài 1. Phần cứng và phần mềm máy tính',
        'Nội dung tích hợp / Điều chỉnh': '[NLS] Khai thác phần mềm học tập an toàn',
        'Ghi chú': 'Chương trình GDPT 2018'
      },
      {
        'STT': 5,
        'Khối lớp': 5,
        'Môn học': 'Tin học',
        'Tuần': 1,
        'Tiết theo PPCT': 1,
        'Tên bài dạy': 'Bài 1. Máy tính và sự phát triển của thông tin',
        'Nội dung tích hợp / Điều chỉnh': '[STEM] Tìm hiểu lịch sử máy tính',
        'Ghi chú': 'Bài học mở đầu'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 10 },
      { wch: 14 },
      { wch: 8 },
      { wch: 16 },
      { wch: 45 },
      { wch: 45 },
      { wch: 25 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mau_Phan_Phoi_Chuong_Trinh');
    XLSX.writeFile(workbook, 'Mau_Phan_Phoi_Chuong_Trinh_Excel.xlsx');
  };

  const handleExportExcel = () => {
    const data = filteredList.map((item, idx) => ({
      STT: idx + 1,
      'Khối lớp': item.grade,
      'Môn học': item.subject,
      Tuần: item.week,
      'Tiết theo PPCT': item.periodIndex,
      'Tên bài dạy': item.lessonName,
      'Nội dung tích hợp / Điều chỉnh': item.integrationNote || '',
      'Ghi chú': item.notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PPCT');
    XLSX.writeFile(workbook, `Phan_Phoi_Chuong_Trinh_${selectedGrade !== 'all' ? `Khoi_${selectedGrade}` : 'TatCa'}.xlsx`);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);

        if (rows.length === 0) {
          alert('File Excel không có dữ liệu!');
          return;
        }

        const newItems: PpctItem[] = rows.map((r, i) => ({
          id: `ppct-import-${Date.now()}-${i}`,
          grade: r['Khối lớp'] || r['Khoi'] || r['Grade'] || 3,
          subject: r['Môn học'] || r['Mon'] || r['Subject'] || 'Tin học',
          week: Number(r['Tuần'] || r['Tuan'] || r['Week'] || 1),
          periodIndex: Number(r['Tiết theo PPCT'] || r['Tiet'] || r['Period'] || i + 1),
          lessonName: r['Tên bài dạy'] || r['BaiDay'] || r['Lesson'] || `Bài học ${i + 1}`,
          integrationNote: r['Nội dung tích hợp / Điều chỉnh'] || r['TichHop'] || '',
          notes: r['Ghi chú'] || r['GhiChu'] || ''
        }));

        onUpdatePpctList([...ppctList, ...newItems]);
        alert(`Đã nhập thành công ${newItems.length} tiết PPCT từ Excel!`);
      } catch (err) {
        console.error('Import error:', err);
        alert('Lỗi đọc file Excel. Vui lòng kiểm tra lại định dạng!');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header card with filters and action buttons */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border-2 border-teal-200/80 shadow-lg shadow-teal-900/5 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-800">
                Phân Phối Chương Trình (PPCT)
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                Quản lý tiến trình bài dạy, tuần học, số tiết và nội dung tích hợp
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm tiết PPCT</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSampleExcel}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs transition-all cursor-pointer"
              title="Tải tệp Excel mẫu để nhập dữ liệu bài dạy nhanh chóng"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Tải file mẫu Excel</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Nhập Excel</span>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleImportExcel}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Excel</span>
            </button>

            <button
              type="button"
              onClick={() => setShowClearModal(true)}
              disabled={ppctList.length === 0}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                ppctList.length === 0
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs'
              }`}
              title="Xóa toàn bộ danh sách phân phối chương trình"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Xóa toàn bộ</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Khôi phục danh sách PPCT mẫu ban đầu?')) {
                  onResetPpctList();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-all cursor-pointer"
              title="Khôi phục dữ liệu mẫu chuẩn"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Khôi phục mẫu</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm bài dạy, tích hợp..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-teal-500"
            >
              <option value="all">Tất cả khối lớp</option>
              {grades.map((g) => (
                <option key={g} value={g}>
                  Khối {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-teal-500"
            >
              <option value="all">Tất cả môn học</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  Môn {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* PPCT Table */}
      <div className="bg-white rounded-3xl border-2 border-teal-200/80 shadow-lg shadow-teal-900/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-teal-50/90 text-slate-800 border-b-2 border-teal-200 font-black text-center">
                <th className="py-3 px-3 w-16">KHỐI</th>
                <th className="py-3 px-3 w-28">MÔN</th>
                <th className="py-3 px-2 w-16">TUẦN</th>
                <th className="py-3 px-2 w-16">TIẾT</th>
                <th className="py-3 px-4 text-left">TÊN BÀI DẠY</th>
                <th className="py-3 px-4 text-left">TÍCH HỢP / ĐIỀU CHỈNH</th>
                <th className="py-3 px-3 w-24 text-left">GHI CHÚ</th>
                <th className="py-3 px-3 w-20 text-center">TÁC VỤ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {ppctList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center border border-rose-100 shadow-xs">
                        <Trash2 className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        Danh sách Phân phối chương trình hiện đang trống
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Thầy/cô có thể thêm bài dạy mới, nạp danh sách từ file Excel hoặc bấm nút khôi phục lại dữ liệu mẫu chuẩn.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={handleOpenAddModal}
                          className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Thêm bài dạy</span>
                        </button>
                        <label className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Nhập Excel</span>
                          <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleImportExcel}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Khôi phục danh sách PPCT mẫu ban đầu?')) {
                              onResetPpctList();
                            }
                          }}
                          className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Khôi phục mẫu</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Không tìm thấy bài dạy nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-teal-50/40 transition-colors">
                    <td className="py-3 px-3 text-center font-bold text-teal-800">
                      Khối {item.grade}
                    </td>
                    <td className="py-3 px-3 text-center font-semibold">
                      {item.subject}
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-slate-600">
                      T{item.week}
                    </td>
                    <td className="py-3 px-2 text-center font-black text-slate-900">
                      {item.periodIndex}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.lessonName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {item.integrationNote ? (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                          {item.integrationNote}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {item.notes || '-'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1 rounded-lg text-teal-600 hover:bg-teal-100 transition-colors cursor-pointer"
                          title="Sửa bài dạy"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-100 transition-colors cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isAddingOrEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-teal-100 overflow-hidden">
            <div className="px-6 py-4 bg-teal-600 text-white flex items-center justify-between">
              <h3 className="font-black text-sm">
                {editingItem ? 'Chỉnh sửa tiết PPCT' : 'Thêm mới tiết PPCT'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingOrEditing(false)}
                className="p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Khối lớp
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={isNaN(formGrade) ? '' : formGrade}
                    onChange={(e) => setFormGrade(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Môn học
                  </label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Tuần (1 - 35)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={35}
                    value={isNaN(formWeek) ? '' : formWeek}
                    onChange={(e) => setFormWeek(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Tiết theo PPCT
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={isNaN(formPeriodIndex) ? '' : formPeriodIndex}
                    onChange={(e) => setFormPeriodIndex(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Tên bài dạy
                </label>
                <textarea
                  rows={2}
                  value={formLessonName}
                  onChange={(e) => setFormLessonName(e.target.value)}
                  placeholder="Nhập tên bài dạy..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Nội dung tích hợp / Điều chỉnh
                </label>
                <input
                  type="text"
                  value={formIntegrationNote}
                  onChange={(e) => setFormIntegrationNote(e.target.value)}
                  placeholder="STEM, chuyển đổi số, GDQP..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Ghi chú
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Chủ đề A, thực hành phòng máy..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingOrEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black bg-teal-600 hover:bg-teal-700 text-white shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu tiết dạy</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-rose-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-rose-600 to-rose-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-300" />
                <h3 className="font-black text-sm sm:text-base">
                  Xác nhận xóa phân phối chương trình
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 leading-relaxed">
                <p className="font-bold text-rose-800 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Cảnh báo hành động xóa dữ liệu</span>
                </p>
                <p>
                  Thao tác này sẽ xóa dữ liệu các tiết phân phối chương trình. Thầy/cô có thể dùng nút <strong className="text-rose-950 font-black">"Khôi phục mẫu"</strong> hoặc <strong className="text-rose-950 font-black">"Nhập Excel"</strong> bất cứ khi nào để nạp lại dữ liệu.
                </p>
              </div>

              <div className="text-xs text-slate-700 space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex justify-between font-semibold">
                  <span>Tổng số tiết hiện có:</span>
                  <span className="font-black text-slate-900">{ppctList.length} tiết</span>
                </div>
                {(selectedGrade !== 'all' || selectedSubject !== 'all' || searchKeyword) && (
                  <div className="flex justify-between font-semibold text-teal-800">
                    <span>Số tiết đang lọc hiển thị:</span>
                    <span className="font-black">{filteredList.length} tiết</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2">
                {/* Nếu đang lọc thì cho tùy chọn chỉ xóa phần đang lọc */}
                {(selectedGrade !== 'all' || selectedSubject !== 'all' || searchKeyword) && filteredList.length > 0 && filteredList.length < ppctList.length && (
                  <button
                    type="button"
                    onClick={handleClearFilteredPpct}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4 text-amber-700" />
                    <span>Chỉ xóa {filteredList.length} tiết đang lọc</span>
                  </button>
                )}

                {/* Xóa sạch toàn bộ */}
                <button
                  type="button"
                  onClick={handleClearAllPpct}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa sạch toàn bộ ({ppctList.length} tiết)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowClearModal(false)}
                  className="w-full py-2 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Hủy thao tác
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
