/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  ClassTransferRecord, 
  HocVien, 
  LopHoc, 
  DanhSachLop, 
  DiemDanh, 
  MonHoc,
  TuitionInvoice,
  formatToVNDate 
} from '../types';
import ClassTransferModal from './ClassTransferModal';
import { 
  ArrowRightLeft, 
  GraduationCap, 
  Repeat, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Users, 
  TrendingUp,
  Receipt,
  UserCheck,
  Sparkles,
  Layers,
  ArrowRight,
  AlertTriangle,
  Check,
  X,
  BookOpen,
  Building2,
  Tag
} from 'lucide-react';

interface ClassTransferManagerProps {
  transfers: ClassTransferRecord[];
  students: HocVien[];
  classes: LopHoc[];
  danhSachLop: DanhSachLop[];
  diemDanhList: DiemDanh[];
  monHocList: MonHoc[];
  onConfirmTransfer: (record: ClassTransferRecord) => void;
  onBulkTransfer?: (params: {
    fromClassId: string;
    toClassId: string;
    studentIds: string[];
    transferDate: string;
    reason: string;
  }) => Promise<void> | void;
}

export default function ClassTransferManager({
  transfers,
  students,
  classes,
  danhSachLop,
  diemDanhList,
  monHocList,
  onConfirmTransfer,
  onBulkTransfer,
}: ClassTransferManagerProps) {
  // Navigation tabs between Individual Transfer History and Bulk Progression
  const [activeSubTab, setActiveSubTab] = useState<'audit_log' | 'bulk_progression'>('audit_log');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'course_progression' | 'subject_or_shift_change' | 'bulk'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentForTransfer, setSelectedStudentForTransfer] = useState<HocVien | null>(null);

  // State for Bulk Course Progression Mode
  const [bulkFromClassId, setBulkFromClassId] = useState<string>('');
  const [bulkToClassId, setBulkToClassId] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [bulkTransferDate, setBulkTransferDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bulkReason, setBulkReason] = useState<string>('Hoàn thành khóa học và thăng hạng lên cấp độ tiếp theo');
  const [bulkSuccessMessage, setBulkSuccessMessage] = useState<string | null>(null);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

  // Details for Bulk Transfer
  const bulkFromClass = useMemo(() => {
    return classes.find(c => c.id === bulkFromClassId) || null;
  }, [classes, bulkFromClassId]);

  const bulkToClass = useMemo(() => {
    return classes.find(c => c.id === bulkToClassId) || null;
  }, [classes, bulkToClassId]);

  // Students in bulk from-class
  const studentsInFromClass = useMemo(() => {
    if (!bulkFromClassId) return [];
    const enrollmentsInClass = danhSachLop.filter(e => e.idLop === bulkFromClassId && e.status !== 'transferred_out');
    const studentIdSet = new Set(enrollmentsInClass.map(e => e.idHocVien));
    return students.filter(s => studentIdSet.has(s.id));
  }, [bulkFromClassId, danhSachLop, students]);

  // Update selectedStudentIds whenever bulkFromClassId changes
  const handleSelectFromClass = (classId: string) => {
    setBulkFromClassId(classId);
    const enrollmentsInClass = danhSachLop.filter(e => e.idLop === classId && e.status !== 'transferred_out');
    setSelectedStudentIds(enrollmentsInClass.map(e => e.idHocVien));
  };

  // Available slots in bulk to-class
  const toClassCurrentCount = useMemo(() => {
    if (!bulkToClassId) return 0;
    return danhSachLop.filter(e => e.idLop === bulkToClassId && e.status !== 'transferred_out').length;
  }, [bulkToClassId, danhSachLop]);

  const toClassAvailableSlots = useMemo(() => {
    if (!bulkToClass) return 0;
    return Math.max(0, (bulkToClass.siSoToiDa || 15) - toClassCurrentCount);
  }, [bulkToClass, toClassCurrentCount]);

  const isBulkExceedingCapacity = selectedStudentIds.length > toClassAvailableSlots;

  // Filtered transfers list
  const filteredTransfers = useMemo(() => {
    return transfers.filter(t => {
      const matchSearch = 
        t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.fromClassName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.toClassName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.batchId && t.batchId.toLowerCase().includes(searchTerm.toLowerCase()));
      
      let matchType = true;
      if (filterType === 'course_progression') matchType = t.transferType === 'course_progression' && t.transferMode !== 'bulk';
      else if (filterType === 'subject_or_shift_change') matchType = t.transferType === 'subject_or_shift_change';
      else if (filterType === 'bulk') matchType = t.transferMode === 'bulk' || Boolean(t.batchId);

      return matchSearch && matchType;
    });
  }, [transfers, searchTerm, filterType]);

  // Summary statistics
  const stats = useMemo(() => {
    let totalMustPay = 0;
    let totalRetained = 0;
    let progressionCount = 0;
    let shiftChangeCount = 0;
    let bulkCount = 0;

    transfers.forEach(t => {
      if (t.transferMode === 'bulk' || t.batchId) bulkCount++;
      else if (t.transferType === 'course_progression') progressionCount++;
      else if (t.transferType === 'subject_or_shift_change') shiftChangeCount++;

      if (t.feeDifference > 0) {
        totalMustPay += t.feeDifference;
      } else if (t.feeDifference < 0) {
        totalRetained += Math.abs(t.feeDifference);
      }
    });

    return {
      total: transfers.length,
      progressionCount,
      shiftChangeCount,
      bulkCount,
      totalMustPay,
      totalRetained,
    };
  }, [transfers]);

  const handleOpenNewTransfer = (student?: HocVien) => {
    setSelectedStudentForTransfer(student || students[0] || null);
    setIsModalOpen(true);
  };

  const handleToggleSelectAllStudents = () => {
    if (selectedStudentIds.length === studentsInFromClass.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(studentsInFromClass.map(s => s.id));
    }
  };

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSubmitBulkTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bulkFromClassId || !bulkToClassId) {
      alert('⚠️ Vui lòng chọn cả lớp nguồn và lớp đích!');
      return;
    }

    if (bulkFromClassId === bulkToClassId) {
      alert('⚠️ Lớp đích phải khác lớp nguồn!');
      return;
    }

    if (selectedStudentIds.length === 0) {
      alert('⚠️ Vui lòng chọn ít nhất 1 học sinh để chuyển lớp!');
      return;
    }

    if (isBulkExceedingCapacity) {
      alert(`❌ Lớp mục tiêu chỉ còn ${toClassAvailableSlots} chỗ trống, nhưng bạn đã chọn ${selectedStudentIds.length} học sinh. Vui lòng giảm bớt số lượng hoặc chọn lớp khác!`);
      return;
    }

    setIsBulkSubmitting(true);
    try {
      if (onBulkTransfer) {
        await onBulkTransfer({
          fromClassId: bulkFromClassId,
          toClassId: bulkToClassId,
          studentIds: selectedStudentIds,
          transferDate: bulkTransferDate,
          reason: bulkReason,
        });
      }

      setBulkSuccessMessage(`🎉 Chuyển lớp hàng loạt thành công cho ${selectedStudentIds.length} học sinh sang lớp "${bulkToClass?.tenLop || bulkToClass?.tenMon}"!`);
      setSelectedStudentIds([]);
      setBulkFromClassId('');
      setBulkToClassId('');
      setActiveSubTab('audit_log');
      setTimeout(() => setBulkSuccessMessage(null), 6000);
    } catch (error: any) {
      alert(`❌ Lỗi khi thực hiện chuyển lớp hàng loạt: ${error.message}`);
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Toast Notification */}
      {bulkSuccessMessage && (
        <div className="bg-emerald-600/90 border border-emerald-400/30 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-200" />
            <span className="text-xs font-bold">{bulkSuccessMessage}</span>
          </div>
          <button onClick={() => setBulkSuccessMessage(null)} className="hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
              MODULE CHUYỂN LỚP &amp; NÂNG CẤP ĐỘ
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-display font-extrabold text-white uppercase tracking-tight flex items-center gap-2.5 mt-1">
            <ArrowRightLeft className="w-5 h-5 text-amber-400" />
            <span>Xử Lý Chuyển Lớp &amp; Quyết Toán Bù Trừ Học Phí</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Hỗ trợ 2 phương thức: <strong>Chuyển lớp bù trừ từng học sinh</strong> &amp; <strong>Chuyển lớp hết khóa / Lên cấp độ mới (Hàng loạt / Cá nhân)</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => handleOpenNewTransfer()}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Chuyển Lớp Bù Trừ (1 Học Sinh)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('bulk_progression')}
            className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
          >
            <GraduationCap className="w-4 h-4" />
            <span>🚀 Chuyển Hết Khóa / Hàng Loạt</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-slate-900/70 border border-white/10 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Tổng Lượt Chuyển</span>
            <Repeat className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-display font-extrabold text-white mt-1">
            {stats.total}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {stats.shiftChangeCount} đổi ca • {stats.progressionCount} đơn • {stats.bulkCount} theo đợt
          </div>
        </div>

        <div className="bg-slate-900/70 border border-white/10 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Chuyển Theo Đợt (Bulk)</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-display font-extrabold text-indigo-400 mt-1">
            {stats.bulkCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Đợt chuyển khóa / cấp độ
          </div>
        </div>

        <div className="bg-slate-900/70 border border-white/10 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Lên Cấp Độ Mới</span>
            <GraduationCap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-display font-extrabold text-emerald-400 mt-1">
            {stats.progressionCount}
          </div>
          <div className="text-[10px] text-emerald-300 mt-1">
            Tự động sinh hóa đơn mới
          </div>
        </div>

        <div className="bg-slate-900/70 border border-white/10 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Thu Bổ Sung (Surcharge)</span>
            <TrendingUp className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-lg sm:text-xl font-display font-extrabold text-rose-400 font-mono mt-1">
            +{stats.totalMustPay.toLocaleString('vi-VN')} đ
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Chênh lệch dương cần thu
          </div>
        </div>

        <div className="bg-slate-900/70 border border-white/10 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Bảo Lưu Vào Ví</span>
            <Receipt className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-display font-extrabold text-amber-400 font-mono mt-1">
            {stats.totalRetained.toLocaleString('vi-VN')} đ
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Số dư chuyển kỳ tiếp theo
          </div>
        </div>
      </div>

      {/* Main Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveSubTab('audit_log')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'audit_log'
              ? 'bg-sky-500 text-slate-950 font-extrabold shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>1. Lịch Sử &amp; Nhật Ký Chuyển Lớp ({transfers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bulk_progression')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'bulk_progression'
              ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
              : 'text-amber-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>2. Chuyển Lớp Hết Khóa Hàng Loạt (Bulk Course Progression)</span>
          <span className="text-[9px] bg-slate-900 px-1.5 py-0.2 rounded font-mono font-bold">Mới</span>
        </button>
      </div>

      {/* TAB 1: AUDIT LOG & SEARCH */}
      {activeSubTab === 'audit_log' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên học sinh, mã số, lớp cũ, lớp mới, batch ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-sky-500 text-slate-950 font-extrabold shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Tất cả ({transfers.length})
              </button>
              <button
                onClick={() => setFilterType('subject_or_shift_change')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  filterType === 'subject_or_shift_change'
                    ? 'bg-sky-500 text-slate-950 font-extrabold shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" />
                Đổi môn/Đổi ca ({stats.shiftChangeCount})
              </button>
              <button
                onClick={() => setFilterType('course_progression')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  filterType === 'course_progression'
                    ? 'bg-sky-500 text-slate-950 font-extrabold shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Lên khóa mới ({stats.progressionCount})
              </button>
              <button
                onClick={() => setFilterType('bulk')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  filterType === 'bulk'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Chuyển hàng loạt ({stats.bulkCount})
              </button>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-950 border-b border-white/10 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Mã Phiếu &amp; Batch</th>
                    <th className="py-3 px-4">Học Viên</th>
                    <th className="py-3 px-4">Phương Thức</th>
                    <th className="py-3 px-4">Lớp Cũ &rarr; Lớp Mới</th>
                    <th className="py-3 px-4 text-center">Buổi Cũ / Mới</th>
                    <th className="py-3 px-4 text-right">Quyết Toán Bù Trừ</th>
                    <th className="py-3 px-4 text-center">Trạng Thái</th>
                    <th className="py-3 px-4">Ghi Chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredTransfers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        Chưa có nhật ký chuyển lớp nào phù hợp với bộ lọc tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredTransfers.map((rec) => (
                      <tr key={rec.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-3.5 px-4 font-mono">
                          <div className="font-bold text-sky-400">{rec.id}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {rec.transferDate}
                          </div>
                          {rec.batchId && (
                            <span className="inline-block mt-1 text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded border border-purple-500/30">
                              {rec.batchId}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{rec.studentName}</div>
                          <div className="text-[11px] font-mono text-slate-400">{rec.studentId}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          {rec.transferMode === 'bulk' || rec.batchId ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              <Users className="w-3 h-3 text-amber-400" /> Chuyển đợt Bulk
                            </span>
                          ) : rec.transferType === 'course_progression' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              <GraduationCap className="w-3 h-3 text-emerald-400" /> Lên Khóa Mới
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                              <Repeat className="w-3 h-3 text-sky-400" /> Đổi môn / Đổi ca
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-300 line-through text-[11px] opacity-75">{rec.fromClassName}</div>
                          <div className="font-medium text-emerald-400 flex items-center gap-1 mt-0.5">
                            <ArrowRight className="w-3 h-3 text-slate-500" />
                            {rec.toClassName}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono">
                          <div className="text-slate-400">{rec.attendedSessionsOldClass} đã học</div>
                          <div className="text-white font-bold">&rarr; {rec.newClassRemainingSessions} buổi mới</div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono">
                          {rec.feeDifference > 0 ? (
                            <div className="font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 inline-block">
                              +{rec.feeDifference.toLocaleString('vi-VN')} đ
                            </div>
                          ) : rec.feeDifference < 0 ? (
                            <div className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 inline-block">
                              Bảo lưu {Math.abs(rec.feeDifference).toLocaleString('vi-VN')} đ
                            </div>
                          ) : (
                            <div className="text-slate-400">Tất toán (0 đ)</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {rec.differenceStatus === 'student_must_pay' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              Cần Thu Thêm
                            </span>
                          ) : rec.differenceStatus === 'retained_credit' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Đã Lưu Ví
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Đã Tất Toán
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-[11px] max-w-xs truncate">
                          {rec.reason || 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BULK COURSE PROGRESSION */}
      {activeSubTab === 'bulk_progression' && (
        <form onSubmit={handleSubmitBulkTransfer} className="space-y-6">
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-400" />
                  <span>Quy Trình Chuyển Lớp Hàng Loạt Hết Khóa / Lên Cấp Độ Mới</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tự động chuyển toàn bộ hoặc nhóm học sinh đạt chuẩn sang lớp cấp độ tiếp theo, kiểm tra sĩ số lớp đích, sinh hóa đơn và cập nhật trạng thái lớp cũ.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 self-start sm:self-auto">
                BATCH TRANSFER ENGINE
              </span>
            </div>

            {/* Selection Grid: From Class and To Class */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Step 1: Select From Class */}
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-white/5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  <span>1. Chọn Lớp Nguồn (Hết khóa / Đã hoàn thành)</span>
                  <span className="text-rose-400">*</span>
                </label>
                <select
                  value={bulkFromClassId}
                  onChange={(e) => handleSelectFromClass(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  required
                >
                  <option value="">-- Chọn lớp học nguồn --</option>
                  {classes.map(c => {
                    const enrolled = danhSachLop.filter(e => e.idLop === c.id && e.status !== 'transferred_out').length;
                    return (
                      <option key={c.id} value={c.id}>
                        {c.tenLop || c.tenMon} ({c.coSo || 'Cơ sở chính'}) - {enrolled} học sinh đang học
                      </option>
                    );
                  })}
                </select>

                {bulkFromClass && (
                  <div className="mt-3 p-3 bg-slate-900 rounded-xl border border-white/5 space-y-1 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Giáo viên phụ trách:</span>
                      <span className="font-bold text-white">{bulkFromClass.teacherName || 'Chưa phân công'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lịch học:</span>
                      <span>{bulkFromClass.lichHocCoDinh}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sĩ số hiện tại:</span>
                      <span className="font-mono font-bold text-sky-400">{studentsInFromClass.length} học sinh</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Select To Class */}
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-white/5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block flex items-center gap-1.5">
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                  <span>2. Chọn Lớp Mục Tiêu (Cấp độ tiếp theo)</span>
                  <span className="text-rose-400">*</span>
                </label>
                <select
                  value={bulkToClassId}
                  onChange={(e) => setBulkToClassId(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                >
                  <option value="">-- Chọn lớp học mục tiêu --</option>
                  {classes.filter(c => c.id !== bulkFromClassId).map(c => {
                    const enrolled = danhSachLop.filter(e => e.idLop === c.id && e.status !== 'transferred_out').length;
                    const maxCap = c.siSoToiDa || 15;
                    const left = Math.max(0, maxCap - enrolled);
                    return (
                      <option key={c.id} value={c.id}>
                        {c.tenLop || c.tenMon} ({c.coSo || 'Cơ sở chính'}) - {left > 0 ? `Còn ${left} chỗ` : 'ĐÃ ĐẦY'}
                      </option>
                    );
                  })}
                </select>

                {bulkToClass && (
                  <div className="mt-3 p-3 bg-slate-900 rounded-xl border border-white/5 space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sĩ số lớp đích:</span>
                      <span className="font-mono font-bold">
                        {toClassCurrentCount} / {bulkToClass.siSoToiDa} HS
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Chỗ trống còn lại:</span>
                      <span className={`font-mono font-extrabold ${toClassAvailableSlots > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {toClassAvailableSlots} chỗ trống
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Học phí trọn khóa mới:</span>
                      <span className="font-mono text-purple-300 font-bold">
                        {bulkToClass.hocPhiTronKhoa ? bulkToClass.hocPhiTronKhoa.toLocaleString('vi-VN') : 'Theo khóa'} đ
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Capacity Warning Banner */}
            {bulkToClass && (
              <div>
                {isBulkExceedingCapacity ? (
                  <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-rose-300">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-white text-sm">❌ CẢNH BÁO VƯỢT QUÁ SĨ SỐ LỚP MỤC TIÊU!</p>
                      <p>
                        Lớp mục tiêu <strong>"{bulkToClass.tenLop || bulkToClass.tenMon}"</strong> chỉ còn <strong>{toClassAvailableSlots} chỗ trống</strong>, 
                        nhưng bạn đã chọn <strong>{selectedStudentIds.length} học sinh</strong>.
                      </p>
                      <p className="text-rose-200">
                        Vui lòng bỏ chọn bớt {selectedStudentIds.length - toClassAvailableSlots} học sinh hoặc chọn lớp đích có sức chứa lớn hơn để tiếp tục.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between text-xs text-emerald-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Sức chứa hợp lệ: Lớp đích còn <strong>{toClassAvailableSlots} chỗ</strong>. Bạn đang chọn <strong>{selectedStudentIds.length} học sinh</strong> chuyển sang.
                      </span>
                    </div>
                    <span className="font-mono font-bold bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      Sẵn sàng chuyển
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Student Selection Table */}
            {bulkFromClassId && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span>Danh sách Học sinh Lớp Cũ</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-500/20 text-sky-300">
                        Đã chọn {selectedStudentIds.length} / {studentsInFromClass.length} HS
                      </span>
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleSelectAllStudents}
                    className="text-xs font-bold text-sky-400 hover:text-sky-300 cursor-pointer"
                  >
                    {selectedStudentIds.length === studentsInFromClass.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả học sinh'}
                  </button>
                </div>

                <div className="border border-white/10 rounded-2xl overflow-hidden bg-slate-950/80">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-900 border-b border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={studentsInFromClass.length > 0 && selectedStudentIds.length === studentsInFromClass.length}
                            onChange={handleToggleSelectAllStudents}
                            className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                          />
                        </th>
                        <th className="py-2.5 px-3">Học Viên</th>
                        <th className="py-2.5 px-3">Phụ Huynh &amp; SĐT</th>
                        <th className="py-2.5 px-3">Khối Lớp</th>
                        <th className="py-2.5 px-3">Xe Bus</th>
                        <th className="py-2.5 px-3 text-right">Trạng Thái Chuyển</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {studentsInFromClass.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500">
                            Không có học sinh nào trong lớp nguồn này.
                          </td>
                        </tr>
                      ) : (
                        studentsInFromClass.map((stu) => {
                          const isSelected = selectedStudentIds.includes(stu.id);
                          return (
                            <tr 
                              key={stu.id} 
                              onClick={() => handleToggleStudent(stu.id)}
                              className={`cursor-pointer transition ${isSelected ? 'bg-amber-500/10 hover:bg-amber-500/15' : 'hover:bg-white/5'}`}
                            >
                              <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleStudent(stu.id)}
                                  className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                                />
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-bold text-white">{stu.name}</div>
                                <div className="text-[10px] font-mono text-slate-400">{stu.id}</div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="text-slate-200">{stu.hoTenPhuHuynh || 'Gia đình'}</div>
                                <div className="text-[10px] font-mono text-sky-400">{stu.sdtPhuHuynh}</div>
                              </td>
                              <td className="py-3 px-3 text-slate-300">
                                {stu.lopChinhKhoa || 'Tiểu học'}
                              </td>
                              <td className="py-3 px-3">
                                {stu.dangKyXeBus ? (
                                  <span className="text-[10px] text-amber-300 font-medium flex items-center gap-1">
                                    <Tag className="w-3 h-3 text-amber-400" /> Có xe bus
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500">Tự đưa đón</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-right">
                                {isSelected ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    ✓ Sẽ chuyển
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">
                                    Giữ nguyên
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Date & Reason Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Ngày áp dụng chuyển lớp <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={bulkTransferDate}
                  onChange={(e) => setBulkTransferDate(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Lý do chuyển đợt / Quyết định học vụ
                </label>
                <input
                  type="text"
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                  placeholder="Ghi chú quyết định lên cấp độ tiếp theo..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Submission Footer */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                Lớp cũ sẽ tự động được đánh dấu <strong className="text-emerald-400">"Đã hoàn thành"</strong> khi chuyển hết học sinh.
              </div>

              <button
                type="submit"
                disabled={isBulkExceedingCapacity || selectedStudentIds.length === 0 || isBulkSubmitting}
                className={`px-6 py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                  isBulkExceedingCapacity || selectedStudentIds.length === 0 || isBulkSubmitting
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                    : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isBulkSubmitting 
                    ? 'Đang xử lý ghi danh hàng loạt...' 
                    : `🚀 XÁC NHẬN CHUYỂN HÀNG LOẠT (${selectedStudentIds.length} HỌC SINH)`}
                </span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* MODAL: CHUYỂN LỚP CÁ NHÂN (METHOD 1) */}
      {isModalOpen && (
        <ClassTransferModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          student={selectedStudentForTransfer}
          classes={classes}
          danhSachLop={danhSachLop}
          diemDanhList={diemDanhList}
          monHocList={monHocList}
          onConfirmTransfer={(record) => {
            onConfirmTransfer(record);
            setIsModalOpen(false);
          }}
          onBulkTransfer={onBulkTransfer}
        />
      )}
    </div>
  );
}
