/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  AlertCircle, 
  TrendingUp, 
  ArrowUpRight, 
  Bus, 
  Filter, 
  Download, 
  Printer, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Send, 
  FileSpreadsheet, 
  Sparkles, 
  ArrowRightLeft, 
  MapPin, 
  HelpCircle, 
  ChevronRight, 
  ExternalLink,
  MessageCircle,
  Mail,
  X,
  Layers,
  BarChart3,
  PieChart,
  ShieldCheck,
  Check,
  AlertTriangle,
  RotateCcw,
  Award,
  Table
} from 'lucide-react';
import { 
  HocVien, 
  LopHoc, 
  DanhSachLop, 
  DiemDanh, 
  GiaoVien, 
  CoSo, 
  MonHoc, 
  ClassTransferRecord, 
  TuitionInvoice, 
  formatToVNDate,
  generateVietQrUrl 
} from '../types';
import RoyalLogo from './RoyalLogo';
import TuitionReportTable from './TuitionReportTable';

interface DashboardPanelProps {
  hocVienList: HocVien[];
  classes: LopHoc[];
  danhSachLop: DanhSachLop[];
  diemDanhList: DiemDanh[];
  giaoVienList?: GiaoVien[];
  coSoList?: CoSo[];
  monHocList?: MonHoc[];
  transfersList?: ClassTransferRecord[];
  invoicesList?: TuitionInvoice[];
  onNavigateTab?: (tab: string) => void;
  onOpenRegister?: () => void;
}

export default function DashboardPanel({
  hocVienList,
  classes,
  danhSachLop,
  diemDanhList,
  giaoVienList = [],
  coSoList = [],
  monHocList = [],
  transfersList = [],
  invoicesList = [],
  onNavigateTab,
  onOpenRegister
}: DashboardPanelProps) {
  // Global Filters
  const [selectedSemester, setSelectedSemester] = useState<string>('HK1_2026_2027');
  const [selectedCampus, setSelectedCampus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'semester'>('semester');
  const [tuitionReportView, setTuitionReportView] = useState<'overview' | 'table'>('overview');

  // Modal State for Zalo/Email Reminders
  const [reminderModalData, setReminderModalData] = useState<{
    studentName: string;
    parentPhone: string;
    className: string;
    amount: number;
    reason: string;
    qrUrl: string;
    invoiceCode?: string;
  } | null>(null);

  // Khóa cuộn màn hình chính (document.body.style.overflow = 'hidden') khi modal mở
  useEffect(() => {
    if (reminderModalData) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || '';
      };
    }
  }, [reminderModalData]);

  // Lắng nghe phím ESC
  useEffect(() => {
    if (!reminderModalData) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setReminderModalData(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reminderModalData]);

  const [reminderSentToast, setReminderSentToast] = useState<string | null>(null);

  // Helper categorize subject according to official Royal School notification
  const getSubjectCategory = (subjectName: string): 'sports' | 'arts' | 'stem' => {
    const s = (subjectName || '').toLowerCase();
    if (
      s.includes('bóng') || 
      s.includes('bơi') || 
      s.includes('võ') || 
      s.includes('vovinam') || 
      s.includes('karate') || 
      s.includes('pickleball') || 
      s.includes('aerobic') || 
      s.includes('dance') || 
      s.includes('cờ vua') || 
      s.includes('chess')
    ) {
      return 'sports';
    }
    if (
      s.includes('vẽ') || 
      s.includes('piano') || 
      s.includes('manga') || 
      s.includes('gouache') || 
      s.includes('leningrad') || 
      s.includes('mỹ thuật')
    ) {
      return 'arts';
    }
    return 'stem'; // Robotics Foundation, Robotics Competition, Luyện chữ đẹp, Quản lý cảm xúc
  };

  // Filtered Classes based on Campus and Category
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      if (selectedCampus !== 'all' && cls.coSo && !cls.coSo.includes(selectedCampus)) {
        return false;
      }
      if (selectedCategory !== 'all') {
        const cat = getSubjectCategory(cls.tenMon);
        if (cat !== selectedCategory) return false;
      }
      return true;
    });
  }, [classes, selectedCampus, selectedCategory]);

  const filteredClassIds = useMemo(() => new Set(filteredClasses.map(c => c.id)), [filteredClasses]);

  // Filtered Enrollments
  const filteredEnrollments = useMemo(() => {
    return danhSachLop.filter(e => filteredClassIds.has(e.idLop));
  }, [danhSachLop, filteredClassIds]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    if (selectedCampus === 'all') return hocVienList;
    return hocVienList.filter(h => !h.coSo || h.coSo.includes(selectedCampus));
  }, [hocVienList, selectedCampus]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoicesList.filter(inv => {
      if (selectedCampus !== 'all') {
        const relatedClass = classes.find(c => c.id === inv.classId);
        if (relatedClass && relatedClass.coSo && !relatedClass.coSo.includes(selectedCampus)) {
          return false;
        }
      }
      if (selectedCategory !== 'all') {
        const cat = getSubjectCategory(inv.className);
        if (cat !== selectedCategory) return false;
      }
      return true;
    });
  }, [invoicesList, selectedCampus, selectedCategory, classes]);

  // Filtered Transfers
  const filteredTransfers = useMemo(() => {
    return transfersList.filter(trf => {
      if (selectedCampus !== 'all') {
        const relatedClass = classes.find(c => c.id === trf.toClassId || c.id === trf.fromClassId);
        if (relatedClass && relatedClass.coSo && !relatedClass.coSo.includes(selectedCampus)) {
          return false;
        }
      }
      return true;
    });
  }, [transfersList, selectedCampus, classes]);

  // 1. TOP METRICS CALCULATIONS
  // Total Students & Bus
  const totalActiveStudents = filteredStudents.filter(s => s.trangThai === 'Còn hạn').length;
  const totalBusStudents = filteredStudents.filter(s => s.dangKyXeBus === true).length;

  // Classes Capacity Metrics
  const ongoingClassesCount = filteredClasses.filter(c => c.trangThai === 'Đang hoạt động').length;
  const underEnrolledClasses = filteredClasses.filter(c => {
    const enrolled = danhSachLop.filter(e => e.idLop === c.id).length;
    return enrolled < 5;
  });
  const fullCapacityClasses = filteredClasses.filter(c => {
    const enrolled = danhSachLop.filter(e => e.idLop === c.id).length;
    return enrolled >= c.siSoToiDa;
  });

  // Financial Metrics
  const totalCollectedAmount = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  }, [filteredInvoices]);

  const totalOutstandingAmount = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => sum + (inv.outstandingAmount || 0), 0);
  }, [filteredInvoices]);

  const totalExpectedAmount = totalCollectedAmount + totalOutstandingAmount;
  const collectionRate = totalExpectedAmount > 0 
    ? Math.round((totalCollectedAmount / totalExpectedAmount) * 100) 
    : 85;

  const overdueInvoicesCount = useMemo(() => {
    const today = '2026-09-30';
    return filteredInvoices.filter(inv => inv.outstandingAmount > 0 && inv.dueDate < today).length;
  }, [filteredInvoices]);

  // 2. FINANCIAL & TUITION REPORT
  // Revenue by Subject Category
  const revenueByCategory = useMemo(() => {
    const result = {
      sports: { name: 'Thể thao (Bóng rổ, Bơi lội, Taekwondo)', amount: 0, count: 0 },
      arts: { name: 'Nghệ thuật & Sáng tạo (Vẽ, Piano, Nhảy)', amount: 0, count: 0 },
      stem: { name: 'Học thuật & Kỹ năng (Robotics, Cờ vua, Drama)', amount: 0, count: 0 },
    };

    filteredInvoices.forEach(inv => {
      const cat = getSubjectCategory(inv.className);
      result[cat].amount += (inv.paidAmount || 0);
      result[cat].count += 1;
    });

    return result;
  }, [filteredInvoices]);

  // Enrollment Billing Type Distribution
  const billingTypeStats = useMemo(() => {
    let fullCourse = 0;
    let prorated = 0;
    let transferAddon = 0;

    filteredInvoices.forEach(inv => {
      if (inv.billingType === 'full_course') fullCourse++;
      else if (inv.billingType === 'prorated_sessions') prorated++;
    });

    filteredTransfers.forEach(trf => {
      if (trf.feeDifference > 0) transferAddon++;
    });

    const total = fullCourse + prorated + transferAddon || 1;
    return {
      fullCourse: { count: fullCourse, percent: Math.round((fullCourse / total) * 100) },
      prorated: { count: prorated, percent: Math.round((prorated / total) * 100) },
      transferAddon: { count: transferAddon, percent: Math.round((transferAddon / total) * 100) },
      total,
    };
  }, [filteredInvoices, filteredTransfers]);

  // Pending Surcharges & Overdue Invoices List
  const pendingActionsList = useMemo(() => {
    const list: {
      id: string;
      studentName: string;
      phone: string;
      className: string;
      amount: number;
      type: 'transfer_surcharge' | 'overdue_invoice' | 'pending_tuition';
      description: string;
      dueDate: string;
      qrUrl: string;
    }[] = [];

    // Pending invoice amounts
    filteredInvoices
      .filter(inv => inv.outstandingAmount > 0)
      .forEach(inv => {
        const student = hocVienList.find(s => s.id === inv.studentId);
        list.push({
          id: inv.id,
          studentName: inv.studentName,
          phone: student?.sdtPhuHuynh || '0912345678',
          className: inv.className,
          amount: inv.outstandingAmount,
          type: inv.dueDate < '2026-09-30' ? 'overdue_invoice' : 'pending_tuition',
          description: inv.notes || `Chưa hoàn tất học phí (${inv.registeredSessions} buổi)`,
          dueDate: inv.dueDate,
          qrUrl: inv.bankTransferQr || generateVietQrUrl('02839110001', 'TRUONG SONG NGU QUOC TE ROYAL', inv.outstandingAmount, inv.transferSyntax),
        });
      });

    // Unsettled transfer fees
    filteredTransfers
      .filter(trf => trf.feeDifference > 0 && trf.differenceStatus === 'student_must_pay')
      .forEach(trf => {
        const student = hocVienList.find(s => s.id === trf.studentId);
        list.push({
          id: trf.id,
          studentName: trf.studentName,
          phone: student?.sdtPhuHuynh || '0988112233',
          className: trf.toClassName,
          amount: trf.feeDifference,
          type: 'transfer_surcharge',
          description: `Đóng bù đổi lớp: ${trf.fromClassName} -> ${trf.toClassName}`,
          dueDate: trf.transferDate,
          qrUrl: generateVietQrUrl('02839110001', 'TRUONG SONG NGU QUOC TE ROYAL', trf.feeDifference, `${trf.studentId} CHUYENLOP ${trf.id}`),
        });
      });

    return list;
  }, [filteredInvoices, filteredTransfers, hocVienList]);

  // 3. CLASSES & FACILITY OCCUPANCY
  const facilityStats = useMemo(() => {
    return [
      { name: 'Sân bóng rổ Royal A', type: 'Ngoài trời', activeClasses: 2, totalSlots: 4, occupancy: 50, campus: 'Phú Mỹ Hưng', freeTimes: 'Thứ 3 & 5 (17:00 - 19:00)' },
      { name: 'Hồ bơi 4 mùa Aquatics', type: 'Dưới nước', activeClasses: 2, totalSlots: 4, occupancy: 75, campus: 'Phú Mỹ Hưng', freeTimes: 'Thứ 2 đến Thứ 6 các buổi sáng' },
      { name: 'Phòng Lab STEM 01', type: 'Công nghệ cao', activeClasses: 2, totalSlots: 4, occupancy: 50, campus: 'Phú Mỹ Hưng', freeTimes: 'Thứ 2, 4, 6 (16:30 - 18:30)' },
      { name: 'Xưởng Vẽ Art Studio 2', type: 'Mỹ thuật', activeClasses: 1, totalSlots: 3, occupancy: 33, campus: 'Nam Sài Gòn', freeTimes: 'Chủ Nhật cả ngày & Các chiều trong tuần' },
      { name: 'Phòng Âm nhạc Piano 1', type: 'Phòng thanh âm', activeClasses: 2, totalSlots: 4, occupancy: 50, campus: 'Nam Sài Gòn', freeTimes: 'Thứ 3, 5, 7 (17:00 - 18:30)' },
      { name: 'Nhà thi đấu Đa năng Gym', type: 'Thể thao trong nhà', activeClasses: 2, totalSlots: 4, occupancy: 50, campus: 'TP. Thủ Đức', freeTimes: 'Thứ 7 & Chủ Nhật (Sáng / Chiều)' },
      { name: 'Phòng Trí tuệ Logic 302', type: 'Cờ vua / Trí óc', activeClasses: 1, totalSlots: 3, occupancy: 33, campus: 'Bình Tân', freeTimes: 'Thứ 7 cả ngày & Các buổi chiều' },
      { name: 'Khán phòng Royal Theatre', type: 'Sân khấu', activeClasses: 1, totalSlots: 3, occupancy: 33, campus: 'Phú Mỹ Hưng', freeTimes: 'Thứ 2, Thứ 3, Thứ 7' },
    ];
  }, []);

  // 4. STUDENTS & ATTENDANCE OVERVIEW
  // Grade Distribution
  const gradeDistribution = useMemo(() => {
    const counts: Record<string, number> = { 'Khối 1': 0, 'Khối 2': 0, 'Khối 3': 0, 'Khối 4': 0, 'Khối 5': 0, 'Khác': 0 };
    filteredStudents.forEach(s => {
      const cls = s.lopChinhKhoa || '';
      if (cls.includes('1') || cls.includes('K1')) counts['Khối 1']++;
      else if (cls.includes('2') || cls.includes('K2')) counts['Khối 2']++;
      else if (cls.includes('3') || cls.includes('K3')) counts['Khối 3']++;
      else if (cls.includes('4') || cls.includes('K4')) counts['Khối 4']++;
      else if (cls.includes('5') || cls.includes('K5')) counts['Khối 5']++;
      else counts['Khác']++;
    });
    return counts;
  }, [filteredStudents]);

  // Bus Connection Required Students
  const busStudentsList = useMemo(() => {
    return filteredStudents.filter(s => s.dangKyXeBus);
  }, [filteredStudents]);

  // Attendance Rates
  const attendanceHealth = useMemo(() => {
    const present = diemDanhList.filter(d => d.trangThai === 'Có mặt').length;
    const excused = diemDanhList.filter(d => d.trangThai === 'Vắng có phép').length;
    const unexcused = diemDanhList.filter(d => d.trangThai === 'Vắng không phép').length;
    const total = diemDanhList.length || 1;

    // Identify students with 2 or more absences
    const studentAbsenceMap = new Map<string, number>();
    diemDanhList.forEach(d => {
      if (d.trangThai !== 'Có mặt') {
        studentAbsenceMap.set(d.idHocVien, (studentAbsenceMap.get(d.idHocVien) || 0) + 1);
      }
    });

    const flaggedStudents: { student: HocVien; absences: number }[] = [];
    studentAbsenceMap.forEach((absences, studentId) => {
      const student = hocVienList.find(s => s.id === studentId);
      if (student && absences >= 1) {
        flaggedStudents.push({ student, absences });
      }
    });

    return {
      presentRate: Math.round((present / total) * 100),
      excusedRate: Math.round((excused / total) * 100),
      unexcusedRate: Math.round((unexcused / total) * 100),
      totalSessions: total,
      present,
      excused,
      unexcused,
      flaggedStudents,
    };
  }, [diemDanhList, hocVienList]);

  // Export to CSV Function
  const handleExportCSV = () => {
    const headers = [
      'Mã Hóa Đơn / Phiếu',
      'Tên Học Viên',
      'Lớp Học Ngoại Khóa',
      'Loại Hình',
      'Tổng Tiền (VNĐ)',
      'Đã Thu (VNĐ)',
      'Công Nợ Còn Lại (VNĐ)',
      'Trạng Thái',
      'Hạn Thanh Toán'
    ];

    const rows = filteredInvoices.map(inv => [
      inv.invoiceCode,
      `"${inv.studentName}"`,
      `"${inv.className}"`,
      inv.billingType === 'full_course' ? 'Trọn khóa' : 'Theo buổi',
      inv.subtotalAmount,
      inv.paidAmount,
      inv.outstandingAmount,
      inv.paymentStatus === 'paid' ? 'Đã thanh toán' : inv.paymentStatus === 'partially_paid' ? 'Thanh toán 1 phần' : 'Chưa thanh toán',
      inv.dueDate
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bao_Cao_Hoc_Phi_RoyalSchool_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setReminderSentToast('Đã xuất thành công file báo cáo CSV học phí & công nợ!');
    setTimeout(() => setReminderSentToast(null), 4000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleSendReminder = (item: typeof pendingActionsList[0]) => {
    setReminderModalData({
      studentName: item.studentName,
      parentPhone: item.phone,
      className: item.className,
      amount: item.amount,
      reason: item.description,
      qrUrl: item.qrUrl,
      invoiceCode: item.id,
    });
  };

  const handleConfirmSendReminder = (channel: 'zalo' | 'sms' | 'email') => {
    if (!reminderModalData) return;
    const channelName = channel === 'zalo' ? 'Zalo ZNS' : channel === 'sms' ? 'SMS Brandname' : 'Email Học Vụ';
    setReminderSentToast(`Đã gửi thông báo nhắc phí thành công qua ${channelName} tới phụ huynh em ${reminderModalData.studentName} (${reminderModalData.parentPhone})!`);
    setReminderModalData(null);
    setTimeout(() => setReminderSentToast(null), 5000);
  };

  return (
    <div className="space-y-6 pb-12 print:p-0 print:m-0 text-slate-100">
      {/* Toast Notification */}
      {reminderSentToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/30 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold">{reminderSentToast}</p>
          <button onClick={() => setReminderSentToast(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Header Toolbar & Global Filters */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                REAL-TIME ANALYTICS
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                ROYAL INTERNATIONAL SCHOOL
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight text-white flex items-center gap-2">
              Báo Cáo Tổng Quan Học Vụ &amp; Học Phí
            </h1>
            <p className="text-xs text-slate-400">
              Trung tâm chỉ huy &amp; Thống kê thời gian thực 3 trụ cột dữ liệu: Học sinh, Sân bãi - Lớp học, và Học phí &amp; Công nợ
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Xuất Báo Cáo CSV</span>
            </button>

            <button
              onClick={handlePrintReport}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition flex items-center gap-1.5 shadow-sm cursor-pointer print:hidden"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span>In / Xuất PDF</span>
            </button>

            {onOpenRegister && (
              <button
                onClick={onOpenRegister}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+ Đăng ký Học sinh mới</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Multi-dimensional Filter Toolbar */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Semester */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Kỳ học / Niên khóa</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full bg-slate-800/90 border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-sky-500"
            >
              <option value="HK1_2026_2027">Học kỳ I (Năm học 2026 - 2027)</option>
              <option value="HK2_2026_2027">Học kỳ II (Năm học 2026 - 2027)</option>
              <option value="HE_2026">Khóa Hè Quốc Tế (Summer 2026)</option>
            </select>
          </div>

          {/* Campus */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Cơ sở trường (Campus)</label>
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="w-full bg-slate-800/90 border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-sky-500"
            >
              <option value="all">Tất cả Cơ sở (Phú Mỹ Hưng, Phú Lâm, Celadon...)</option>
              <option value="Phú Mỹ Hưng">Cơ sở Phú Mỹ Hưng (Q.7)</option>
              <option value="Phú Lâm">Cơ sở Phú Lâm (Q.6)</option>
              <option value="Celadon">Cơ sở Celadon (Tân Phú)</option>
              <option value="Nam Sài Gòn">Cơ sở Nam Sài Gòn (Bình Chánh)</option>
              <option value="Thủ Đức">Cơ sở TP. Thủ Đức</option>
              <option value="Bình Tân">Cơ sở Bình Tân</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nhóm môn ngoại khóa</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-800/90 border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-sky-500"
            >
              <option value="all">Tất cả Nhóm môn</option>
              <option value="sports">Thể thao (Bóng rổ, Bơi, Taekwondo, Karate...)</option>
              <option value="arts">Nghệ thuật (Vẽ sáng tạo, Manga, Piano, Dance...)</option>
              <option value="stem">Học thuật &amp; Kỹ năng (Robotics, Cờ vua, Luyện chữ...)</option>
            </select>
          </div>

          {/* Time range */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Mốc thời gian phân tích</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-800/90 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setSelectedTimeRange('week')}
                className={`py-1 text-center text-xs font-bold rounded-lg transition ${
                  selectedTimeRange === 'week' ? 'bg-sky-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tuần này
              </button>
              <button
                onClick={() => setSelectedTimeRange('month')}
                className={`py-1 text-center text-xs font-bold rounded-lg transition ${
                  selectedTimeRange === 'month' ? 'bg-sky-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tháng này
              </button>
              <button
                onClick={() => setSelectedTimeRange('semester')}
                className={`py-1 text-center text-xs font-bold rounded-lg transition ${
                  selectedTimeRange === 'semester' ? 'bg-sky-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Toàn kỳ
              </button>
            </div>
          </div>
        </div>

        {/* Quick KPI Badges Strip */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2.5 text-xs">
          <span className="text-slate-400 font-medium">Thống kê nhanh:</span>
          <span className="px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-300 border border-sky-500/20 font-medium flex items-center gap-1.5 shadow-sm">
            <Award className="w-3.5 h-3.5 text-sky-400" />
            <span>Tổng số môn đang mở:</span>
            <strong className="text-white font-mono">{monHocList.length || 21} môn</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium flex items-center gap-1.5 shadow-sm">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tổng số lớp đang chạy:</span>
            <strong className="text-white font-mono">{ongoingClassesCount} lớp</strong>
            <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded font-bold">
              {fullCapacityClasses.length} lớp đủ 100% sĩ số
            </span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium flex items-center gap-1.5 shadow-sm">
            <DollarSign className="w-3.5 h-3.5 text-purple-400" />
            <span>Tổng học phí thực thu:</span>
            <strong className="text-white font-mono">{totalCollectedAmount.toLocaleString('vi-VN')} VNĐ</strong>
            <span className="text-[10px] text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded font-bold">
              Đạt {collectionRate}% kế hoạch thu
            </span>
          </span>
        </div>
      </div>

      {/* 2. Top KPI Summary Metric Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Students */}
        <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-sky-500/40 transition">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng Học Sinh Đang Học</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl lg:text-3xl font-extrabold text-white font-mono">{totalActiveStudents}</span>
                <span className="text-xs text-slate-400">học sinh</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2% so với kỳ trước
            </span>
            <span className="text-amber-300 font-medium flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <Bus className="w-3 h-3 text-amber-400" /> {totalBusStudents} đi xe bus
            </span>
          </div>
        </div>

        {/* Metric 2: Total Classes & Capacity Warning */}
        <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lớp Học Ngoại Khóa</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl lg:text-3xl font-extrabold text-white font-mono">{ongoingClassesCount}</span>
                <span className="text-xs text-slate-400">/ {filteredClasses.length} lớp mở</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
            <span className="text-rose-400 font-medium">
              {fullCapacityClasses.length > 0 ? `🔴 ${fullCapacityClasses.length} lớp đã đầy` : '🟢 Chưa lớp nào kẹt tải'}
            </span>
            <span className="text-amber-400 font-medium">
              {underEnrolledClasses.length > 0 ? `🟡 ${underEnrolledClasses.length} lớp cần tuyển sinh` : 'Đủ sĩ số'}
            </span>
          </div>
        </div>

        {/* Metric 3: Total Collected Revenue */}
        <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Học Phí Thực Thu (Collected)</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-purple-300 font-mono">
                  {totalCollectedAmount.toLocaleString('vi-VN')}
                </span>
                <span className="text-xs text-slate-400 font-mono">đ</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Tỷ lệ hoàn thành chỉ tiêu:</span>
              <span className="text-purple-300 font-bold">{collectionRate}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, collectionRate)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Metric 4: Outstanding Tuition & Overdue */}
        <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Công Nợ Cần Thu / Đóng Bù</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-amber-300 font-mono">
                  {totalOutstandingAmount.toLocaleString('vi-VN')}
                </span>
                <span className="text-xs text-slate-400 font-mono">đ</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
            <span className="text-amber-400 font-medium">
              {pendingActionsList.length} khoản cần nhắc phí
            </span>
            <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              {overdueInvoicesCount} quá hạn
            </span>
          </div>
        </div>
      </div>

      {/* 3. PHẦN A: BÁO CÁO HỌC PHÍ & DÒNG TIỀN (FINANCIAL & TUITION REPORT) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
              Phần A: Báo Cáo Học Phí &amp; Dòng Tiền (Financial &amp; Tuition Report)
            </h2>
            <div className="flex bg-slate-950/80 p-1 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setTuitionReportView('overview')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  tuitionReportView === 'overview'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tổng quan &amp; Cảnh báo
              </button>
              <button
                type="button"
                onClick={() => setTuitionReportView('table')}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  tuitionReportView === 'table'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Bảng Báo Phí Chi Tiết (Tuition Report Table)</span>
              </button>
            </div>
          </div>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('tuition')}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition self-start sm:self-auto"
            >
              Xem Chi tiết Quản lý Học phí <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {tuitionReportView === 'table' ? (
          <TuitionReportTable
            invoices={filteredInvoices}
            students={hocVienList}
            classes={classes}
          />
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Cột 1: Biểu đồ Doanh thu theo Nhóm Môn */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-400" /> Doanh Thu theo Nhóm Môn
                </h3>
                <p className="text-[11px] text-slate-400">Tỷ trọng tiền học phí thu theo từng mảng năng khiếu</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Category: Sports */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">1. Thể thao (Bóng rổ, Bơi, Võ)</span>
                  <span className="text-purple-300 font-mono font-bold">
                    {revenueByCategory.sports.amount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-sky-400 h-2 rounded-full" 
                    style={{ width: `${totalCollectedAmount > 0 ? (revenueByCategory.sports.amount / totalCollectedAmount) * 100 : 45}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-400 text-right">{revenueByCategory.sports.count} phiếu thu</p>
              </div>

              {/* Category: Arts */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">2. Nghệ thuật &amp; Sáng tạo (Vẽ, Piano)</span>
                  <span className="text-purple-300 font-mono font-bold">
                    {revenueByCategory.arts.amount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-2 rounded-full" 
                    style={{ width: `${totalCollectedAmount > 0 ? (revenueByCategory.arts.amount / totalCollectedAmount) * 100 : 30}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-400 text-right">{revenueByCategory.arts.count} phiếu thu</p>
              </div>

              {/* Category: STEM */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">3. Học thuật &amp; Kỹ năng (Robotics, Cờ, Drama)</span>
                  <span className="text-purple-300 font-mono font-bold">
                    {revenueByCategory.stem.amount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-amber-400 h-2 rounded-full" 
                    style={{ width: `${totalCollectedAmount > 0 ? (revenueByCategory.stem.amount / totalCollectedAmount) * 100 : 25}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-400 text-right">{revenueByCategory.stem.count} phiếu thu</p>
              </div>
            </div>

            {/* Phân loại Loại hình đăng ký */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-amber-400" /> Tỷ lệ Loại hình Đăng ký
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-800/80 p-2 rounded-xl border border-white/5">
                  <div className="text-xs font-bold text-sky-400 font-mono">{billingTypeStats.fullCourse.percent}%</div>
                  <div className="text-[10px] text-slate-400">Trọn khóa</div>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-xl border border-white/5">
                  <div className="text-xs font-bold text-emerald-400 font-mono">{billingTypeStats.prorated.percent}%</div>
                  <div className="text-[10px] text-slate-400">Theo buổi lẻ</div>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-xl border border-white/5">
                  <div className="text-xs font-bold text-amber-400 font-mono">{billingTypeStats.transferAddon.percent}%</div>
                  <div className="text-[10px] text-slate-400">Đóng bù đổi lớp</div>
                </div>
              </div>
            </div>
          </div>

          {/* Cột 2 & 3: Bảng Cảnh báo Công nợ & Đóng bù kèm 1-Chạm gửi Zalo/SMS */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" /> Bảng Cảnh Báo Công Nợ &amp; Đóng Bù Chuyển Lớp
                </h3>
                <p className="text-[11px] text-slate-400">
                  Danh sách học sinh cần thu bổ sung học phí - Hỗ trợ gửi thông báo 1-chạm kèm mã QR VietQR
                </p>
              </div>
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/20 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Xuất Excel Công Nợ</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Học Viên &amp; SĐT</th>
                    <th className="py-2.5 px-3">Lớp Học</th>
                    <th className="py-2.5 px-3">Khoản Cần Thu</th>
                    <th className="py-2.5 px-3">Nội Dung</th>
                    <th className="py-2.5 px-3">Hạn Thu</th>
                    <th className="py-2.5 px-3 text-right">Thao Tác 1-Chạm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {pendingActionsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        🎉 Hiện tại không có công nợ hoặc khoản đóng bù nào quá hạn!
                      </td>
                    </tr>
                  ) : (
                    pendingActionsList.slice(0, 6).map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-white">{item.studentName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.phone}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 font-medium">
                          {item.className}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {item.amount.toLocaleString('vi-VN')} đ
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-400 max-w-xs truncate">
                          {item.type === 'transfer_surcharge' && (
                            <span className="mr-1 text-[9px] bg-sky-500/20 text-sky-300 px-1 py-0.2 rounded font-bold">Đổi lớp</span>
                          )}
                          {item.type === 'overdue_invoice' && (
                            <span className="mr-1 text-[9px] bg-rose-500/20 text-rose-300 px-1 py-0.2 rounded font-bold">Quá hạn</span>
                          )}
                          {item.description}
                        </td>
                        <td className="py-2.5 px-3 text-[11px] font-mono text-slate-300">
                          {formatToVNDate(item.dueDate)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleSendReminder(item)}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3 h-3 text-sky-400" />
                            <span>Nhắc Phí</span>
                          </button>
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
      </div>

      {/* 4. PHẦN B: BÁO CÁO LỚP HỌC & SÂN BÃI (CLASSES & FACILITY OCCUPANCY) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            Phần B: Báo Cáo Lớp Học &amp; Sân Bãi (Classes &amp; Facility Occupancy)
          </h2>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('facilities')}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
            >
              Xem Lưới Sân Bãi &amp; Khung Giờ <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Cột 1 & 2: Tiến độ Lấp Đầy Sĩ Số Lớp Học */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" /> Tình Trạng Lấp Đầy Sĩ Số Lớp (Class Enrollment Capacity)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Màu sắc tự động cảnh báo: 🔴 Đỏ (Đủ sĩ số - Khóa lớp) | 🟡 Vàng (Thiếu &lt; 5 HS) | 🟢 Xanh (Tối ưu)
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Tên Lớp &amp; Cơ Sở</th>
                    <th className="py-2.5 px-3">Lịch &amp; Phòng</th>
                    <th className="py-2.5 px-3">Sĩ Số / Tối Đa</th>
                    <th className="py-2.5 px-3">Tiến Độ Lấp Đầy</th>
                    <th className="py-2.5 px-3 text-right">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredClasses.map(cls => {
                    const currentEnrolled = danhSachLop.filter(e => e.idLop === cls.id).length;
                    const maxCap = cls.siSoToiDa || 15;
                    const fillPercent = Math.min(100, Math.round((currentEnrolled / maxCap) * 100));

                    // Status determination
                    let statusBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        🟢 Đạt Chuẩn
                      </span>
                    );
                    let barColor = 'bg-emerald-400';

                    if (currentEnrolled >= maxCap) {
                      statusBadge = (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          🔴 Đã Đầy Sĩ Số
                        </span>
                      );
                      barColor = 'bg-rose-500';
                    } else if (currentEnrolled < 5) {
                      statusBadge = (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          🟡 Thiếu Học Sinh
                        </span>
                      );
                      barColor = 'bg-amber-400';
                    }

                    return (
                      <tr key={cls.id} className="hover:bg-white/5 transition">
                        <td className="py-3 px-3">
                          <div className="font-bold text-white">{cls.tenLop || cls.tenMon}</div>
                          <div className="text-[10px] text-slate-400">{cls.coSo || 'Cơ sở chính'}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          <div>{cls.lichHocCoDinh}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{cls.phongHoc}</div>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-white">
                          {currentEnrolled} / {maxCap} HS
                        </td>
                        <td className="py-3 px-3 w-40">
                          <div className="space-y-1">
                            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div className={`${barColor} h-2 rounded-full`} style={{ width: `${fillPercent}%` }}></div>
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 text-right">{fillPercent}%</div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {statusBadge}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cột 3: Tần Suất Sân Bãi & Khung Giờ Trống (Facility Heatmap) */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-400" /> Tần Suất Sân Bãi &amp; Phòng Học
                </h3>
                <p className="text-[11px] text-slate-400">Gợi ý các khung giờ trống để giáo vụ mở thêm lớp mới</p>
              </div>
            </div>

            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {facilityStats.map((fac, idx) => (
                <div key={idx} className="bg-slate-800/80 p-3 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-amber-400" /> {fac.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
                      {fac.occupancy}% công suất
                    </span>
                  </div>
                  
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{fac.campus}</span>
                    <span className="text-emerald-400 font-medium">Khung giờ trống:</span>
                  </div>

                  <div className="text-[11px] text-emerald-300 bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20 font-mono">
                    💡 {fac.freeTimes}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. PHẦN C: BÁO CÁO HỌC SINH & ĐIỂM DANH (STUDENTS & ATTENDANCE OVERVIEW) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
            Phần C: Báo Cáo Học Sinh &amp; Điểm Danh (Students &amp; Attendance Overview)
          </h2>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('attendance-sheet')}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
            >
              Xem Sổ Điểm Danh Điện Tử <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Cột 1: Phân bổ học sinh theo Khối & Cơ sở */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" /> Phân Bổ Theo Khối Chính Khóa
                </h3>
                <p className="text-[11px] text-slate-400">Tỷ lệ học sinh từ Khối 1 đến Khối 5</p>
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(gradeDistribution).map(([grade, count], i) => {
                const pct = filteredStudents.length > 0 ? Math.round((count / filteredStudents.length) * 100) : 0;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{grade}</span>
                      <span className="text-sky-300 font-mono font-bold">{count} HS ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-sky-400 h-1.5 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Attendance Health Overview */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Tỷ lệ Chuyên Cần Tuần Này
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                  <div className="font-mono font-bold text-emerald-300">{attendanceHealth.presentRate}%</div>
                  <div className="text-[10px] text-slate-400">Có mặt</div>
                </div>
                <div className="bg-sky-500/10 p-2 rounded-xl border border-sky-500/20">
                  <div className="font-mono font-bold text-sky-300">{attendanceHealth.excusedRate}%</div>
                  <div className="text-[10px] text-slate-400">Vắng có phép</div>
                </div>
                <div className="bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
                  <div className="font-mono font-bold text-rose-300">{attendanceHealth.unexcusedRate}%</div>
                  <div className="text-[10px] text-slate-400">Không phép</div>
                </div>
              </div>
            </div>
          </div>

          {/* Cột 2: Danh sách Học sinh cần hỗ trợ kết nối Xe Bus */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bus className="w-4 h-4 text-amber-400" /> Tuyến Xe Bus Đưa Đón Sau Giờ Học
                </h3>
                <p className="text-[11px] text-slate-400">Điều phối xe bus muộn (17h30 / 18h45)</p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                {busStudentsList.length} Học sinh
              </span>
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {busStudentsList.map((stu, i) => (
                <div key={i} className="bg-slate-800/80 p-3 rounded-xl border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{stu.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{stu.lopChinhKhoa || 'Tiểu học'}</span>
                  </div>
                  <div className="text-[11px] text-amber-300 font-medium flex items-center gap-1">
                    <Bus className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{stu.tuyenBus || 'Tuyến đưa đón chuẩn Royal School'}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
                    <span>Phụ huynh: {stu.hoTenPhuHuynh || 'Gia đình'}</span>
                    <span className="font-mono text-sky-400">{stu.sdtPhuHuynh}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cột 3: Cảnh báo học sinh vắng nhiều buổi */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" /> Cảnh Báo Vắng Buổi Cần Chăm Sóc
                </h3>
                <p className="text-[11px] text-slate-400">Giáo vụ cần gọi điện hỏi thăm &amp; bảo lưu vé học bù</p>
              </div>
            </div>

            <div className="space-y-3">
              {attendanceHealth.flaggedStudents.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  👏 Toàn bộ học sinh đều tham gia đầy đủ, không có học sinh nào vắng kéo dài!
                </div>
              ) : (
                attendanceHealth.flaggedStudents.slice(0, 4).map((flag, idx) => (
                  <div key={idx} className="bg-rose-950/20 border border-rose-500/20 p-3 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{flag.student.name}</span>
                      <span className="text-[10px] font-mono font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full">
                        Vắng {flag.absences} buổi
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      SĐT Phụ huynh: <span className="font-mono text-sky-300">{flag.student.sdtPhuHuynh}</span>
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-rose-500/10">
                      <span>Số vé học bù còn lại: <strong className="text-amber-300 font-mono">{flag.student.soVeHocBu} vé</strong></span>
                      <span className="text-emerald-400">Đã cập nhật vé bù</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Gửi thông báo nhắc phí 1-Chạm qua Zalo / SMS / Email */}
      {reminderModalData && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setReminderModalData(null);
          }}
        >
          <div 
            className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Gửi Thông Báo Nhắc Phí Tức Thì</h3>
                  <p className="text-xs text-slate-400">Hệ thống thông báo tự động Royal School</p>
                </div>
              </div>
              <button 
                onClick={() => setReminderModalData(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Preview */}
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-white/5 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Học viên nhận:</span>
                <span className="font-bold text-white">{reminderModalData.studentName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Số điện thoại Phụ huynh:</span>
                <span className="font-mono text-sky-400 font-bold">{reminderModalData.parentPhone}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Lớp ngoại khóa:</span>
                <span className="font-medium text-slate-200">{reminderModalData.className}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Số tiền cần đóng:</span>
                <span className="font-mono text-amber-300 font-extrabold text-sm">
                  {reminderModalData.amount.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex justify-between items-start text-xs pt-2 border-t border-white/5">
                <span className="text-slate-400">Lý do:</span>
                <span className="text-slate-300 text-right max-w-xs">{reminderModalData.reason}</span>
              </div>
            </div>

            {/* QR Code preview */}
            <div className="bg-white p-3 rounded-2xl flex items-center gap-4 text-slate-900">
              <img 
                src={reminderModalData.qrUrl} 
                alt="VietQR" 
                className="w-24 h-24 object-contain rounded-lg border border-slate-200 shrink-0" 
              />
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-900">Mã VietQR Chuyển Khoản Nhanh</p>
                <p className="text-[11px] text-slate-600">Phụ huynh quét mã qua ứng dụng ngân hàng để tự động điền tiền và nội dung đối soát.</p>
                <p className="text-[10px] font-mono text-indigo-600 font-bold">MBBank - 02839110001</p>
              </div>
            </div>

            {/* Channels selection buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleConfirmSendReminder('zalo')}
                className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex flex-col items-center gap-1.5 transition cursor-pointer shadow-md"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Gửi Zalo ZNS</span>
              </button>

              <button
                onClick={() => handleConfirmSendReminder('sms')}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex flex-col items-center gap-1.5 border border-white/10 transition cursor-pointer"
              >
                <Send className="w-5 h-5 text-emerald-400" />
                <span>Gửi SMS Brand</span>
              </button>

              <button
                onClick={() => handleConfirmSendReminder('email')}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex flex-col items-center gap-1.5 border border-white/10 transition cursor-pointer"
              >
                <Mail className="w-5 h-5 text-amber-400" />
                <span>Gửi Email Báo Phí</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
