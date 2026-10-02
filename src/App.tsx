/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  HocVien,
  LopHoc,
  DanhSachLop,
  DiemDanh,
  GiaoVien,
  CoSo,
  MonHoc,
  INITIAL_HOC_VIEN,
  INITIAL_LOP_HOC,
  INITIAL_DANH_SACH_LOP,
  INITIAL_DIEM_DANH,
  INITIAL_GIAO_VIEN,
  INITIAL_CO_SO,
  INITIAL_MON_HOC,
  INITIAL_TRANSFERS,
  ClassTransferRecord,
  TuitionInvoice,
  InvoicePaymentStatus,
  INITIAL_INVOICES,
  calculateTuitionFee,
  generateVietQrUrl,
  calculateSessionsBetween,
  formatToVNDate,
  capitalizeWords,
} from './types.ts';
import {
  fetchBootstrapData,
  apiSaveStudent,
  apiDeleteStudent,
  apiSaveClass,
  apiDeleteClass,
  apiSaveBranch,
  apiDeleteBranch,
  apiSaveSubject,
  apiDeleteSubject,
  apiSaveTeacher,
  apiDeleteTeacher,
  apiSaveEnrollment,
  apiSaveAttendance,
  apiSaveTransfer,
  apiSaveInvoice,
  apiRecordPayment,
  apiResetDemoData,
  apiExecuteIndividualTransfer,
  apiExecuteBulkTransfer,
} from './lib/api.ts';
import AdminWeb from './components/AdminWeb.tsx';
import DashboardPanel from './components/DashboardPanel.tsx';
import TeacherMobile from './components/TeacherMobile.tsx';
import SchemaDoc from './components/SchemaDoc.tsx';
import ClassManager from './components/ClassManager.tsx';
import TeacherManager from './components/TeacherManager.tsx';
import StudentManager from './components/StudentManager.tsx';
import ScheduleManager from './components/ScheduleManager.tsx';
import GuideManager from './components/GuideManager.tsx';
import RoyalLogo from './components/RoyalLogo.tsx';
import LoginScreen from './components/LoginScreen.tsx';
import BranchManager from './components/BranchManager.tsx';
import SubjectManager from './components/SubjectManager.tsx';
import LogoManager from './components/LogoManager.tsx';
import ClassTransferManager from './components/ClassTransferManager.tsx';
import ClassTransferModal from './components/ClassTransferModal.tsx';
import AttendanceSheet from './components/AttendanceSheet.tsx';
import FacilityTimelineView from './components/FacilityTimelineView.tsx';
import TuitionBillingTab from './components/TuitionBillingTab.tsx';
import TuitionInvoiceModal from './components/TuitionInvoiceModal.tsx';
import { 
  Layers, 
  GraduationCap, 
  LayoutDashboard, 
  Database, 
  Smartphone, 
  Info, 
  RotateCcw, 
  CheckCircle2, 
  Ticket, 
  BookOpen, 
  Users, 
  ChevronDown, 
  UserCheck, 
  Download, 
  Trash2, 
  Calendar, 
  HelpCircle, 
  Plus, 
  X, 
  Phone, 
  LogOut, 
  User, 
  Building2,
  Award,
  Sparkles,
  Image as ImageIcon,
  ArrowRightLeft,
  Repeat,
  Receipt,
  BarChart3
} from 'lucide-react';

function calculateEndDate(startDateStr: string, classDays: string[], soBuoiHoc: number): string {
  if (!classDays || classDays.length === 0 || !soBuoiHoc) {
    const d = new Date(startDateStr);
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  }
  
  const dayMap: Record<string, number> = {
    'T2': 1, 'T3': 2, 'T4': 3, 'T5': 4, 'T6': 5, 'T7': 6, 'CN': 0
  };
  const targetDays = classDays.map(day => dayMap[day]).filter(val => val !== undefined);
  
  if (targetDays.length === 0) {
    const d = new Date(startDateStr);
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  }
  
  let currentDate = new Date(startDateStr);
  let sessionsCount = 0;
  
  while (sessionsCount < soBuoiHoc) {
    const dayOfWeek = currentDate.getDay();
    if (targetDays.includes(dayOfWeek)) {
      sessionsCount++;
      if (sessionsCount === soBuoiHoc) {
        break;
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return currentDate.toISOString().split('T')[0];
}

export default function App() {
  // State cốt lõi của hệ thống
  const [hocVienList, setHocVienList] = useState<HocVien[]>(INITIAL_HOC_VIEN);
  const [classes, setClasses] = useState<LopHoc[]>(INITIAL_LOP_HOC);
  const [danhSachLop, setDanhSachLop] = useState<DanhSachLop[]>(INITIAL_DANH_SACH_LOP);
  const [diemDanhList, setDiemDanhList] = useState<DiemDanh[]>(INITIAL_DIEM_DANH);
  const [giaoVienList, setGiaoVienList] = useState<GiaoVien[]>(INITIAL_GIAO_VIEN);
  const [coSoList, setCoSoList] = useState<CoSo[]>(INITIAL_CO_SO);
  const [monHocList, setMonHocList] = useState<MonHoc[]>(INITIAL_MON_HOC);
  const [transfersList, setTransfersList] = useState<ClassTransferRecord[]>(INITIAL_TRANSFERS);
  const [invoicesList, setInvoicesList] = useState<TuitionInvoice[]>(INITIAL_INVOICES);

  const [dbConnected, setDbConnected] = useState<boolean>(true);

  // Modal quản lý chuyển lớp & bù trừ học phí
  const [transferModalStudent, setTransferModalStudent] = useState<HocVien | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // State điều khiển Menu sổ xuống
  const [isMgmtOpen, setIsMgmtOpen] = useState(false);
  const [isDataOpen, setIsDataOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Tab điều hướng chính
  const [activeTab, setActiveTab] = useState<
    'admin' | 'teacher' | 'schema' | 'classes' | 'teachers' | 'students' | 'schedule' | 'branches' | 'subjects' | 'logo' | 'guide-experience' | 'guide-software' | 'transfers' | 'facilities' | 'attendance-sheet' | 'tuition'
  >('admin');

  // Chế độ hiển thị phân hệ Panel: 'dashboard' (Báo cáo tổng quan) | 'operations' (Bảng vận hành)
  const [panelViewMode, setPanelViewMode] = useState<'dashboard' | 'operations'>('dashboard');

  // Trạng thái xác thực / Đăng nhập
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(() => {
    const saved = localStorage.getItem('is_logged_in') || sessionStorage.getItem('is_logged_in');
    if (saved === 'true') {
      const u = localStorage.getItem('auth_username') || sessionStorage.getItem('auth_username') || 'Admin';
      return { username: u, role: 'Quản trị viên' };
    }
    return null;
  });

  const handleLogout = () => {
    localStorage.removeItem('is_logged_in');
    localStorage.removeItem('auth_username');
    sessionStorage.removeItem('is_logged_in');
    sessionStorage.removeItem('auth_username');
    setCurrentUser(null);
  };

  // State for global registration modal
  const [isGlobalRegisterOpen, setIsGlobalRegisterOpen] = useState(false);

  // Khóa cuộn màn hình chính (document.body.style.overflow = 'hidden') khi modal mở
  useEffect(() => {
    if (isGlobalRegisterOpen || isTransferModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || '';
      };
    }
  }, [isGlobalRegisterOpen, isTransferModalOpen]);

  const [globalStudentId, setGlobalStudentId] = useState('');
  const [globalStudentName, setGlobalStudentName] = useState('');
  const [globalStudentPhone, setGlobalStudentPhone] = useState('');
  const [globalParentName, setGlobalParentName] = useState('');
  const [globalDob, setGlobalDob] = useState('2018-01-01');
  const [globalGender, setGlobalGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Nam');
  const [globalStartDate, setGlobalStartDate] = useState('2026-07-01');
  const [globalSelectedClassId, setGlobalSelectedClassId] = useState('');
  const [globalSoBuoiHoc, setGlobalSoBuoiHoc] = useState<number>(24);
  const [globalCoSo, setGlobalCoSo] = useState<string>('');
  const [globalIsWaitingClass, setGlobalIsWaitingClass] = useState<boolean>(false);
  const [globalSelectedSubjects, setGlobalSelectedSubjects] = useState<string[]>([]);

  // Tải dữ liệu từ PostgreSQL API khi ứng dụng khởi chạy
  useEffect(() => {
    fetchBootstrapData()
      .then((data) => {
        if (data.students && data.students.length > 0) setHocVienList(data.students);
        if (data.classes && data.classes.length > 0) setClasses(data.classes);
        if (data.branches && data.branches.length > 0) setCoSoList(data.branches);
        if (data.subjects && data.subjects.length > 0) setMonHocList(data.subjects);
        if (data.teachers && data.teachers.length > 0) setGiaoVienList(data.teachers);
        if (data.enrollments && data.enrollments.length > 0) setDanhSachLop(data.enrollments);
        if (data.attendance && data.attendance.length > 0) setDiemDanhList(data.attendance);
        if (data.transfers && data.transfers.length > 0) setTransfersList(data.transfers);
        if (data.invoices && data.invoices.length > 0) setInvoicesList(data.invoices);
        setDbConnected(true);
      })
      .catch((err) => {
        console.warn('API bootstrap error, falling back to local cache:', err);
        setDbConnected(false);
      });
  }, []);

  const handleOpenGlobalRegister = () => {
    const maxNum = hocVienList.reduce((max, h) => {
      const num = parseInt(h.id.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const nextId = `HV${String(maxNum + 1).padStart(3, '0')}`;

    setGlobalStudentId(nextId);
    setGlobalStudentName('');
    setGlobalStudentPhone('');
    setGlobalParentName('');
    setGlobalDob('2018-01-01');
    setGlobalGender('Nam');
    setGlobalStartDate('2026-07-01');
    setGlobalSelectedClassId('');
    setGlobalSoBuoiHoc(24);
    setGlobalCoSo(coSoList[0]?.name || '');
    setGlobalIsWaitingClass(false);
    setGlobalSelectedSubjects([]);
    setIsGlobalRegisterOpen(true);
  };

  const handleSaveGlobalStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalStudentId.trim() || !globalStudentName.trim() || !globalStudentPhone.trim()) {
      alert('❌ Vui lòng điền đầy đủ các thông tin bắt buộc (Mã số, Họ tên, SĐT)!');
      return;
    }

    if (!globalIsWaitingClass && !globalStartDate) {
      alert('❌ Vui lòng chọn Ngày bắt đầu gói!');
      return;
    }

    if (globalIsWaitingClass && globalSelectedSubjects.length === 0) {
      alert('❌ Đối với học sinh chờ lớp, vui lòng chọn ít nhất một môn học đăng ký quan tâm!');
      return;
    }

    const cleanId = globalStudentId.trim().toUpperCase();

    const idExists = hocVienList.some((s) => s.id.toUpperCase() === cleanId);
    if (idExists) {
      alert(`❌ Mã số học viên "${cleanId}" đã tồn tại! Vui lòng nhập mã số khác.`);
      return;
    }

    let calculatedEndDate = '';
    const classIdToUse = globalIsWaitingClass ? '' : globalSelectedClassId;
    const foundClass = !globalIsWaitingClass ? classes.find(c => c.id === classIdToUse) : null;
    const effectiveStart = globalIsWaitingClass ? '' : globalStartDate;
    const effectiveSessions = globalIsWaitingClass ? 0 : Number(globalSoBuoiHoc);

    if (!globalIsWaitingClass && foundClass && foundClass.days && foundClass.days.length > 0) {
      calculatedEndDate = calculateEndDate(effectiveStart, foundClass.days, effectiveSessions);
    } else if (!globalIsWaitingClass) {
      const d = new Date(effectiveStart);
      d.setMonth(d.getMonth() + 3);
      calculatedEndDate = d.toISOString().split('T')[0];
    } else {
      calculatedEndDate = '';
    }

    const systemCurrentDateStr = '2026-07-09';
    const systemCurrentDate = new Date(systemCurrentDateStr);
    const calculatedStatus: 'Còn hạn' | 'Hết hạn' | 'Chờ lớp' = globalIsWaitingClass
      ? 'Chờ lớp'
      : (new Date(calculatedEndDate) >= systemCurrentDate ? 'Còn hạn' : 'Hết hạn');
    const chosenCoSo = globalCoSo || coSoList[0]?.name || '';

    const effectiveSubjects = globalIsWaitingClass
      ? globalSelectedSubjects
      : (foundClass ? [foundClass.tenMon] : (globalSelectedSubjects.length > 0 ? globalSelectedSubjects : []));

    const newStudent: HocVien = {
      id: cleanId,
      name: globalStudentName.trim(),
      sdtPhuHuynh: globalStudentPhone.trim(),
      hoTenPhuHuynh: globalParentName.trim() || undefined,
      ngaySinh: globalDob || undefined,
      gioiTinh: globalGender,
      ngayBatDau: effectiveStart,
      ngayKetThuc: calculatedEndDate,
      trangThai: calculatedStatus,
      soVeHocBu: 0,
      soBuoiHoc: effectiveSessions,
      lopChinhKhoa: globalIsWaitingClass ? 'Chờ xếp lớp' : (foundClass ? foundClass.tenMon : undefined),
      coSo: chosenCoSo || undefined,
      choXepLop: globalIsWaitingClass,
      danhSachMonHoc: effectiveSubjects,
    };

    setHocVienList((prev) => [...prev, newStudent]);
    apiSaveStudent(newStudent).catch(console.error);

    if (classIdToUse && !globalIsWaitingClass) {
      const newEnrollment: DanhSachLop = {
        id: `DSL_${Date.now()}`,
        idLop: classIdToUse,
        idHocVien: cleanId,
        loaiHocVien: 'Chính thức',
      };
      setDanhSachLop((prev) => [...prev, newEnrollment]);
      apiSaveEnrollment(newEnrollment).catch(console.error);
    }

    setIsGlobalRegisterOpen(false);
    alert(`🎉 Đăng ký học viên mới "${newStudent.name}" thành công! Dữ liệu đã lưu vào PostgreSQL.`);
  };

  const handleConfirmTransfer = (transferRecord: ClassTransferRecord) => {
    setTransfersList((prev) => [transferRecord, ...prev]);
    apiSaveTransfer(transferRecord).catch(console.error);

    // Update old enrollment status to 'transferred_out'
    const updatedDSL = danhSachLop.map((ds) => {
      if (ds.idHocVien === transferRecord.studentId && ds.idLop === transferRecord.fromClassId) {
        return { ...ds, status: 'transferred_out' as const };
      }
      return ds;
    });

    const isUnpaid = transferRecord.feeDifference > 0;
    const newEnrollment: DanhSachLop = {
      id: `DSL_${Date.now()}`,
      idLop: transferRecord.toClassId,
      idHocVien: transferRecord.studentId,
      loaiHocVien: 'Chính thức',
      status: 'active',
      remainingSessions: transferRecord.newClassRemainingSessions,
      paymentStatus: isUnpaid ? 'unpaid' : 'paid',
    };
    const finalDSL = [...updatedDSL, newEnrollment];
    setDanhSachLop(finalDSL);
    apiSaveEnrollment(newEnrollment).catch(console.error);

    // If surcharge is required, automatically generate tuition invoice
    if (transferRecord.feeDifference > 0) {
      const invoiceId = `INV_TRF_${Date.now()}`;
      const invoiceCode = `INV-TRF-${Date.now().toString().slice(-6)}`;
      const targetClass = classes.find(c => c.id === transferRecord.toClassId);
      const sessionRate = targetClass?.donGiaBuoi || 180000;

      const newInvoice: TuitionInvoice = {
        id: invoiceId,
        invoiceCode,
        studentId: transferRecord.studentId,
        studentName: transferRecord.studentName,
        classId: transferRecord.toClassId,
        className: transferRecord.toClassName,
        billingType: 'prorated_sessions',
        startSessionIndex: 1,
        sessionRate,
        registeredSessions: transferRecord.newClassRemainingSessions,
        totalSessionsInCourse: transferRecord.newClassRemainingSessions,
        subtotalAmount: transferRecord.feeDifference,
        paidAmount: 0,
        outstandingAmount: transferRecord.feeDifference,
        paymentStatus: 'unpaid',
        dueDate: transferRecord.transferDate,
        transferSyntax: `${transferRecord.studentId} ${transferRecord.toClassId.slice(-4)} ${invoiceCode}`,
        notes: `Thu bù chuyển lớp: [${transferRecord.fromClassName}] -> [${transferRecord.toClassName}]`,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };
      setInvoicesList((prev) => [newInvoice, ...prev]);
      apiSaveInvoice(newInvoice).catch(console.error);
    }

    const targetClass = classes.find(c => c.id === transferRecord.toClassId);
    const updatedHocVienList = hocVienList.map((hv) => {
      if (hv.id === transferRecord.studentId) {
        const updatedStudent = {
          ...hv,
          lopChinhKhoa: targetClass ? (targetClass.tenLop || targetClass.tenMon) : hv.lopChinhKhoa,
          coSo: targetClass?.coSo || hv.coSo,
          soBuoiHoc: transferRecord.newClassRemainingSessions,
        };
        apiSaveStudent(updatedStudent).catch(console.error);
        return updatedStudent;
      }
      return hv;
    });
    setHocVienList(updatedHocVienList);

    alert(
      `✅ Chuyển lớp thành công cho học viên ${transferRecord.studentName}!\n` +
      `• Lớp mới: ${transferRecord.toClassName}\n` +
      `• Quyết toán: ${transferRecord.feeDifference > 0 ? `Phụ huynh cần nộp thêm ${transferRecord.feeDifference.toLocaleString('vi-VN')} đ (Hệ thống đã tự động tạo phiếu báo phí)` : transferRecord.feeDifference < 0 ? `Bảo lưu ${Math.abs(transferRecord.feeDifference).toLocaleString('vi-VN')} đ vào ví học viên` : 'Tất toán ngang (0 đ)'}`
    );
  };

  const handleBulkTransfer = async (params: {
    fromClassId: string;
    toClassId: string;
    studentIds: string[];
    transferDate: string;
    reason: string;
  }) => {
    try {
      const res = await apiExecuteBulkTransfer({
        ...params,
        createdBy: currentUser?.username || 'Admin Giáo vụ',
      });

      // Synchronize with database
      const data = await fetchBootstrapData();
      if (data.students) setHocVienList(data.students);
      if (data.classes) setClasses(data.classes);
      if (data.enrollments) setDanhSachLop(data.enrollments);
      if (data.transfers) setTransfersList(data.transfers);
      if (data.invoices) setInvoicesList(data.invoices);

      alert(`🎉 ${res.message}`);
    } catch (err: any) {
      console.error('Error executing bulk transfer:', err);
      throw err;
    }
  };

  const handleAddInvoice = (newInvoice: TuitionInvoice) => {
    setInvoicesList((prev) => [newInvoice, ...prev]);
    apiSaveInvoice(newInvoice).catch(console.error);
  };

  const handleRecordPayment = (invoiceId: string, paidAmount: number) => {
    setInvoicesList((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const newPaid = inv.paidAmount + paidAmount;
          const newOutstanding = Math.max(0, inv.subtotalAmount - newPaid);
          const newStatus: InvoicePaymentStatus = newOutstanding === 0 ? 'paid' : 'partially_paid';
          return {
            ...inv,
            paidAmount: newPaid,
            outstandingAmount: newOutstanding,
            paymentStatus: newStatus,
            paidAt: newStatus === 'paid' ? new Date().toLocaleString('vi-VN') : inv.paidAt,
          };
        }
        return inv;
      })
    );
    apiRecordPayment(invoiceId, paidAmount).catch(console.error);
    alert(`✅ Đã ghi nhận thu ${paidAmount.toLocaleString('vi-VN')} đ thành công và lưu vào PostgreSQL!`);
  };

  const handleAddCoSo = (newCoSo: CoSo) => {
    setCoSoList((prev) => [newCoSo, ...prev]);
    apiSaveBranch(newCoSo).catch(console.error);
    alert(`🏢 Đã thêm cơ sở "${newCoSo.name}" thành công!`);
  };

  const handleUpdateCoSo = (updatedCoSo: CoSo) => {
    setCoSoList((prev) => prev.map((c) => (c.id === updatedCoSo.id ? updatedCoSo : c)));
    apiSaveBranch(updatedCoSo).catch(console.error);
    alert(`🏢 Đã cập nhật cơ sở "${updatedCoSo.name}" thành công!`);
  };

  const handleDeleteCoSo = (coSoId: string) => {
    setCoSoList((prev) => prev.filter((c) => c.id !== coSoId));
    apiDeleteBranch(coSoId).catch(console.error);
    alert(`🏢 Đã xóa cơ sở khỏi hệ thống thành công!`);
  };

  const handleAddMonHoc = (newMonHoc: MonHoc) => {
    setMonHocList((prev) => [newMonHoc, ...prev]);
    apiSaveSubject(newMonHoc).catch(console.error);
    alert(`🎯 Đã thêm môn học "${newMonHoc.tenMon}" thành công!`);
  };

  const handleUpdateMonHoc = (updatedMonHoc: MonHoc) => {
    setMonHocList((prev) => prev.map((m) => (m.id === updatedMonHoc.id ? updatedMonHoc : m)));
    apiSaveSubject(updatedMonHoc).catch(console.error);
    alert(`🎯 Đã cập nhật môn học "${updatedMonHoc.tenMon}" thành công!`);
  };

  const handleDeleteMonHoc = (monHocId: string) => {
    setMonHocList((prev) => prev.filter((m) => m.id !== monHocId));
    apiDeleteSubject(monHocId).catch(console.error);
    alert(`🎯 Đã xóa môn học khỏi hệ thống thành công!`);
  };

  const handleSaveDiemDanh = (
    idLop: string,
    ngayHoc: string,
    attendanceData: {
      idHocVien: string;
      trangThai: 'Có mặt' | 'Vắng có phép' | 'Vắng không phép';
      nhanXetRieng: string;
    }[],
    nhanXetChung: string,
    images: string[]
  ) => {
    let updatedHocVienList = [...hocVienList];
    let updatedDiemDanhList = [...diemDanhList];

    const recordsToSave: DiemDanh[] = [];

    attendanceData.forEach((record) => {
      const existingIndex = updatedDiemDanhList.findIndex(
        (dd) => dd.idLop === idLop && dd.ngayHoc === ngayHoc && dd.idHocVien === record.idHocVien
      );

      const oldTrangThai = existingIndex !== -1 ? updatedDiemDanhList[existingIndex].trangThai : null;
      const newTrangThai = record.trangThai;

      let ticketChange = 0;
      if (oldTrangThai !== 'Vắng có phép' && newTrangThai === 'Vắng có phép') {
        ticketChange = 1;
      } else if (oldTrangThai === 'Vắng có phép' && newTrangThai !== 'Vắng có phép') {
        ticketChange = -1;
      }

      if (ticketChange !== 0) {
        updatedHocVienList = updatedHocVienList.map((hv) => {
          if (hv.id === record.idHocVien) {
            const updatedHv = {
              ...hv,
              soVeHocBu: Math.max(0, hv.soVeHocBu + ticketChange),
            };
            apiSaveStudent(updatedHv).catch(console.error);
            return updatedHv;
          }
          return hv;
        });
      }

      const newDiemDanhRecord: DiemDanh = {
        id: existingIndex !== -1 ? updatedDiemDanhList[existingIndex].id : `DD_${Date.now()}_${record.idHocVien}`,
        idLop,
        ngayHoc,
        idHocVien: record.idHocVien,
        trangThai: record.trangThai,
        nhanXetRieng: record.nhanXetRieng,
        hinhAnh: images,
      };

      recordsToSave.push(newDiemDanhRecord);

      if (existingIndex !== -1) {
        updatedDiemDanhList[existingIndex] = newDiemDanhRecord;
      } else {
        updatedDiemDanhList.push(newDiemDanhRecord);
      }
    });

    setHocVienList(updatedHocVienList);
    setDiemDanhList(updatedDiemDanhList);
    apiSaveAttendance(recordsToSave).catch(console.error);
  };

  const handleEnrollStudent = (idLop: string, idHocVien: string, loaiHocVien: 'Chính thức' | 'Học bù') => {
    const newEnrollment: DanhSachLop = {
      id: `DSL_${Date.now()}`,
      idLop,
      idHocVien,
      loaiHocVien,
    };

    setDanhSachLop((prev) => [...prev, newEnrollment]);
    apiSaveEnrollment(newEnrollment).catch(console.error);

    if (loaiHocVien === 'Học bù') {
      setHocVienList((prev) =>
        prev.map((hv) => {
          if (hv.id === idHocVien) {
            const updated = {
              ...hv,
              soVeHocBu: Math.max(0, hv.soVeHocBu - 1),
            };
            apiSaveStudent(updated).catch(console.error);
            return updated;
          }
          return hv;
        })
      );
    }
  };

  const handleAddHocVien = (student: HocVien) => {
    setHocVienList((prev) => [...prev, student]);
    apiSaveStudent(student).catch(console.error);
  };

  const handleEditHocVien = (student: HocVien) => {
    setHocVienList((prev) => prev.map((hv) => (hv.id === student.id ? student : hv)));
    apiSaveStudent(student).catch(console.error);
  };

  const handleDeleteHocVien = (studentId: string) => {
    setHocVienList((prev) => prev.filter((hv) => hv.id !== studentId));
    setDanhSachLop((prev) => prev.filter((item) => item.idHocVien !== studentId));
    apiDeleteStudent(studentId).catch(console.error);
  };

  const handleAddClass = (classData: Omit<LopHoc, 'id'>) => {
    const maxNum = classes.reduce((max, c) => {
      const num = parseInt(c.id.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const nextId = `LH${String(maxNum + 1).padStart(3, '0')}`;
    const newClass: LopHoc = {
      ...classData,
      id: nextId,
    };

    setClasses((prev) => [...prev, newClass]);
    apiSaveClass(newClass).catch(console.error);
  };

  const handleEditClass = (classData: LopHoc) => {
    setClasses((prev) => prev.map((c) => (c.id === classData.id ? classData : c)));
    apiSaveClass(classData).catch(console.error);
  };

  const handleDeleteClass = (classId: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== classId));
    setDanhSachLop((prev) => prev.filter((item) => item.idLop !== classId));
    apiDeleteClass(classId).catch(console.error);
  };

  const handleAddTeacher = (teacherData: Omit<GiaoVien, 'id'>) => {
    const maxNum = giaoVienList.reduce((max, t) => {
      const num = parseInt(t.id.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const nextId = `GV${String(maxNum + 1).padStart(3, '0')}`;
    const newTeacher: GiaoVien = {
      ...teacherData,
      id: nextId,
    };

    setGiaoVienList((prev) => [...prev, newTeacher]);
    apiSaveTeacher(newTeacher).catch(console.error);
  };

  const handleEditTeacher = (teacherData: GiaoVien) => {
    setGiaoVienList((prev) => prev.map((t) => (t.id === teacherData.id ? teacherData : t)));
    apiSaveTeacher(teacherData).catch(console.error);
  };

  const handleDeleteTeacher = (teacherId: string) => {
    setGiaoVienList((prev) => prev.filter((t) => t.id !== teacherId));
    apiDeleteTeacher(teacherId).catch(console.error);
  };

  const handleResetData = async () => {
    if (window.confirm('Bạn có chắc chắn muốn làm mới toàn bộ dữ liệu mẫu hệ thống? Cơ sở dữ liệu Cloud SQL PostgreSQL sẽ được nạp lại bộ demo chuẩn mới nhất.')) {
      try {
        await apiResetDemoData();
        const data = await fetchBootstrapData();
        if (data.students) setHocVienList(data.students);
        if (data.classes) setClasses(data.classes);
        if (data.branches) setCoSoList(data.branches);
        if (data.subjects) setMonHocList(data.subjects);
        if (data.teachers) setGiaoVienList(data.teachers);
        if (data.enrollments) setDanhSachLop(data.enrollments);
        if (data.attendance) setDiemDanhList(data.attendance);
        if (data.transfers) setTransfersList(data.transfers);
        if (data.invoices) setInvoicesList(data.invoices);
        setDbConnected(true);
        alert('🎉 Đã thiết lập thành công toàn bộ dữ liệu Demo mới vào Cloud SQL PostgreSQL!');
      } catch (e) {
        console.error('Error resetting demo data:', e);
        setHocVienList(INITIAL_HOC_VIEN);
        setClasses(INITIAL_LOP_HOC);
        setDanhSachLop(INITIAL_DANH_SACH_LOP);
        setDiemDanhList(INITIAL_DIEM_DANH);
        setGiaoVienList(INITIAL_GIAO_VIEN);
        setCoSoList(INITIAL_CO_SO);
        setMonHocList(INITIAL_MON_HOC);
        setTransfersList(INITIAL_TRANSFERS);
        setInvoicesList(INITIAL_INVOICES);
        alert('Đã khôi phục dữ liệu mẫu thành công!');
      }
    }
  };

  const handleBackupData = () => {
    try {
      const backupObj = {
        hoc_vien_list: hocVienList,
        classes_list: classes,
        danh_sach_lop: danhSachLop,
        diem_danh_list: diemDanhList,
        giao_vien_list: giaoVienList,
        co_so_list: coSoList,
        mon_hoc_list: monHocList,
        transfers_list: transfersList,
        invoices_list: invoicesList,
        database: 'PostgreSQL (Cloud SQL)',
        backup_at: new Date().toISOString(),
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `royal_extracurricular_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      alert('📦 Đã xuất file backup dữ liệu thành công dưới dạng JSON!');
    } catch (error) {
      alert('❌ Có lỗi xảy ra khi sao lưu dữ liệu!');
    }
  };

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-100 selection:bg-sky-500/30 selection:text-white">
      <div className="mesh-bg"></div>
      
      {/* Top Navigation Header */}
      <header className="bg-slate-950/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 shadow-lg" id="main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <RoyalLogo className="w-11 h-11 drop-shadow-[0_0_10px_rgba(243,181,26,0.35)] shrink-0" />
              <div>
                <h1 className="text-md sm:text-lg font-display font-extrabold tracking-tight text-white leading-tight uppercase flex items-center gap-2">
                  <span>Royal Extracurricular Class</span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <Database className="w-2.5 h-2.5 text-emerald-400" />
                    PostgreSQL Live
                  </span>
                </h1>
                <span className="text-[10px] text-amber-400 font-extrabold tracking-widest uppercase block -mt-0.5">
                  Royal International School
                </span>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex space-x-1.5 items-center">
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setIsMgmtOpen(false);
                  setIsDataOpen(false);
                  setIsGuideOpen(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-sky-500 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Panel
              </button>

              <button
                onClick={() => {
                  setActiveTab('schedule');
                  setIsMgmtOpen(false);
                  setIsDataOpen(false);
                  setIsGuideOpen(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'schedule'
                    ? 'bg-sky-500 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Lịch học
              </button>

              {/* Grouped Management Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsMgmtOpen(!isMgmtOpen);
                    setIsDataOpen(false);
                    setIsGuideOpen(false);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'students' || activeTab === 'classes' || activeTab === 'teachers' || activeTab === 'branches' || activeTab === 'subjects' || activeTab === 'transfers' || activeTab === 'facilities' || activeTab === 'attendance-sheet'
                      ? 'bg-sky-500 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Quản lý
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMgmtOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMgmtOpen && (
                  <div className="absolute top-full left-0 mt-1.5 w-60 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl p-1 z-50 animate-fade-in flex flex-col gap-0.5">
                    <button
                      onClick={() => {
                        setActiveTab('students');
                        setIsMgmtOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                        activeTab === 'students'
                          ? 'bg-sky-500 text-slate-950 shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Users className="w-4 h-4 text-sky-400" />
                      Quản lý Học viên
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('classes');
                        setIsMgmtOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                        activeTab === 'classes'
                          ? 'bg-sky-500 text-slate-950 shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      Quản lý Lớp học
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('subjects');
                        setIsMgmtOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                        activeTab === 'subjects'
                          ? 'bg-sky-500 text-slate-950 shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Award className="w-4 h-4 text-sky-400" />
                      Quản lý Môn học
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('teachers');
                        setIsMgmtOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                        activeTab === 'teachers'
                          ? 'bg-sky-500 text-slate-950 shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 text-rose-400" />
                      Quản lý Giáo viên
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('branches');
                        setIsMgmtOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                        activeTab === 'branches'
                          ? 'bg-sky-500 text-slate-950 shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-amber-400" />
                      Quản lý Cơ sở
                    </button>

                    <div className="border-t border-white/10 my-1"></div>

                    <button
                      onClick={() => {
                        setActiveTab('transfers');
                        setIsMgmtOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                        activeTab === 'transfers'
                          ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                          : 'text-amber-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                      <span>Chuyển lớp &amp; Bù trừ phí</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('tuition');
                        setIsMgmtOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                        activeTab === 'tuition'
                          ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                          : 'text-emerald-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Receipt className="w-4 h-4 text-emerald-400" />
                      <span>Quản lý Học phí &amp; Báo phí</span>
                      <span className="text-[9px] bg-emerald-400/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono ml-auto font-bold">VietQR</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('facilities');
                        setIsMgmtOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                        activeTab === 'facilities'
                          ? 'bg-sky-500 text-slate-950 shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-sky-400" />
                      Lưới Sân bãi &amp; Phòng học
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('attendance-sheet');
                        setIsMgmtOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                        activeTab === 'attendance-sheet'
                          ? 'bg-emerald-500 text-slate-950 shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      Sổ Điểm danh điện tử
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setActiveTab('teacher');
                  setIsMgmtOpen(false);
                  setIsDataOpen(false);
                  setIsGuideOpen(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'teacher'
                    ? 'bg-sky-500 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Mobile App
              </button>

              {/* Grouped Data Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsDataOpen(!isDataOpen);
                    setIsMgmtOpen(false);
                    setIsGuideOpen(false);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'schema' || activeTab === 'logo'
                      ? 'bg-sky-500 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
                  }`}
                >
                  <Database className="w-4 h-4" />
                  Dữ liệu (PostgreSQL)
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDataOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDataOpen && (
                  <div className="absolute top-full left-0 mt-1.5 w-52 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl p-1 z-50 animate-fade-in flex flex-col gap-0.5">
                    <button
                      onClick={() => {
                        setActiveTab('schema');
                        setIsDataOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                        activeTab === 'schema'
                          ? 'bg-sky-500 text-slate-950 shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Database className="w-4 h-4 text-sky-400" />
                      Cơ sở dữ liệu PostgreSQL
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('logo');
                        setIsDataOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                        activeTab === 'logo'
                          ? 'bg-sky-500 text-slate-950 shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4 text-amber-400" />
                      Quản lý hình logo
                    </button>
                    <button
                      onClick={() => {
                        handleBackupData();
                        setIsDataOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer text-slate-300 hover:text-white hover:bg-white/5"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      Backup
                    </button>
                    <button
                      onClick={() => {
                        handleResetData();
                        setIsDataOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer text-slate-300 hover:text-rose-400 hover:bg-rose-950/20"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                      Reset data
                    </button>
                  </div>
                )}
              </div>

              {/* Grouped Guide Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsGuideOpen(!isGuideOpen);
                    setIsMgmtOpen(false);
                    setIsDataOpen(false);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'guide-experience' || activeTab === 'guide-software'
                      ? 'bg-sky-500 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  Hướng dẫn
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isGuideOpen ? 'rotate-180' : ''}`} />
                </button>

                {isGuideOpen && (
                  <div className="absolute top-full left-0 mt-1.5 w-56 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl p-1 z-50 animate-fade-in flex flex-col gap-0.5">
                    <button
                      onClick={() => {
                        setActiveTab('guide-experience');
                        setIsGuideOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                        activeTab === 'guide-experience'
                          ? 'bg-sky-500 text-slate-950 shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Layers className="w-4 h-4 text-sky-400" />
                      Hướng dẫn trải nghiệm
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('guide-software');
                        setIsGuideOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                        activeTab === 'guide-software'
                          ? 'bg-sky-500 text-slate-950 shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      Hướng dẫn sử dụng
                    </button>
                  </div>
                )}
              </div>
            </nav>

            {/* Desktop User Info & Logout Button */}
            <div className="hidden md:flex items-center gap-2 pl-2">
              <div className="flex items-center gap-2 bg-slate-900/80 border border-white/10 px-2.5 py-1.5 rounded-xl shadow-sm">
                <div className="relative">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center font-bold text-sky-400 text-xs">
                    AD
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900"></div>
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-bold text-white leading-none flex items-center gap-1.5">
                    {currentUser.username}
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-semibold px-1.5 py-0.2 rounded border border-emerald-500/30">Online</span>
                  </div>
                  <div className="text-[10px] text-amber-400 font-medium mt-0.5">{currentUser.role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Đăng xuất khỏi hệ thống"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition ml-1 cursor-pointer flex items-center gap-1 text-xs font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline text-[11px]">Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Dynamic Mobile Navigator Tabs */}
        <div className="flex md:hidden bg-slate-950/40 backdrop-blur-md border border-white/10 p-1 rounded-xl shadow-sm gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              setActiveTab('admin');
              setIsMgmtOpen(false);
              setIsDataOpen(false);
              setIsGuideOpen(false);
            }}
            className={`flex-shrink-0 px-3 py-2 text-center text-[10px] font-bold rounded-lg transition ${
              activeTab === 'admin' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-400'
            }`}
          >
            Panel
          </button>

          <button
            onClick={() => {
              setActiveTab('schedule');
              setIsMgmtOpen(false);
              setIsDataOpen(false);
              setIsGuideOpen(false);
            }}
            className={`flex-shrink-0 px-3 py-2 text-center text-[10px] font-bold rounded-lg transition ${
              activeTab === 'schedule' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-400'
            }`}
          >
            Lịch học
          </button>

          <div className="relative flex-shrink-0">
            <button
              onClick={() => {
                setIsMgmtOpen(!isMgmtOpen);
                setIsDataOpen(false);
                setIsGuideOpen(false);
              }}
              className={`px-3 py-2 text-center text-[10px] font-bold rounded-lg transition flex items-center gap-1 ${
                activeTab === 'students' || activeTab === 'classes' || activeTab === 'teachers' || activeTab === 'branches' || activeTab === 'subjects'
                  ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>
                {activeTab === 'students'
                  ? 'Quản lý Học viên ▾'
                  : activeTab === 'classes'
                    ? 'Quản lý Lớp học ▾'
                    : activeTab === 'subjects'
                      ? 'Quản lý Môn học ▾'
                      : activeTab === 'teachers'
                        ? 'Quản lý Giáo viên ▾'
                        : activeTab === 'branches'
                          ? 'Quản lý Cơ sở ▾'
                          : 'Quản lý ▾'}
              </span>
            </button>
            {isMgmtOpen && (
              <div className="absolute top-full left-0 mt-1 w-44 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-1 z-50 flex flex-col gap-0.5">
                <button
                  onClick={() => {
                    setActiveTab('students');
                    setIsMgmtOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-[10px] font-bold transition ${
                    activeTab === 'students' ? 'bg-sky-500 text-slate-950' : 'text-slate-200 hover:bg-white/5'
                  }`}
                >
                  Quản lý Học viên
                </button>
                <button
                  onClick={() => {
                    setActiveTab('classes');
                    setIsMgmtOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-[10px] font-bold transition ${
                    activeTab === 'classes' ? 'bg-sky-500 text-slate-950' : 'text-slate-200 hover:bg-white/5'
                  }`}
                >
                  Quản lý Lớp học
                </button>
                <button
                  onClick={() => {
                    setActiveTab('subjects');
                    setIsMgmtOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-[10px] font-bold transition ${
                    activeTab === 'subjects' ? 'bg-sky-500 text-slate-950' : 'text-slate-200 hover:bg-white/5'
                  }`}
                >
                  Quản lý Môn học
                </button>
                <button
                  onClick={() => {
                    setActiveTab('teachers');
                    setIsMgmtOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-[10px] font-bold transition ${
                    activeTab === 'teachers' ? 'bg-sky-500 text-slate-950' : 'text-slate-200 hover:bg-white/5'
                  }`}
                >
                  Quản lý Giáo viên
                </button>
                <button
                  onClick={() => {
                    setActiveTab('branches');
                    setIsMgmtOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-[10px] font-bold transition ${
                    activeTab === 'branches' ? 'bg-sky-500 text-slate-950' : 'text-slate-200 hover:bg-white/5'
                  }`}
                >
                  Quản lý Cơ sở
                </button>
                <div className="border-t border-white/10 my-0.5"></div>
                <button
                  onClick={() => {
                    setActiveTab('transfers');
                    setIsMgmtOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-[10px] font-bold transition ${
                    activeTab === 'transfers' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'text-amber-400 hover:bg-white/5'
                  }`}
                >
                  Chuyển lớp &amp; Bù trừ phí
                </button>
                <button
                  onClick={() => {
                    setActiveTab('tuition');
                    setIsMgmtOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-[10px] font-bold transition ${
                    activeTab === 'tuition' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'text-emerald-400 hover:bg-white/5'
                  }`}
                >
                  Học phí &amp; Báo phí VietQR
                </button>
                <button
                  onClick={() => {
                    setActiveTab('facilities');
                    setIsMgmtOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-[10px] font-bold transition ${
                    activeTab === 'facilities' ? 'bg-sky-500 text-slate-950' : 'text-slate-200 hover:bg-white/5'
                  }`}
                >
                  Lưới Sân bãi &amp; Phòng học
                </button>
                <button
                  onClick={() => {
                    setActiveTab('attendance-sheet');
                    setIsMgmtOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-[10px] font-bold transition ${
                    activeTab === 'attendance-sheet' ? 'bg-emerald-500 text-slate-950' : 'text-slate-200 hover:bg-white/5'
                  }`}
                >
                  Sổ Điểm danh điện tử
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setActiveTab('teacher');
              setIsMgmtOpen(false);
              setIsDataOpen(false);
              setIsGuideOpen(false);
            }}
            className={`flex-shrink-0 px-3 py-2 text-center text-[10px] font-bold rounded-lg transition ${
              activeTab === 'teacher' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-400'
            }`}
          >
            Mobile App
          </button>

          <button
            onClick={() => {
              setActiveTab('schema');
              setIsMgmtOpen(false);
              setIsDataOpen(false);
              setIsGuideOpen(false);
            }}
            className={`flex-shrink-0 px-3 py-2 text-center text-[10px] font-bold rounded-lg transition ${
              activeTab === 'schema' ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400'
            }`}
          >
            PostgreSQL
          </button>
        </div>

        {/* Tab: Quản lý Logo trường & Dữ liệu */}
        {activeTab === 'logo' && (
          <div className="space-y-3">
            <SchemaDoc initialSubTab="logo" />
          </div>
        )}

        {/* Tab 1: Admin Panel & Executive Dashboard */}
        {activeTab === 'admin' && (
          <div className="space-y-4">
            {/* View Mode Switcher Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 backdrop-blur-md p-2 rounded-2xl border border-white/10">
              <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-white/5">
                <button
                  onClick={() => setPanelViewMode('dashboard')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    panelViewMode === 'dashboard'
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-amber-300" />
                  <span>Báo Cáo Tổng Quan (Dashboard Panel)</span>
                </button>

                <button
                  onClick={() => setPanelViewMode('operations')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    panelViewMode === 'operations'
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-300" />
                  <span>Bảng Vận Hành &amp; Điểm Danh (Operations Table)</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 px-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>PostgreSQL Cloud SQL • Đồng bộ trực tiếp</span>
              </div>
            </div>

            {/* Sub-view: Dashboard Panel */}
            {panelViewMode === 'dashboard' ? (
              <DashboardPanel
                hocVienList={hocVienList}
                classes={classes}
                danhSachLop={danhSachLop}
                diemDanhList={diemDanhList}
                giaoVienList={giaoVienList}
                coSoList={coSoList}
                monHocList={monHocList}
                transfersList={transfersList}
                invoicesList={invoicesList}
                onNavigateTab={(tab) => setActiveTab(tab as any)}
                onOpenRegister={handleOpenGlobalRegister}
              />
            ) : (
              <AdminWeb
                hocVienList={hocVienList}
                classes={classes}
                danhSachLop={danhSachLop}
                coSoList={coSoList}
                monHocList={monHocList}
                onAddHocVien={handleAddHocVien}
                onEnrollStudent={handleEnrollStudent}
                onAddClass={handleAddClass}
                onResetData={handleResetData}
                onOpenRegister={handleOpenGlobalRegister}
              />
            )}
          </div>
        )}

        {/* Tab 3: Full Screen Teacher Mobile Simulator */}
        {activeTab === 'teacher' && (
          <div className="space-y-4 flex flex-col items-center">
            <div className="w-full text-center space-y-1">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Phân hệ Giáo viên (Mô phỏng Mobile)</h2>
              <p className="text-xs text-slate-500">Giao diện tối ưu dọc trên điện thoại iOS / Android của Giáo viên</p>
            </div>
            <TeacherMobile
              hocVienList={hocVienList}
              classes={classes}
              danhSachLop={danhSachLop}
              diemDanhList={diemDanhList}
              onSaveDiemDanh={handleSaveDiemDanh}
            />
          </div>
        )}

        {/* Tab: Student Management */}
        {activeTab === 'students' && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Phân hệ Quản lý Học viên (Đầy đủ Chức năng)</h2>
            <StudentManager
              students={hocVienList}
              classes={classes}
              danhSachLop={danhSachLop}
              diemDanhList={diemDanhList}
              monHocList={monHocList}
              coSoList={coSoList}
              onAddStudent={handleAddHocVien}
              onEditStudent={handleEditHocVien}
              onDeleteStudent={handleDeleteHocVien}
              onEnrollStudent={handleEnrollStudent}
              onOpenRegister={handleOpenGlobalRegister}
              onOpenTransferModal={(student) => {
                setTransferModalStudent(student);
                setIsTransferModalOpen(true);
              }}
            />
          </div>
        )}

        {/* Tab: Class Management */}
        {activeTab === 'classes' && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Phân hệ Quản lý Lớp học (Đầy đủ Chức năng)</h2>
            <ClassManager
              classes={classes}
              danhSachLop={danhSachLop}
              monHocList={monHocList}
              coSoList={coSoList}
              onAddClass={handleAddClass}
              onEditClass={handleEditClass}
              onDeleteClass={handleDeleteClass}
            />
          </div>
        )}

        {/* Tab: Subject Management */}
        {activeTab === 'subjects' && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Phân hệ Quản lý Môn học Ngoại khóa</h2>
            <SubjectManager
              monHocList={monHocList}
              classes={classes}
              onAddMonHoc={handleAddMonHoc}
              onUpdateMonHoc={handleUpdateMonHoc}
              onDeleteMonHoc={handleDeleteMonHoc}
            />
          </div>
        )}

        {/* Tab: Teacher Management */}
        {activeTab === 'teachers' && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Phân hệ Quản lý Giáo viên (Đầy đủ Chức năng)</h2>
            <TeacherManager
              teachers={giaoVienList}
              classes={classes}
              onAddTeacher={handleAddTeacher}
              onEditTeacher={handleEditTeacher}
              onDeleteTeacher={handleDeleteTeacher}
            />
          </div>
        )}

        {/* Tab: Branch Management */}
        {activeTab === 'branches' && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Phân hệ Quản lý Cơ sở học</h2>
            <BranchManager
              coSoList={coSoList}
              hocVienList={hocVienList}
              classes={classes}
              onAddCoSo={handleAddCoSo}
              onUpdateCoSo={handleUpdateCoSo}
              onDeleteCoSo={handleDeleteCoSo}
            />
          </div>
        )}

        {/* Tab: Interactive Database Schema Documentation */}
        {activeTab === 'schema' && (
          <SchemaDoc initialSubTab="schema" />
        )}

        {/* Tab: Schedule Management (Lịch học) */}
        {activeTab === 'schedule' && (
          <div className="space-y-3">
            <ScheduleManager
              classes={classes}
              danhSachLop={danhSachLop}
            />
          </div>
        )}

        {/* Tab: Academic Transfers & Tuition Reconciliation */}
        {activeTab === 'transfers' && (
          <ClassTransferManager
            transfers={transfersList}
            students={hocVienList}
            classes={classes}
            danhSachLop={danhSachLop}
            diemDanhList={diemDanhList}
            monHocList={monHocList}
            onConfirmTransfer={handleConfirmTransfer}
          />
        )}

        {/* Tab: Tuition Management & Billing Notifications */}
        {activeTab === 'tuition' && (
          <TuitionBillingTab
            invoices={invoicesList}
            students={hocVienList}
            classes={classes}
            monHocList={monHocList}
            onAddInvoice={handleAddInvoice}
            onRecordPayment={handleRecordPayment}
          />
        )}

        {/* Tab: Facility Matrix Timeline */}
        {activeTab === 'facilities' && (
          <FacilityTimelineView
            classes={classes}
            danhSachLop={danhSachLop}
          />
        )}

        {/* Tab: Attendance Sheet (Mobile 1-touch optimized) */}
        {activeTab === 'attendance-sheet' && (
          <AttendanceSheet
            classes={classes}
            students={hocVienList}
            danhSachLop={danhSachLop}
            diemDanhList={diemDanhList}
            onSaveAttendance={(records) => {
              const updatedDiemDanh = [...diemDanhList];
              records.forEach((rec) => {
                const idx = updatedDiemDanh.findIndex(
                  (d) => d.idLop === rec.idLop && d.ngayHoc === rec.ngayHoc && d.idHocVien === rec.idHocVien
                );
                if (idx !== -1) {
                  updatedDiemDanh[idx] = rec;
                } else {
                  updatedDiemDanh.push(rec);
                }
              });
              setDiemDanhList(updatedDiemDanh);
              apiSaveAttendance(records).catch(console.error);
            }}
          />
        )}

        {/* Tab: Hướng dẫn trải nghiệm */}
        {activeTab === 'guide-experience' && (
          <GuideManager
            type="experience"
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              setIsMgmtOpen(false);
              setIsDataOpen(false);
              setIsGuideOpen(false);
            }}
          />
        )}

        {/* Tab: Hướng dẫn sử dụng phần mềm */}
        {activeTab === 'guide-software' && (
          <GuideManager
            type="software"
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              setIsMgmtOpen(false);
              setIsDataOpen(false);
              setIsGuideOpen(false);
            }}
          />
        )}

      </main>

      {/* Footer Design */}
      <footer className="bg-slate-950/50 border-t border-white/10 py-6 text-slate-400 mt-auto backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <RoyalLogo className="w-5 h-5 opacity-85 shrink-0" />
            <p className="text-xs">© 2026 Royal International School - Hệ Thống Đồng Bộ Lớp Học Ngoại Khóa.</p>
          </div>
          <p className="font-mono text-[10px] text-slate-500">Full-Stack Architecture: React 19 + Express API + PostgreSQL (Cloud SQL) + Drizzle ORM + Firebase Auth</p>
        </div>
      </footer>

      {/* GLOBAL POPUP: Đăng ký học viên toàn trang */}
      {isGlobalRegisterOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsGlobalRegisterOpen(false);
          }}
        >
          <div 
            className="glass-panel max-w-lg w-full overflow-hidden shadow-2xl border border-white/20 rounded-2xl flex flex-col my-auto max-h-[92vh] text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900/80 border-b border-white/10 text-white px-6 py-4 flex justify-between items-center backdrop-blur-lg">
              <div className="flex items-center gap-2.5">
                <RoyalLogo className="w-6 h-6 drop-shadow-[0_0_5px_rgba(243,181,26,0.3)] shrink-0" />
                <h3 className="font-display font-extrabold text-base tracking-wide uppercase">
                  Đăng Ký Học Viên
                </h3>
              </div>
              <button
                onClick={() => setIsGlobalRegisterOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg transition duration-200 cursor-pointer p-1 hover:bg-white/5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGlobalStudent} className="flex-1 overflow-y-auto scrollbar-thin">
              <div className="p-6 space-y-4 text-xs">
                
                {/* ID & Name row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">
                      Mã học viên <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: HV001"
                      value={globalStudentId}
                      onChange={(e) => setGlobalStudentId(e.target.value)}
                      className="w-full bg-slate-900/60 border border-white/15 focus:border-sky-500/50 rounded-xl px-3 py-2.5 text-white text-xs font-mono font-bold placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">
                      Họ và tên học sinh <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Lê Quỳnh Chi"
                      value={globalStudentName}
                      onChange={(e) => setGlobalStudentName(capitalizeWords(e.target.value))}
                      className="w-full bg-slate-900/60 border border-white/15 focus:border-sky-500/50 rounded-xl px-3 py-2.5 text-white text-xs font-bold placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/30 capitalize"
                    />
                  </div>
                </div>

                {/* Parents info row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">
                      Họ tên phụ huynh
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Nguyễn Văn B"
                      value={globalParentName}
                      onChange={(e) => setGlobalParentName(capitalizeWords(e.target.value))}
                      className="w-full bg-slate-900/60 border border-white/15 focus:border-sky-500/50 rounded-xl px-3 py-2.5 text-white text-xs font-medium placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/30 capitalize"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">
                      Số điện thoại phụ huynh <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ví dụ: 0912345678"
                      value={globalStudentPhone}
                      onChange={(e) => setGlobalStudentPhone(e.target.value)}
                      className="w-full bg-slate-900/60 border border-white/15 focus:border-sky-500/50 rounded-xl px-3 py-2.5 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                    />
                  </div>
                </div>

                {/* DOB & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      value={globalDob}
                      onChange={(e) => setGlobalDob(e.target.value)}
                      className="w-full bg-slate-900/60 border border-white/15 focus:border-sky-500/50 rounded-xl px-3 py-2.5 text-white text-xs font-mono cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">
                      Giới tính
                    </label>
                    <select
                      value={globalGender}
                      onChange={(e) => setGlobalGender(e.target.value as 'Nam' | 'Nữ' | 'Khác')}
                      className="w-full bg-slate-900 border border-white/15 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium cursor-pointer text-slate-200"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>

                {/* Checkbox Học sinh chờ lớp */}
                <div className="bg-slate-900/90 p-3.5 rounded-xl border border-amber-500/30 flex items-center justify-between">
                  <label htmlFor="checkbox-global-cho-xep-lop" className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      id="checkbox-global-cho-xep-lop"
                      type="checkbox"
                      checked={globalIsWaitingClass}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setGlobalIsWaitingClass(checked);
                        if (checked) {
                          setGlobalSelectedClassId('');
                        } else {
                          setGlobalSelectedSubjects([]);
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-white text-xs flex items-center gap-1.5">
                        Học sinh chờ lớp
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Khi chọn mục này, phần chọn môn học đăng ký sẽ được kích hoạt để phụ huynh đăng ký môn chờ lớp
                      </span>
                    </div>
                  </label>
                  {globalIsWaitingClass && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                      Chờ xếp lớp
                    </span>
                  )}
                </div>

                {/* Phần chọn Môn học */}
                <div className={`space-y-2 bg-slate-900/60 p-3.5 rounded-xl border transition-all duration-200 ${
                  globalIsWaitingClass 
                    ? 'border-amber-500/40 bg-slate-900/90 shadow-md ring-1 ring-amber-500/20' 
                    : 'border-white/10 opacity-40 pointer-events-none'
                }`}>
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5 text-xs">
                      <Award className={`w-3.5 h-3.5 ${globalIsWaitingClass ? 'text-amber-400' : 'text-slate-500'}`} />
                      Môn học đăng ký {globalIsWaitingClass && <span className="text-rose-400">*</span>}
                      <span className="text-[10px] text-slate-400 font-normal lowercase">(chọn được nhiều môn)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {globalIsWaitingClass ? (
                        <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                          Đã kích hoạt: {globalSelectedSubjects.length} môn
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic font-mono bg-white/5 px-2 py-0.5 rounded">
                          Chưa kích hoạt (Chỉ áp dụng khi chọn Chờ lớp)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                    {monHocList.map((mh) => {
                      const isSelected = globalSelectedSubjects.includes(mh.tenMon);
                      return (
                        <button
                          key={mh.id}
                          type="button"
                          disabled={!globalIsWaitingClass}
                          onClick={() => {
                            if (isSelected) {
                              setGlobalSelectedSubjects((prev) => prev.filter((m) => m !== mh.tenMon));
                            } else {
                              setGlobalSelectedSubjects((prev) => [...prev, mh.tenMon]);
                            }
                          }}
                          className={`p-2 rounded-xl text-left border transition text-xs flex items-center justify-between gap-1 cursor-pointer disabled:cursor-not-allowed ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md'
                              : 'bg-slate-950/50 text-slate-300 hover:text-white hover:bg-white/5 border-white/10'
                          }`}
                        >
                          <span className="truncate">{mh.tenMon}</span>
                          {isSelected ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {!globalIsWaitingClass ? (
                    <p className="text-[10px] text-slate-400 italic">
                      💡 Mục chọn môn học sẽ được kích hoạt khi bạn tích chọn ô <strong>"Học sinh chờ lớp"</strong> ở trên.
                    </p>
                  ) : globalSelectedSubjects.length === 0 ? (
                    <p className="text-[10px] text-amber-400 italic">
                      ⚠️ Vui lòng nhấp chọn các môn học học sinh có nguyện vọng đăng ký chờ lớp.
                    </p>
                  ) : null}
                </div>

                {/* Cơ sở học */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    Cơ sở học <span className="text-rose-400">*</span>
                  </label>
                  <select
                    id="select-global-coso"
                    value={globalCoSo}
                    onChange={(e) => setGlobalCoSo(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium cursor-pointer text-slate-200"
                  >
                    <option value="">-- Chọn cơ sở học tập --</option>
                    {coSoList.map((cs) => (
                      <option key={cs.id} value={cs.name} className="bg-slate-950 text-white">
                        {cs.name} ({cs.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Class select */}
                <div className={`space-y-1.5 transition-opacity ${globalIsWaitingClass ? 'opacity-30 pointer-events-none' : ''}`}>
                  <div className="flex justify-between items-center">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">
                      Xếp trực tiếp vào lớp
                    </label>
                    {globalIsWaitingClass && (
                      <span className="text-[10px] text-amber-400 font-semibold italic">(Đã khóa do chọn Học sinh chờ lớp)</span>
                    )}
                  </div>
                  <select
                    id="select-global-enroll-class"
                    disabled={globalIsWaitingClass}
                    value={globalSelectedClassId}
                    onChange={(e) => {
                      const classId = e.target.value;
                      setGlobalSelectedClassId(classId);
                      if (classId) {
                        const foundClass = classes.find(c => c.id === classId);
                        if (foundClass) {
                          const effStart = globalStartDate || foundClass.ngayBatDau || '2026-07-01';
                          if (!globalStartDate && foundClass.ngayBatDau) {
                            setGlobalStartDate(foundClass.ngayBatDau);
                          }
                          const autoSessions = calculateSessionsBetween(
                            effStart,
                            foundClass.ngayBatDau,
                            foundClass.ngayKetThuc,
                            foundClass.days,
                            foundClass.soBuoiHoc
                          );
                          setGlobalSoBuoiHoc(autoSessions);
                        }
                      }
                    }}
                    className="w-full bg-slate-900 border border-white/15 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium cursor-pointer text-slate-200 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Không xếp lớp ngay --</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-950 text-white">
                        {c.tenLop ? `${c.tenLop} (${c.tenMon})` : c.tenMon} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration row */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-opacity ${globalIsWaitingClass ? 'opacity-30 pointer-events-none' : ''}`}>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block font-bold text-slate-400 uppercase tracking-wide">
                        Ngày bắt đầu gói {!globalIsWaitingClass && <span className="text-rose-400">*</span>}
                      </label>
                      {globalIsWaitingClass && (
                        <span className="text-[10px] text-amber-400 font-semibold italic">(Khóa)</span>
                      )}
                    </div>
                    <input
                      id="input-global-start-date"
                      type="date"
                      required={!globalIsWaitingClass}
                      disabled={globalIsWaitingClass}
                      value={globalStartDate}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setGlobalStartDate(newDate);
                        if (globalSelectedClassId) {
                          const foundClass = classes.find(c => c.id === globalSelectedClassId);
                          if (foundClass) {
                            const autoSessions = calculateSessionsBetween(
                              newDate,
                              foundClass.ngayBatDau,
                              foundClass.ngayKetThuc,
                              foundClass.days,
                              foundClass.soBuoiHoc
                            );
                            setGlobalSoBuoiHoc(autoSessions);
                          }
                        }
                      }}
                      className="w-full bg-slate-900/60 border border-white/15 focus:border-sky-500/50 rounded-xl px-3 py-2.5 text-white text-xs font-mono cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500/30 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block font-bold text-slate-400 uppercase tracking-wide">
                        Số buổi học đăng ký {!globalIsWaitingClass && <span className="text-rose-400">*</span>}
                      </label>
                      {globalIsWaitingClass && (
                        <span className="text-[10px] text-amber-400 font-semibold italic">(Khóa)</span>
                      )}
                    </div>
                    <input
                      id="input-global-so-buoi"
                      type="number"
                      required={!globalIsWaitingClass}
                      disabled={globalIsWaitingClass}
                      min={0}
                      max={100}
                      value={globalSoBuoiHoc}
                      onChange={(e) => setGlobalSoBuoiHoc(Number(e.target.value))}
                      className="w-full bg-slate-900/60 border border-white/15 focus:border-sky-500/50 rounded-xl px-3 py-2.5 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-sky-500/30 disabled:cursor-not-allowed font-bold"
                    />
                    {globalSelectedClassId && !globalIsWaitingClass && (() => {
                      const foundClass = classes.find(c => c.id === globalSelectedClassId);
                      if (!foundClass) return null;
                      const isAfter = foundClass.ngayKetThuc && globalStartDate > foundClass.ngayKetThuc;
                      return (
                        <div className={`text-[10px] font-medium flex items-start gap-1 mt-1 ${isAfter ? 'text-rose-400' : 'text-emerald-400'}`}>
                          <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          {isAfter ? (
                            <span>⚠️ Ngày bắt đầu ({formatToVNDate(globalStartDate)}) sau ngày kết thúc lớp ({formatToVNDate(foundClass.ngayKetThuc)}).</span>
                          ) : (
                            <span>
                              ⚡ Tự tính: <strong>{globalSoBuoiHoc} buổi</strong> (từ {formatToVNDate(globalStartDate)} đến kết thúc lớp {formatToVNDate(foundClass.ngayKetThuc || foundClass.ngayBatDau)})
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 flex gap-2 text-slate-300">
                  <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] leading-relaxed">
                    Dữ liệu đăng ký mới sẽ tự động cập nhật lên hệ thống PostgreSQL và lưu trữ tập trung đồng bộ tức thì.
                  </p>
                </div>

              </div>

              <div className="bg-slate-950/40 px-6 py-4 border-t border-white/10 flex justify-end gap-2.5 sticky bottom-0 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setIsGlobalRegisterOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition active:scale-95 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl font-bold transition active:scale-95 shadow-lg shadow-sky-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Đăng Ký Học Viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Class Transfer Modal */}
      <ClassTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setTransferModalStudent(null);
        }}
        student={transferModalStudent}
        classes={classes}
        danhSachLop={danhSachLop}
        diemDanhList={diemDanhList}
        monHocList={monHocList}
        onConfirmTransfer={handleConfirmTransfer}
      />
    </div>
  );
}
