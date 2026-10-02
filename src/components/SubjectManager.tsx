/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { MonHoc, LopHoc } from '../types';
import RoyalLogo from './RoyalLogo';
import { 
  Award, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  BookOpen, 
  Clock, 
  DollarSign, 
  Sparkles, 
  Check, 
  X, 
  ShieldAlert, 
  Layers,
  FileText,
  Users,
  Info,
  Calendar,
  Phone,
  Mail,
  GraduationCap,
  Activity,
  Palette,
  Compass
} from 'lucide-react';

interface SubjectManagerProps {
  monHocList: MonHoc[];
  classes: LopHoc[];
  onAddMonHoc: (monHoc: MonHoc) => void;
  onUpdateMonHoc: (monHoc: MonHoc) => void;
  onDeleteMonHoc: (monHocId: string) => void;
}

export default function SubjectManager({
  monHocList,
  classes,
  onAddMonHoc,
  onUpdateMonHoc,
  onDeleteMonHoc,
}: SubjectManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [editingMonHoc, setEditingMonHoc] = useState<MonHoc | null>(null);

  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formEnglishName, setFormEnglishName] = useState('');
  const [formCategory, setFormCategory] = useState<string>('Thể thao');
  const [formDuration, setFormDuration] = useState<string>('90 phút');
  const [formClassSize, setFormClassSize] = useState<string>('7 - 15');
  const [formSessions, setFormSessions] = useState<number>(16);
  const [formFeePerSession, setFormFeePerSession] = useState<number>(200000);
  const [formFeePerCourse, setFormFeePerCourse] = useState<number>(3200000);
  const [formDesc, setFormDesc] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [deletingMonHoc, setDeletingMonHoc] = useState<MonHoc | null>(null);

  // Khóa cuộn màn hình chính (document.body.style.overflow = 'hidden') khi modal mở
  useEffect(() => {
    if (isModalOpen || isPolicyModalOpen || deletingMonHoc) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || '';
      };
    }
  }, [isModalOpen, isPolicyModalOpen, deletingMonHoc]);

  const getClassCountOfSubject = (subjectName: string) => {
    return classes.filter(
      (c) => c.tenMon.trim().toLowerCase() === subjectName.trim().toLowerCase()
    ).length;
  };

  // Group counts
  const categoryCounts = useMemo(() => {
    const counts = {
      sports: 0,
      arts: 0,
      academic: 0,
      skills: 0,
    };

    monHocList.forEach((m) => {
      const cat = m.nhomMon || '';
      if (cat.includes('Thể thao')) counts.sports++;
      else if (cat.includes('Nghệ thuật')) counts.arts++;
      else if (cat.includes('Học thuật')) counts.academic++;
      else if (cat.includes('Kỹ năng') || cat.includes('Phát triển')) counts.skills++;
    });

    return counts;
  }, [monHocList]);

  const handleOpenAdd = () => {
    const maxNum = monHocList.reduce((max, m) => {
      const num = parseInt(m.id.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const nextId = `MH${String(maxNum + 1).padStart(2, '0')}`;

    setEditingMonHoc(null);
    setFormId(nextId);
    setFormName('');
    setFormEnglishName('');
    setFormCategory('Thể thao');
    setFormDuration('90 phút');
    setFormClassSize('7 - 15');
    setFormSessions(16);
    setFormFeePerSession(200000);
    setFormFeePerCourse(3200000);
    setFormDesc('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mh: MonHoc) => {
    setEditingMonHoc(mh);
    setFormId(mh.id);
    setFormName(mh.tenMon);
    setFormEnglishName(mh.tenTiengAnh || '');
    setFormCategory(mh.nhomMon || 'Thể thao');
    setFormDuration(mh.thoiLuong || '90 phút');
    setFormClassSize(mh.siSo || '7 - 15');
    setFormSessions(mh.soBuoiHoc);
    setFormFeePerSession(mh.hocPhiTheoBuoi);
    setFormFeePerCourse(mh.hocPhiTheoKhoa);
    setFormDesc(mh.moTa || '');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleAutoCalculateCourseFee = () => {
    const calculated = formSessions * formFeePerSession;
    setFormFeePerCourse(calculated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formId.trim() || !formName.trim() || formSessions <= 0 || formFeePerSession < 0 || formFeePerCourse < 0) {
      setErrorMsg('Vui lòng điền đầy đủ và chính xác các thông tin bắt buộc của môn học!');
      return;
    }

    if (!editingMonHoc) {
      const existsId = monHocList.some(
        (m) => m.id.trim().toUpperCase() === formId.trim().toUpperCase()
      );
      if (existsId) {
        setErrorMsg(`Mã môn học "${formId}" đã tồn tại trên hệ thống! Vui lòng chọn mã khác.`);
        return;
      }
    }

    const existsName = monHocList.some(
      (m) =>
        m.tenMon.trim().toLowerCase() === formName.trim().toLowerCase() &&
        (!editingMonHoc || m.id !== editingMonHoc.id)
    );
    if (existsName) {
      setErrorMsg(`Tên môn học "${formName}" đã tồn tại! Vui lòng chọn tên khác.`);
      return;
    }

    const data: MonHoc = {
      id: formId.trim().toUpperCase(),
      tenMon: formName.trim(),
      tenTiengAnh: formEnglishName.trim() || undefined,
      nhomMon: formCategory,
      thoiLuong: formDuration.trim() || undefined,
      siSo: formClassSize.trim() || undefined,
      soBuoiHoc: Number(formSessions),
      hocPhiTheoBuoi: Number(formFeePerSession),
      hocPhiTheoKhoa: Number(formFeePerCourse),
      moTa: formDesc.trim() || undefined,
    };

    if (editingMonHoc) {
      onUpdateMonHoc(data);
    } else {
      onAddMonHoc(data);
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingMonHoc) return;
    onDeleteMonHoc(deletingMonHoc.id);
    setDeletingMonHoc(null);
  };

  const filteredMonHocList = monHocList.filter((m) => {
    const term = searchTerm.trim().toLowerCase();
    const matchTerm =
      !term ||
      m.id.toLowerCase().includes(term) ||
      m.tenMon.toLowerCase().includes(term) ||
      (m.tenTiengAnh || '').toLowerCase().includes(term) ||
      (m.moTa || '').toLowerCase().includes(term);

    if (!matchTerm) return false;

    if (selectedCategory === 'all') return true;
    const cat = m.nhomMon || '';
    if (selectedCategory === 'sports') return cat.includes('Thể thao');
    if (selectedCategory === 'arts') return cat.includes('Nghệ thuật');
    if (selectedCategory === 'academic') return cat.includes('Học thuật');
    if (selectedCategory === 'skills') return cat.includes('Kỹ năng') || cat.includes('Phát triển');

    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="subject-manager-section">
      {/* 1. Header Banner */}
      <div className="glass-panel p-6 rounded-2xl shadow-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <RoyalLogo className="w-10 h-10 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  NIÊN KHÓA 2026 - 2027
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  CƠ SỞ PHÚ MỸ HƯNG
                </span>
              </div>
              <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight mt-1">
                Danh Mục Môn Học &amp; Biểu Phí Ngoại Khóa
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Cập nhật chuẩn xác theo Thông Báo của Nhà trường: 4 nhóm môn, thời lượng, sĩ số và định mức học phí
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsPolicyModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm"
          >
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Quy Định &amp; Biểu Phí Chuẩn</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition active:scale-95 shadow-[0_0_15px_rgba(56,189,248,0.25)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>THÊM MÔN HỌC MỚI</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tổng môn ngoại khóa</span>
            <BookOpen className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">{monHocList.length}</div>
          <div className="text-[11px] text-emerald-400 font-medium">Đầy đủ 4 nhóm môn đào tạo</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Môn Thể thao</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-display text-amber-400">{categoryCounts.sports}</div>
          <div className="text-[11px] text-slate-400">Bóng rổ, Pickleball, Bơi, Võ, Cờ vua...</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Nghệ thuật &amp; Sáng tạo</span>
            <Palette className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-display text-purple-400">{categoryCounts.arts}</div>
          <div className="text-[11px] text-slate-400">Vẽ sáng tạo, Manga, Gouache, Piano...</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Học thuật &amp; Kỹ năng</span>
            <Compass className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-display text-emerald-400">
            {categoryCounts.academic + categoryCounts.skills}
          </div>
          <div className="text-[11px] text-slate-400">Robotics, Luyện chữ, Quản lý cảm xúc</div>
        </div>
      </div>

      {/* 3. Filter Tabs & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Tất cả ({monHocList.length})
            </button>
            <button
              onClick={() => setSelectedCategory('sports')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                selectedCategory === 'sports'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              I. Thể thao ({categoryCounts.sports})
            </button>
            <button
              onClick={() => setSelectedCategory('arts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                selectedCategory === 'arts'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              II. Nghệ thuật ({categoryCounts.arts})
            </button>
            <button
              onClick={() => setSelectedCategory('academic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                selectedCategory === 'academic'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              III. Học thuật ({categoryCounts.academic})
            </button>
            <button
              onClick={() => setSelectedCategory('skills')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                selectedCategory === 'skills'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              IV. Phát triển kỹ năng ({categoryCounts.skills})
            </button>
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm môn học, tiếng Anh, mã môn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass-input rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      {/* 4. Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMonHocList.length === 0 ? (
          <div className="col-span-full glass-panel p-12 text-center rounded-2xl text-slate-400 text-sm">
            Không tìm thấy môn học nào phù hợp với từ khóa "{searchTerm}".
          </div>
        ) : (
          filteredMonHocList.map((mh) => {
            const classCount = getClassCountOfSubject(mh.tenMon);
            const isSports = (mh.nhomMon || '').includes('Thể thao');
            const isArts = (mh.nhomMon || '').includes('Nghệ thuật');
            const isAcademic = (mh.nhomMon || '').includes('Học thuật');

            let badgeColor = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
            if (isSports) badgeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
            else if (isArts) badgeColor = 'bg-purple-500/15 text-purple-300 border-purple-500/30';
            else if (isAcademic) badgeColor = 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';

            return (
              <div
                key={mh.id}
                className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-sky-500/30 transition-all duration-200 space-y-4 relative group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30">
                            {mh.id}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                            {mh.nhomMon || 'Ngoại khóa'}
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-sm mt-1 leading-snug">
                          {mh.tenMon}
                        </h3>
                        {mh.tenTiengAnh && (
                          <p className="text-[11px] text-slate-400 font-mono italic">
                            {mh.tenTiengAnh}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(mh)}
                        title="Chỉnh sửa môn học"
                        className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-white/5 rounded-lg transition cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingMonHoc(mh)}
                        title="Xóa môn học"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Class size and Duration Badges */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-300">
                    <span className="bg-slate-800/80 px-2 py-0.5 rounded-md border border-white/5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-400" /> {mh.thoiLuong || '90 phút'}
                    </span>
                    <span className="bg-slate-800/80 px-2 py-0.5 rounded-md border border-white/5 flex items-center gap-1">
                      <Users className="w-3 h-3 text-amber-400" /> Sĩ số: {mh.siSo || '7 - 15'}
                    </span>
                  </div>

                  {/* Fee Matrix Box */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-3 rounded-xl border border-white/5 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-sky-400" /> Khóa tiêu chuẩn:
                      </span>
                      <strong className="text-white font-mono text-sm block mt-0.5">
                        {mh.soBuoiHoc} buổi
                      </strong>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-indigo-400" /> Lớp đang mở:
                      </span>
                      <strong className="text-indigo-400 font-mono text-sm block mt-0.5">
                        {classCount} lớp
                      </strong>
                    </div>

                    <div className="pt-2 border-t border-white/5">
                      <span className="text-[10px] text-slate-400 block">Học phí / Buổi:</span>
                      <strong className="text-emerald-400 font-mono text-xs block font-bold">
                        {mh.hocPhiTheoBuoi.toLocaleString('vi-VN')} đ
                      </strong>
                    </div>

                    <div className="pt-2 border-t border-white/5">
                      <span className="text-[10px] text-slate-400 block">Học phí / Khóa:</span>
                      <strong className="text-amber-400 font-mono text-xs block font-bold">
                        {mh.hocPhiTheoKhoa.toLocaleString('vi-VN')} đ
                      </strong>
                    </div>
                  </div>

                  {mh.moTa && (
                    <p className="text-[11px] text-slate-400 leading-relaxed italic line-clamp-2">
                      "{mh.moTa}"
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Trường Song ngữ Quốc tế Royal</span>
                  <span className="font-mono">Chuẩn Cambridge</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. MODAL: XEM QUY ĐỊNH & THÔNG BÁO BIỂU PHÍ (Từ file đính kèm của trường) */}
      {isPolicyModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPolicyModalOpen(false);
          }}
        >
          <div 
            className="glass-panel max-w-3xl w-full p-6 sm:p-7 rounded-3xl shadow-2xl border border-white/15 text-slate-200 space-y-6 max-h-[90vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <RoyalLogo className="w-12 h-12 shrink-0" />
                <div>
                  <h3 className="font-display font-bold text-lg text-white">
                    QUY ĐỊNH LỚP HỌC NGOẠI KHÓA ROYAL SCHOOL
                  </h3>
                  <p className="text-xs text-slate-400">
                    Năm học 2026 - 2027 • Cơ sở Phú Mỹ Hưng (Phu My Hung Campus)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPolicyModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed">
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-white/10 space-y-2">
                <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Thời Gian Học Ngoại Khóa (Extracurricular Class Schedule)
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                  <li><strong>Từ thứ 2 đến thứ 5:</strong> Lớp học bắt đầu từ <strong>17:00</strong></li>
                  <li><strong>Thứ 7 - Chủ nhật:</strong> Buổi sáng bắt đầu từ <strong>08:00</strong>; Buổi chiều bắt đầu từ <strong>15:30</strong></li>
                </ul>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-2xl border border-white/10 space-y-2">
                <h4 className="font-bold text-sky-300 text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> 5.1. Quy định về Hoàn phí và Bảo lưu (Refund &amp; Course Reservation)
                </h4>
                <p className="text-slate-300">
                  - Học phí đã nộp <strong>không được hoàn trả</strong> đối với trường hợp Nhà trường đã mở lớp nhưng học sinh không tiếp tục tham gia.
                </p>
                <p className="text-slate-300">
                  - <strong>Bảo lưu khóa học:</strong> Phụ huynh gửi email/Đơn đề nghị bảo lưu ít nhất <strong>07 ngày làm việc</strong> trước ngày học sinh bắt đầu nghỉ.
                </p>
                <p className="text-slate-300">
                  - Mỗi học sinh được bảo lưu <strong>01 lần/khóa (16 buổi)</strong>, áp dụng cho trường hợp nghỉ từ <strong>03 buổi trở lên</strong>. Thời gian bảo lưu tối đa <strong>01 năm</strong> kể từ ngày phê duyệt.
                </p>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-2xl border border-white/10 space-y-2">
                <h4 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" /> 5.2 &amp; 5.3. Chuyển đổi môn học &amp; Điểm danh học bù
                </h4>
                <p className="text-slate-300">
                  - <strong>Chuyển đổi môn:</strong> Học sinh được phép chuyển đổi môn học trong thời gian tham gia. Nếu môn học mới có học phí cao hơn, Phụ huynh thanh toán phần học phí chênh lệch theo quy định.
                </p>
                <p className="text-slate-300">
                  - <strong>Điểm danh:</strong> Phụ huynh ký tên vào sổ điểm danh mỗi buổi học để xác nhận học sinh tham gia lớp.
                </p>
                <p className="text-slate-300">
                  - <strong>Học bù:</strong> Học sinh <strong>không được học bù</strong> đối với các buổi nghỉ cá nhân. Trường hợp Nhà trường cho nghỉ học, Nhà trường sẽ tổ chức học bù đủ số buổi đã nghỉ.
                </p>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-2xl border border-white/10 space-y-2">
                <h4 className="font-bold text-purple-300 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> 5.4. Quy định về Học Thử Miễn Phí (Trial Class Policy)
                </h4>
                <p className="text-slate-300">
                  - Học sinh được <strong>học thử miễn phí 01 buổi đầu tiên</strong> để trải nghiệm lớp học.
                </p>
                <p className="text-slate-300">
                  - Nếu đăng ký chính thức sau buổi học thử, buổi học thử được tính vào tổng số buổi của khóa học. Nếu không đăng ký chính thức, buổi học thử vẫn được miễn phí.
                </p>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-bold text-amber-300">Trung tâm Quản lý Học vụ - Dịch vụ Royal School:</p>
                  <div className="flex items-center gap-4 text-slate-300 text-[11px] font-mono">
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-amber-400" /> (028) 7107 7676 - 076 5420 355</span>
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-sky-400" /> skillscenter@royal.edu.vn</span>
                  </div>
                </div>
                <div className="text-right sm:border-l sm:border-white/10 sm:pl-4">
                  <p className="text-[10px] text-slate-400">Hiệu trưởng phê duyệt:</p>
                  <p className="font-bold text-white text-xs">ED.D. MAI ĐỨC THẮNG</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setIsPolicyModalOpen(false)}
                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Đã hiểu quy định
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: THÊM / CHỈNH SỬA MÔN HỌC */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div 
            className="glass-panel max-w-lg w-full rounded-2xl shadow-2xl border border-white/15 overflow-hidden flex flex-col my-auto max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900/80 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-white text-sm">
                  {editingMonHoc ? `CẬP NHẬT MÔN HỌC (${editingMonHoc.id})` : 'THÊM MÔN HỌC NGOẠI KHÓA'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs scrollbar-thin">
              {errorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl flex items-center gap-2 text-xs">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide">
                    Mã môn học <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: MH01, MH02..."
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    disabled={!!editingMonHoc}
                    className="w-full glass-input rounded-xl px-3 py-2 text-white text-xs font-mono font-bold uppercase placeholder-slate-500 disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide">
                    Nhóm môn <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-white text-xs font-medium bg-slate-900"
                  >
                    <option value="Thể thao">I. Thể thao (Sports)</option>
                    <option value="Nghệ thuật">II. Nghệ thuật (Arts)</option>
                    <option value="Học thuật">III. Học thuật (Academic)</option>
                    <option value="Phát triển kỹ năng">IV. Phát triển kỹ năng (Skills)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-400 uppercase tracking-wide">
                  Tên môn học tiếng Việt <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bóng rổ (Basketball)..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-white text-xs font-bold placeholder-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-400 uppercase tracking-wide">
                  Tên tiếng Anh (English Name)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Basketball, Manga Creation, Advanced Chess..."
                  value={formEnglishName}
                  onChange={(e) => setFormEnglishName(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide">
                    Thời lượng / buổi
                  </label>
                  <select
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-white text-xs bg-slate-900"
                  >
                    <option value="90 phút">90 phút</option>
                    <option value="60 phút">60 phút</option>
                    <option value="45 phút">45 phút</option>
                    <option value="120 phút">120 phút</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide">
                    Sĩ số khuyến nghị
                  </label>
                  <input
                    type="text"
                    placeholder="7 - 15, 10 - 15, 5 - 15, Tư vấn 1:1"
                    value={formClassSize}
                    onChange={(e) => setFormClassSize(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-400 uppercase tracking-wide">
                  Số buổi học định mức <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={60}
                  placeholder="16"
                  value={formSessions}
                  onChange={(e) => setFormSessions(Number(e.target.value))}
                  className="w-full glass-input rounded-xl px-3 py-2 text-white text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide">
                    Học phí / buổi (VNĐ) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={5000}
                    placeholder="250000"
                    value={formFeePerSession}
                    onChange={(e) => setFormFeePerSession(Number(e.target.value))}
                    className="w-full glass-input rounded-xl px-3 py-2 text-white text-xs font-mono"
                  />
                  <span className="text-[10px] text-emerald-400 font-mono block">
                    {formFeePerSession.toLocaleString('vi-VN')} đ / buổi
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">
                      Học phí / khóa (VNĐ) <span className="text-rose-400">*</span>
                    </label>
                  </div>
                  <input
                    type="number"
                    required
                    min={0}
                    step={10000}
                    placeholder="4000000"
                    value={formFeePerCourse}
                    onChange={(e) => setFormFeePerCourse(Number(e.target.value))}
                    className="w-full glass-input rounded-xl px-3 py-2 text-white text-xs font-mono"
                  />
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-amber-400 font-mono font-bold">
                      {formFeePerCourse.toLocaleString('vi-VN')} đ
                    </span>
                    <button
                      type="button"
                      onClick={handleAutoCalculateCourseFee}
                      className="text-sky-400 hover:text-sky-300 font-medium cursor-pointer underline text-[10px]"
                    >
                      ⚡ Tính tự động
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-400 uppercase tracking-wide">
                  Mô tả môn học &amp; mục tiêu phát triển
                </label>
                <textarea
                  rows={2}
                  placeholder="Mô tả kỹ năng, lợi ích phát triển thể chất của môn học..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition cursor-pointer text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl font-bold transition shadow-lg shadow-sky-500/20 cursor-pointer text-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {editingMonHoc ? 'Cập Nhật Môn Học' : 'Thêm Môn Học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: XÓA MÔN HỌC */}
      {deletingMonHoc && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeletingMonHoc(null);
          }}
        >
          <div 
            className="glass-panel max-w-sm w-full p-6 rounded-2xl shadow-2xl border border-rose-500/30 text-center space-y-4 my-auto max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Xác nhận xóa môn học</h3>
              <p className="text-xs text-slate-300 mt-1">
                Bạn có chắc chắn muốn xóa môn học <strong className="text-white">"{deletingMonHoc.tenMon}"</strong> ({deletingMonHoc.id}) khỏi hệ thống?
              </p>
              {getClassCountOfSubject(deletingMonHoc.tenMon) > 0 && (
                <div className="mt-2 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl text-left flex items-start gap-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Lưu ý: Đang có <strong>{getClassCountOfSubject(deletingMonHoc.tenMon)} lớp học</strong> thuộc môn này.
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setDeletingMonHoc(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
