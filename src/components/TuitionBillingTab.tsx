import React, { useState, useMemo, useEffect } from 'react';
import { 
  TuitionInvoice, 
  HocVien, 
  LopHoc, 
  MonHoc, 
  InvoicePaymentStatus, 
  calculateTuitionFee, 
  generateVietQrUrl 
} from '../types';
import TuitionInvoiceModal from './TuitionInvoiceModal';
import EnrollmentFeePreview from './EnrollmentFeePreview';
import TuitionReportTable from './TuitionReportTable';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  CreditCard, 
  Send, 
  Printer, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  User, 
  Building2, 
  QrCode,
  Sparkles,
  X,
  Table,
  LayoutDashboard
} from 'lucide-react';

interface TuitionBillingTabProps {
  invoices: TuitionInvoice[];
  students: HocVien[];
  classes: LopHoc[];
  monHocList: MonHoc[];
  onAddInvoice: (newInvoice: TuitionInvoice) => void;
  onRecordPayment: (invoiceId: string, paidAmount: number) => void;
}

export default function TuitionBillingTab({
  invoices,
  students,
  classes,
  monHocList,
  onAddInvoice,
  onRecordPayment,
}: TuitionBillingTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoicePaymentStatus>('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'standard' | 'report_table'>('standard');
  
  const [selectedInvoice, setSelectedInvoice] = useState<TuitionInvoice | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [startSessionIndex, setStartSessionIndex] = useState<number>(1);
  const [invoiceDueDate, setInvoiceDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split('T')[0];
  });
  const [invoiceNotes, setInvoiceNotes] = useState<string>('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Khóa cuộn màn hình chính (document.body.style.overflow = 'hidden') khi modal mở
  useEffect(() => {
    if (isCreateModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || '';
      };
    }
  }, [isCreateModalOpen]);

  // Lắng nghe phím ESC
  useEffect(() => {
    if (!isCreateModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCreateModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreateModalOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch = 
        inv.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoiceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.className.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || inv.paymentStatus === statusFilter;
      const matchClass = selectedClassFilter === 'all' || inv.classId === selectedClassFilter;
      return matchSearch && matchStatus && matchClass;
    });
  }, [invoices, searchTerm, statusFilter, selectedClassFilter]);

  const stats = useMemo(() => {
    let totalSubtotal = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;
    let unpaidCount = 0;
    let partialCount = 0;
    let paidCount = 0;

    invoices.forEach(inv => {
      totalSubtotal += inv.subtotalAmount;
      totalPaid += inv.paidAmount;
      totalOutstanding += inv.outstandingAmount;

      if (inv.paymentStatus === 'unpaid') unpaidCount++;
      else if (inv.paymentStatus === 'partially_paid') partialCount++;
      else if (inv.paymentStatus === 'paid') paidCount++;
    });

    const collectionRate = totalSubtotal > 0 ? Math.round((totalPaid / totalSubtotal) * 100) : 0;

    return {
      totalInvoices: invoices.length,
      totalSubtotal,
      totalPaid,
      totalOutstanding,
      unpaidCount,
      partialCount,
      paidCount,
      collectionRate,
    };
  }, [invoices]);

  const chosenClass = useMemo(() => {
    return classes.find(c => c.id === selectedClassId) || null;
  }, [classes, selectedClassId]);

  const chosenSubject = useMemo(() => {
    if (!chosenClass) return null;
    return monHocList.find(m => m.tenMon === chosenClass.tenMon) || null;
  }, [chosenClass, monHocList]);

  const chosenTotalSessions = chosenClass?.soBuoiHoc || chosenSubject?.soBuoiHoc || 24;
  const chosenFullFee = chosenClass?.hocPhiTronKhoa || chosenSubject?.hocPhiTheoKhoa || 3600000;
  const chosenRatePerSession = chosenSubject?.hocPhiTheoBuoi || Math.round(chosenFullFee / chosenTotalSessions);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === selectedStudentId);
    if (!student || !chosenClass) {
      alert('⚠️ Vui lòng chọn học sinh và lớp học!');
      return;
    }

    const calc = calculateTuitionFee(
      startSessionIndex,
      chosenTotalSessions,
      chosenFullFee,
      chosenRatePerSession
    );

    const invCode = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(invoices.length + 1).padStart(3, '0')}`;
    const cleanClassCode = (chosenClass.tenLop || chosenClass.tenMon).replace(/\s+/g, '').toUpperCase().slice(0, 6);
    const syntax = `${student.id} ${cleanClassCode} ${invCode.slice(-6)}`;
    const qrUrl = generateVietQrUrl('02839110001', 'TRUONG SONG NGU QUOC TE ROYAL', calc.subtotalAmount, syntax);

    const newInvoice: TuitionInvoice = {
      id: `INV_${Date.now()}`,
      invoiceCode: invCode,
      studentId: student.id,
      studentName: student.name,
      classId: chosenClass.id,
      className: `${chosenClass.tenLop || chosenClass.tenMon} (${chosenClass.coSo || 'Cơ sở chính'})`,
      billingType: calc.billingType,
      startSessionIndex,
      sessionRate: chosenRatePerSession,
      registeredSessions: calc.registeredSessions,
      totalSessionsInCourse: chosenTotalSessions,
      subtotalAmount: calc.subtotalAmount,
      paidAmount: 0,
      outstandingAmount: calc.subtotalAmount,
      paymentStatus: 'unpaid',
      dueDate: invoiceDueDate,
      transferSyntax: syntax,
      bankTransferQr: qrUrl,
      notes: invoiceNotes.trim() || (calc.billingType === 'full_course' ? 'Học phí trọn khóa' : `Vào học từ buổi #${startSessionIndex}`),
      createdAt: new Date().toLocaleString('vi-VN'),
    };

    onAddInvoice(newInvoice);
    setIsCreateModalOpen(false);
    showToast(`Đã phát hành phiếu báo phí ${invCode} cho học sinh ${student.name}!`);
  };

  const handleSendReminder = (inv: TuitionInvoice) => {
    showToast(`📲 Đã gửi thông báo nhắc phí qua SMS/Zalo tới phụ huynh em ${inv.studentName} (${inv.outstandingAmount.toLocaleString('vi-VN')} đ)!`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs">{toastMessage}</span>
        </div>
      )}

      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-display font-bold text-white uppercase tracking-tight flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-amber-400" />
            <span>QUẢN LÝ HỌC PHÍ &amp; PHÁT HÀNH BÁO PHÍ (TUITION &amp; BILLING)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tự động tính học phí theo trọn khóa hoặc theo số buổi còn lại • Tạo mã VietQR thanh toán tự động
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('standard')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'standard'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Giao Diện Quản Trị</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('report_table')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'report_table'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Bảng Báo Phí (Report Table)</span>
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedStudentId(students[0]?.id || '');
              setSelectedClassId(classes[0]?.id || '');
              setStartSessionIndex(1);
              setIsCreateModalOpen(true);
            }}
            className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition active:scale-95 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>PHÁT HÀNH BÁO PHÍ MỚI</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900/70 border border-white/10 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Tổng Học Phí Phát Hành</span>
            <DollarSign className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl sm:text-2xl font-display font-extrabold text-white font-mono mt-1">
            {stats.totalSubtotal.toLocaleString('vi-VN')} đ
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {stats.totalInvoices} phiếu báo phí
          </div>
        </div>

        <div className="bg-slate-900/70 border border-white/10 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Đã Thực Thu</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-display font-extrabold text-emerald-400 font-mono mt-1">
            {stats.totalPaid.toLocaleString('vi-VN')} đ
          </div>
          <div className="text-[10px] text-emerald-300 mt-1 font-bold">
            Tỷ lệ thu: {stats.collectionRate}%
          </div>
        </div>

        <div className="bg-slate-900/70 border border-white/10 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Công Nợ Còn Phải Thu</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-display font-extrabold text-rose-400 font-mono mt-1">
            {stats.totalOutstanding.toLocaleString('vi-VN')} đ
          </div>
          <div className="text-[10px] text-rose-300 mt-1">
            {stats.unpaidCount + stats.partialCount} học viên chưa tất toán
          </div>
        </div>

        <div className="bg-slate-900/70 border border-white/10 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Trạng Thái Thanh Toán</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xs font-bold text-white mt-2 space-y-1">
            <div className="flex justify-between">
              <span className="text-emerald-400">Đã nộp đủ:</span>
              <span className="font-mono">{stats.paidCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-400">Nộp một phần:</span>
              <span className="font-mono">{stats.partialCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-rose-400">Chưa nộp:</span>
              <span className="font-mono">{stats.unpaidCount}</span>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'report_table' ? (
        <TuitionReportTable
          invoices={invoices}
          students={students}
          classes={classes}
          onRecordPayment={onRecordPayment}
        />
      ) : (
        <>
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto flex-1">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên HS, mã số, mã hóa đơn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="all">Tất cả lớp học ({classes.length})</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id} className="bg-slate-950 text-white">
                    {c.tenLop ? `${c.tenLop} (${c.tenMon})` : c.tenMon}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-sky-500 text-slate-950 font-extrabold shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Tất cả ({invoices.length})
              </button>
              <button
                onClick={() => setStatusFilter('unpaid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'unpaid'
                    ? 'bg-rose-500 text-white font-extrabold shadow-sm'
                    : 'bg-white/5 text-rose-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Chưa nộp ({stats.unpaidCount})
              </button>
              <button
                onClick={() => setStatusFilter('partially_paid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'partially_paid'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                    : 'bg-white/5 text-amber-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Nộp 1 phần ({stats.partialCount})
              </button>
              <button
                onClick={() => setStatusFilter('paid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'paid'
                    ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                    : 'bg-white/5 text-emerald-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đã hoàn tất ({stats.paidCount})
              </button>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className="bg-slate-950 border-b border-white/10 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Mã Phiếu &amp; Hạn Nộp</th>
                    <th className="py-3 px-4">Học Sinh</th>
                    <th className="py-3 px-4">Lớp Ngoại Khóa</th>
                    <th className="py-3 px-4 text-center">Hình Thức &amp; Buổi</th>
                    <th className="py-3 px-4 text-right">Tổng Tiền</th>
                    <th className="py-3 px-4 text-right">Còn Nợ</th>
                    <th className="py-3 px-4 text-center">Trạng Thái</th>
                    <th className="py-3 px-4 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        Không có phiếu báo phí nào phù hợp với bộ lọc tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-3.5 px-4 font-mono">
                          <div className="font-bold text-sky-400 flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5" />
                            <span>{inv.invoiceCode}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            Hạn: <span className="text-amber-400">{inv.dueDate}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">{inv.studentName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{inv.studentId}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-white font-medium">{inv.className}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {inv.transferSyntax}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            inv.billingType === 'full_course' 
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                              : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                          }`}>
                            {inv.billingType === 'full_course' ? 'Trọn khóa' : `Vào từ B#${inv.startSessionIndex}`}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            {inv.registeredSessions}/{inv.totalSessionsInCourse} buổi
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200">
                          {inv.subtotalAmount.toLocaleString('vi-VN')} đ
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono">
                          <div className={`font-bold ${inv.outstandingAmount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {inv.outstandingAmount.toLocaleString('vi-VN')} đ
                          </div>
                          {inv.paidAmount > 0 && inv.outstandingAmount > 0 && (
                            <div className="text-[10px] text-emerald-400">
                              (Đã thu: {inv.paidAmount.toLocaleString('vi-VN')} đ)
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {inv.paymentStatus === 'paid' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Đã nộp đủ
                            </span>
                          )}
                          {inv.paymentStatus === 'partially_paid' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Nộp một phần
                            </span>
                          )}
                          {inv.paymentStatus === 'unpaid' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              Chưa nộp
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setIsInvoiceModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg border border-sky-500/20 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                              title="Xem chi tiết & In phiếu"
                            >
                              <QrCode className="w-3 h-3" />
                              <span>Phiếu QR</span>
                            </button>

                            {inv.outstandingAmount > 0 && (
                              <button
                                type="button"
                                onClick={() => handleSendReminder(inv)}
                                className="p-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/20 transition cursor-pointer"
                                title="Gửi tin nhắc phí tới phụ huynh"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
            <div className="bg-slate-950/90 border-b border-white/10 px-6 py-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-bold text-sm sm:text-base">
                  PHÁT HÀNH PHIẾU BÁO HỌC PHÍ MỚI
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs scrollbar-thin">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300 uppercase tracking-wide">
                  Học viên nhận báo phí <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-slate-950 border border-white/20 rounded-xl px-3 py-2 text-white font-bold"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id} className="bg-slate-950 text-white">
                      {s.name} ({s.id}) - PH: {s.hoTenPhuHuynh || 'Chưa cập nhật'} ({s.sdtPhuHuynh})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300 uppercase tracking-wide">
                  Lớp ngoại khóa <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full bg-slate-950 border border-white/20 rounded-xl px-3 py-2 text-white font-bold"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-950 text-white">
                      {c.tenLop ? `${c.tenLop} (${c.tenMon})` : c.tenMon} - {c.coSo} | {c.lichHocCoDinh}
                    </option>
                  ))}
                </select>
              </div>

              {chosenClass && (
                <EnrollmentFeePreview
                  totalSessions={chosenTotalSessions}
                  fullCourseFee={chosenFullFee}
                  pricePerSession={chosenRatePerSession}
                  startSessionIndex={startSessionIndex}
                  onStartSessionChange={setStartSessionIndex}
                  classNameTitle={chosenClass.tenLop ? `${chosenClass.tenLop} (${chosenClass.tenMon})` : chosenClass.tenMon}
                />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-300 uppercase tracking-wide">
                    Hạn chót thanh toán <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={invoiceDueDate}
                    onChange={(e) => setInvoiceDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/20 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-300 uppercase tracking-wide">
                    Ghi chú phiếu
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Đăng ký sớm ưu đãi hè..."
                    value={invoiceNotes}
                    onChange={(e) => setInvoiceNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-bold shadow-lg"
                >
                  Phát Hành Phiếu Báo Phí
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <TuitionInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
        onRecordPayment={onRecordPayment}
      />
    </div>
  );
}
