/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { HocVien, LopHoc, DanhSachLop, formatToVNDate, CoSo, MonHoc, calculateEndDate, calculateSessionsBetween, capitalizeWords } from '../types';
import RoyalLogo from './RoyalLogo';
import { 
  Users, 
  BookOpen, 
  Clock, 
  Ticket, 
  AlertCircle, 
  Plus, 
  Calendar, 
  ShieldAlert, 
  UserCheck, 
  Filter, 
  Search, 
  RefreshCw, 
  Layers, 
  Check, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  Building2,
  Award,
  CheckCircle2,
  Hourglass,
  CalendarCheck,
  Calculator,
  Sparkles,
  MapPin,
  Database
} from 'lucide-react';

interface AdminWebProps {
  hocVienList: HocVien[];
  classes: LopHoc[];
  danhSachLop: DanhSachLop[];
  coSoList?: CoSo[];
  monHocList?: MonHoc[];
  onAddHocVien: (student: HocVien) => void;
  onEnrollStudent: (idLop: string, idHocVien: string, loaiHocVien: 'Chính thức' | 'Học bù') => void;
  onAddClass: (classData: Omit<LopHoc, 'id'>) => void;
  onResetData: () => void;
  onOpenRegister?: () => void;
}

function removeVietnameseTones(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export default function AdminWeb({
  hocVienList,
  classes,
  danhSachLop,
  coSoList = [],
  monHocList = [],
  onAddHocVien,
  onEnrollStudent,
  onAddClass,
  onResetData,
  onOpenRegister,
}: AdminWebProps) {
  // Bộ lọc
  const [filterType, setFilterType] = useState<'all' | 'expiring' | 'has_ticket' | 'expired' | 'waiting'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Phân trang: Giới hạn danh sách học viên là 10 học viên
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Quản lý Modal Học Bù
  const [makeupModalOpen, setMakeupModalOpen] = useState<boolean>(false);
  const [selectedStudentForMakeup, setSelectedStudentForMakeup] = useState<HocVien | null>(null);
  const [targetClassForMakeup, setTargetClassForMakeup] = useState<string>('');

  // Quản lý Modal Thêm Học Viên & Đăng ký Lớp học
  const [addStudentModalOpen, setAddStudentModalOpen] = useState<boolean>(false);
  const [newStudentId, setNewStudentId] = useState<string>('');
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [newStudentPhone, setNewStudentPhone] = useState<string>('');
  const [newStudentParentName, setNewStudentParentName] = useState<string>('');
  const [newStudentRegularClass, setNewStudentRegularClass] = useState<string>('');
  const [newStudentDob, setNewStudentDob] = useState<string>('2018-01-01');
  const [newStudentGender, setNewStudentGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Nam');
  const [newStudentStart, setNewStudentStart] = useState<string>('2026-07-01');
  const [newStudentSoBuoiHoc, setNewStudentSoBuoiHoc] = useState<number>(24);
  const [selectedEnrollClass, setSelectedEnrollClass] = useState<string>('');
  const [newStudentCoSo, setNewStudentCoSo] = useState<string>('');
  const [isWaitingClass, setIsWaitingClass] = useState<boolean>(false);
  const [newStudentSubjects, setNewStudentSubjects] = useState<string[]>([]);

  // Quản lý Modal Thêm Lớp học mới
  const [addClassModalOpen, setAddClassModalOpen] = useState<boolean>(false);

  // Khóa cuộn màn hình chính (document.body.style.overflow = 'hidden') khi modal mở
  useEffect(() => {
    if (makeupModalOpen || addStudentModalOpen || addClassModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || '';
      };
    }
  }, [makeupModalOpen, addStudentModalOpen, addClassModalOpen]);
  const [newClassSubject, setNewClassSubject] = useState<string>('');
  const [newClassTenLop, setNewClassTenLop] = useState<string>('');
  const [newClassCoSo, setNewClassCoSo] = useState<string>('');
  const [newClassRoom, setNewClassRoom] = useState<string>('');
  const [newClassCapacity, setNewClassCapacity] = useState<number>(12);
  const [newClassDays, setNewClassDays] = useState<string[]>(['T2', 'T4']);
  const [newClassTime, setNewClassTime] = useState<string>('17:30');
  const [newClassSoBuoiHoc, setNewClassSoBuoiHoc] = useState<number>(24);
  const [newClassStartDate, setNewClassStartDate] = useState<string>('2026-07-01');

  // Tính thời gian kết thúc tự động dựa trên số buổi học và ngày học
  const newClassEndDate = useMemo(() => {
    if (!newClassStartDate || newClassDays.length === 0 || !newClassSoBuoiHoc) return '';
    return calculateEndDate(newClassStartDate, newClassDays, Number(newClassSoBuoiHoc));
  }, [newClassStartDate, newClassDays, newClassSoBuoiHoc]);

  // Ngày hiện tại làm mốc để lọc gói sắp hết hạn (Giả định hệ thống là tháng 7/2026)
  const systemCurrentDateStr = '2026-07-09';
  const systemCurrentDate = new Date(systemCurrentDateStr);

  const getSiSoThucTe = (lopId: string) => {
    return danhSachLop.filter((item) => item.idLop === lopId).length;
  };

  const getClassesOfStudent = (studentId: string) => {
    const list = danhSachLop.filter((item) => item.idHocVien === studentId);
    return list.map((item) => {
      const cls = classes.find((c) => c.id === item.idLop);
      return {
        id: item.idLop,
        name: cls?.tenMon || 'Lớp ẩn',
        type: item.loaiHocVien,
        schedule: cls?.lichHocCoDinh || '',
        days: cls?.days || [],
        time: cls?.time || '',
      };
    });
  };

  const filteredStudents = hocVienList.filter((student) => {
    const termRaw = searchTerm.trim().toLowerCase();
    if (termRaw) {
      const termNorm = removeVietnameseTones(termRaw);
      const studentClasses = getClassesOfStudent(student.id);

      const studentNameNorm = removeVietnameseTones(student.name);
      const studentIdNorm = removeVietnameseTones(student.id);
      const parentNameNorm = removeVietnameseTones(student.hoTenPhuHuynh || '');
      const parentPhoneClean = (student.sdtPhuHuynh || '').replace(/\s+/g, '');
      const termPhoneClean = termRaw.replace(/\s+/g, '');
      const classRegNorm = removeVietnameseTones(student.lopChinhKhoa || '');
      const coSoNorm = removeVietnameseTones(student.coSo || '');
      const subjectsStr = (student.danhSachMonHoc || []).join(' ');
      const subjectsNorm = removeVietnameseTones(subjectsStr);

      const matchesSearch =
        (student.hoTenPhuHuynh || '').toLowerCase().includes(termRaw) ||
        parentNameNorm.includes(termNorm) ||
        (student.sdtPhuHuynh || '').includes(termRaw) ||
        parentPhoneClean.includes(termPhoneClean) ||
        (student.lopChinhKhoa || '').toLowerCase().includes(termRaw) ||
        classRegNorm.includes(termNorm) ||
        subjectsNorm.includes(termNorm) ||
        studentClasses.some(
          (c) =>
            c.name.toLowerCase().includes(termRaw) ||
            removeVietnameseTones(c.name).includes(termNorm) ||
            c.id.toLowerCase().includes(termRaw)
        ) ||
        student.id.toLowerCase().includes(termRaw) ||
        studentIdNorm.includes(termNorm) ||
        student.name.toLowerCase().includes(termRaw) ||
        studentNameNorm.includes(termNorm) ||
        (student.coSo || '').toLowerCase().includes(termRaw) ||
        coSoNorm.includes(termNorm);

      if (!matchesSearch) return false;
    }

    if (filterType === 'all') return true;
    if (filterType === 'waiting') return student.choXepLop === true || student.trangThai === 'Chờ lớp';
    if (filterType === 'has_ticket') return student.soVeHocBu > 0;
    if (filterType === 'expired') {
      if (student.choXepLop || student.trangThai === 'Chờ lớp') return false;
      const endDate = new Date(student.ngayKetThuc);
      return endDate < systemCurrentDate || student.trangThai === 'Hết hạn';
    }
    if (filterType === 'expiring') {
      if (student.choXepLop || student.trangThai === 'Chờ lớp') return false;
      const endDate = new Date(student.ngayKetThuc);
      const diffTime = endDate.getTime() - systemCurrentDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 30;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const displayedStudents = filteredStudents.slice(
    (validCurrentPage - 1) * pageSize,
    validCurrentPage * pageSize
  );

  const openMakeupModal = (student: HocVien) => {
    setSelectedStudentForMakeup(student);
    setTargetClassForMakeup('');
    setMakeupModalOpen(true);
  };

  const handleConfirmMakeup = () => {
    if (!selectedStudentForMakeup || !targetClassForMakeup) return;

    const studentId = selectedStudentForMakeup.id;
    const classId = targetClassForMakeup;

    const currentSiSo = getSiSoThucTe(classId);
    const targetClass = classes.find((c) => c.id === classId);
    
    if (!targetClass) return;

    if (currentSiSo >= targetClass.siSoToiDa) {
      alert(`❌ [Chặn Đăng Ký]: Lớp ${targetClass.tenMon} đã đạt sĩ số tối đa (${targetClass.siSoToiDa}/${targetClass.siSoToiDa}). Vui lòng chọn lớp khác!`);
      return;
    }

    const alreadyEnrolled = danhSachLop.some(
      (item) => item.idLop === classId && item.idHocVien === studentId
    );
    if (alreadyEnrolled) {
      alert(`❌ Học viên ${selectedStudentForMakeup.name} đã đăng ký lớp học này rồi!`);
      return;
    }

    const clash = checkLichTrungLap(studentId, classId);
    if (clash) {
      alert(`❌ [Trùng lịch học]: Học viên ${selectedStudentForMakeup.name} đã có tên trong danh sách lớp "${clash.clashingClassName}" (${clash.schedule}) trùng ngày và giờ học.`);
      return;
    }

    onEnrollStudent(classId, studentId, 'Học bù');
    setMakeupModalOpen(false);
    setSelectedStudentForMakeup(null);
  };

  const checkLichTrungLap = (studentId: string, targetLopId: string) => {
    const targetLop = classes.find((c) => c.id === targetLopId);
    if (!targetLop) return null;

    const studentClasses = getClassesOfStudent(studentId);
    for (const enrolled of studentClasses) {
      const hasOverlapDay = enrolled.days.some((d) => targetLop.days.includes(d));
      const hasSameTime = enrolled.time === targetLop.time;
      if (hasOverlapDay && hasSameTime) {
        return {
          clashingClassName: enrolled.name,
          schedule: enrolled.schedule,
        };
      }
    }
    return null;
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentId || !newStudentName || !newStudentPhone) {
      alert('Vui lòng điền đầy đủ Mã số học viên, Họ tên và Số điện thoại!');
      return;
    }

    if (!isWaitingClass && !newStudentStart) {
      alert('Vui lòng chọn Ngày bắt đầu gói học!');
      return;
    }

    if (isWaitingClass && newStudentSubjects.length === 0) {
      alert('❌ Đối với học sinh chờ lớp, vui lòng chọn ít nhất một môn học đăng ký quan tâm!');
      return;
    }

    const studentIdClean = newStudentId.trim().toUpperCase();

    const idExists = hocVienList.some(
      (hv) => hv.id.trim().toUpperCase() === studentIdClean
    );
    if (idExists) {
      alert(`❌ Mã số học viên "${studentIdClean}" đã tồn tại trong hệ thống. Vui lòng chọn mã số khác!`);
      return;
    }

    let calculatedEndDate = '';
    const classIdToUse = isWaitingClass ? '' : selectedEnrollClass;
    const foundClass = !isWaitingClass ? classes.find(c => c.id === classIdToUse) : null;
    const effectiveStart = isWaitingClass ? '' : newStudentStart;
    const effectiveSessions = isWaitingClass ? 0 : Number(newStudentSoBuoiHoc);

    if (!isWaitingClass && foundClass && foundClass.days && foundClass.days.length > 0) {
      calculatedEndDate = calculateEndDate(effectiveStart, foundClass.days, effectiveSessions);
    } else if (!isWaitingClass) {
      const d = new Date(effectiveStart);
      d.setMonth(d.getMonth() + 3);
      calculatedEndDate = d.toISOString().split('T')[0];
    } else {
      calculatedEndDate = '';
    }

    const calculatedStatus: 'Còn hạn' | 'Hết hạn' | 'Chờ lớp' = isWaitingClass
      ? 'Chờ lớp'
      : (new Date(calculatedEndDate) >= systemCurrentDate ? 'Còn hạn' : 'Hết hạn');
    const defaultCoSo = newStudentCoSo || (coSoList && coSoList[0]?.name) || '';

    const effectiveSubjects = isWaitingClass
      ? newStudentSubjects
      : (foundClass ? [foundClass.tenMon] : (newStudentSubjects.length > 0 ? newStudentSubjects : []));

    const studentData: HocVien = {
      id: studentIdClean,
      name: newStudentName,
      sdtPhuHuynh: newStudentPhone,
      ngayBatDau: effectiveStart,
      ngayKetThuc: calculatedEndDate,
      trangThai: calculatedStatus,
      soVeHocBu: 0,
      hoTenPhuHuynh: newStudentParentName.trim() || undefined,
      lopChinhKhoa: isWaitingClass ? 'Chờ xếp lớp' : (foundClass ? foundClass.tenMon : (newStudentRegularClass.trim() || undefined)),
      ngaySinh: newStudentDob || undefined,
      gioiTinh: newStudentGender,
      soBuoiHoc: effectiveSessions,
      coSo: defaultCoSo || undefined,
      choXepLop: isWaitingClass,
      danhSachMonHoc: effectiveSubjects,
    };

    onAddHocVien(studentData);
    
    if (classIdToUse && !isWaitingClass) {
      onEnrollStudent(classIdToUse, studentIdClean, 'Chính thức');
    }
    
    setNewStudentId('');
    setNewStudentName('');
    setNewStudentPhone('');
    setNewStudentParentName('');
    setNewStudentRegularClass('');
    setNewStudentDob('2018-01-01');
    setNewStudentGender('Nam');
    setSelectedEnrollClass('');
    setNewStudentSoBuoiHoc(24);
    setIsWaitingClass(false);
    setNewStudentSubjects([]);
    setAddStudentModalOpen(false);
  };

  const handleEnrollDirect = (studentId: string, classId: string, type: 'Chính thức' | 'Học bù') => {
    const targetClass = classes.find((c) => c.id === classId);
    if (!targetClass) return;

    const currentSiSo = getSiSoThucTe(classId);
    if (currentSiSo >= targetClass.siSoToiDa) {
      alert(`❌ [Chặn Đăng Ký]: Lớp ${targetClass.tenMon} đã đủ sĩ số tối đa (${targetClass.siSoToiDa}/${targetClass.siSoToiDa}). Không thể thêm học viên mới.`);
      return;
    }

    const clash = checkLichTrungLap(studentId, classId);
    if (clash) {
      const student = hocVienList.find((h) => h.id === studentId);
      alert(`❌ [Trùng lịch học]: Học sinh ${student?.name || ''} đã có tên trong danh sách lớp "${clash.clashingClassName}" (${clash.schedule}) trùng ngày và giờ học.`);
      return;
    }

    onEnrollStudent(classId, studentId, type);
    alert('Đăng ký lớp học thành công!');
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassSubject.trim()) {
      alert('❌ Vui lòng chọn môn học từ dữ liệu hệ thống!');
      return;
    }
    if (!newClassTenLop.trim()) {
      alert('❌ Vui lòng nhập Tên lớp học!');
      return;
    }
    if (!newClassCoSo.trim()) {
      alert('❌ Vui lòng chọn Cơ sở học!');
      return;
    }
    if (!newClassRoom.trim() || newClassDays.length === 0) {
      alert('❌ Vui lòng điền phòng học và chọn ít nhất một ngày học!');
      return;
    }
    if (!newClassStartDate) {
      alert('❌ Vui lòng chọn Thời gian bắt đầu!');
      return;
    }

    const isDuplicate = classes.some(
      (c) =>
        (c.tenLop?.trim().toLowerCase() === newClassTenLop.trim().toLowerCase() ||
          c.tenMon.trim().toLowerCase() === newClassTenLop.trim().toLowerCase())
    );
    if (isDuplicate) {
      alert(`⚠️ Tên lớp học "${newClassTenLop}" đã tồn tại! Vui lòng đặt tên khác.`);
      return;
    }

    const lichHocStr = `${newClassDays.join(', ')} lúc ${newClassTime}`;

    onAddClass({
      tenMon: newClassSubject.trim(),
      tenLop: newClassTenLop.trim(),
      coSo: newClassCoSo.trim(),
      phongHoc: newClassRoom.trim(),
      siSoToiDa: Number(newClassCapacity),
      lichHocCoDinh: lichHocStr,
      days: newClassDays,
      time: newClassTime,
      soBuoiHoc: Number(newClassSoBuoiHoc),
      ngayBatDau: newClassStartDate,
      ngayKetThuc: newClassEndDate,
      trangThai: 'Đang hoạt động',
    });

    setNewClassSubject('');
    setNewClassTenLop('');
    setNewClassCoSo('');
    setNewClassRoom('');
    setNewClassDays(['T2', 'T4']);
    setNewClassSoBuoiHoc(24);
    setNewClassStartDate('2026-07-01');
    setAddClassModalOpen(false);
    alert(`🎉 Thêm lớp học "${newClassTenLop}" thành công!`);
  };

  const toggleDaySelection = (day: string) => {
    if (newClassDays.includes(day)) {
      setNewClassDays((prev) => prev.filter((d) => d !== day));
    } else {
      setNewClassDays((prev) => [...prev, day]);
    }
  };

  const isNewClassNameDuplicate = newClassTenLop.trim() !== '' && classes.some(
    (c) =>
      c.tenLop?.trim().toLowerCase() === newClassTenLop.trim().toLowerCase() ||
      c.tenMon.trim().toLowerCase() === newClassTenLop.trim().toLowerCase()
  );

  const activeClassesCount = classes.filter((c) => c.trangThai === 'Đang hoạt động' || !c.trangThai).length;
  const closedClassesCount = classes.filter((c) => c.trangThai === 'Đã khóa').length;
  const upcomingClassesCount = classes.filter((c) => c.trangThai === 'Dự kiến').length;
  const totalCapacity = classes.reduce((sum, c) => sum + c.siSoToiDa, 0);
  const totalEnrolled = classes.reduce((sum, c) => sum + getSiSoThucTe(c.id), 0);
  const fillRate = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in" id="admin-web-section">
      {/* Top Banner & Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card border border-white/10 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl shrink-0">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Lớp đang hoạt động</span>
            <span className="text-lg font-display font-bold text-white">{activeClassesCount} lớp</span>
          </div>
        </div>

        <div className="glass-card border border-white/10 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Lớp đã đóng</span>
            <span className="text-lg font-display font-bold text-white">{closedClassesCount} lớp</span>
          </div>
        </div>

        <div className="glass-card border border-white/10 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Lớp chuẩn bị mở</span>
            <span className="text-lg font-display font-bold text-white">{upcomingClassesCount} lớp</span>
          </div>
        </div>

        <div className="glass-card border border-white/10 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Học viên đang học</span>
            <span className="text-lg font-display font-bold text-white">{totalEnrolled} HS</span>
          </div>
        </div>

        <div className="glass-card border border-white/10 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-sky-400/10 text-sky-300 border border-sky-400/20 rounded-xl shrink-0">
            <Database className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Tỷ lệ lấp đầy</span>
            <span className="text-lg font-display font-bold text-sky-400">{fillRate}%</span>
          </div>
        </div>
      </div>

      {/* Main Admin Workspace Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column: Students list & control table */}
        <div className="xl:col-span-2 glass-panel rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <RoyalLogo className="w-6 h-6 shrink-0" />
                <h3 className="text-lg font-display font-bold text-white">Danh Sách Học Viên Ngoại Khóa</h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-them-hoc-vien"
                onClick={onOpenRegister}
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-[0_0_15px_rgba(56,189,248,0.25)] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                ĐĂNG KÝ HỌC VIÊN
              </button>

              <button
                onClick={onResetData}
                title="Khôi phục dữ liệu ban đầu để kiểm thử"
                className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold p-2.5 rounded-xl transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search bar & Filter Pills */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-student-input"
                type="text"
                placeholder="Tìm theo tên phụ huynh, SĐT phụ huynh, lớp học, mã học viên..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full glass-input rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none text-white placeholder-slate-500"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
              <button
                onClick={() => {
                  setFilterType('all');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-sky-500 text-slate-950 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                Tất cả ({hocVienList.length})
              </button>

              <button
                id="filter-waiting-btn"
                onClick={() => {
                  setFilterType('waiting');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  filterType === 'waiting'
                    ? 'bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                    : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20'
                }`}
              >
                <Hourglass className="w-3.5 h-3.5" />
                Chờ lớp ({hocVienList.filter((h) => h.choXepLop || h.trangThai === 'Chờ lớp').length})
              </button>

              <button
                id="filter-ticket-btn"
                onClick={() => {
                  setFilterType('has_ticket');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  filterType === 'has_ticket'
                    ? 'bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                    : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                Có vé học bù ({hocVienList.filter((h) => h.soVeHocBu > 0).length})
              </button>

              <button
                id="filter-expiring-btn"
                onClick={() => {
                  setFilterType('expiring');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  filterType === 'expiring'
                    ? 'bg-sky-400 text-slate-950 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                    : 'bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 border border-sky-500/20'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Sắp hết hạn
              </button>

              <button
                onClick={() => {
                  setFilterType('expired');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  filterType === 'expired'
                    ? 'bg-rose-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                    : 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Hết hạn
              </button>
            </div>
          </div>

          {/* Student Table */}
          <div className="overflow-x-auto border border-white/10 rounded-xl bg-slate-950/20">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Học viên / SĐT</th>
                  <th className="py-3 px-4">Môn học đăng ký</th>
                  <th className="py-3 px-4">Lớp tham gia</th>
                  <th className="py-3 px-4">Gói Thời Hạn (Tháng/Quý)</th>
                  <th className="py-3 px-4 text-center">Vé bù tồn</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {displayedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500 font-medium">
                      Không tìm thấy học viên nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  displayedStudents.map((student) => {
                    const studentClasses = getClassesOfStudent(student.id);
                    const isWaiting = student.choXepLop === true || student.trangThai === 'Chờ lớp';
                    const isExpiringSoon = !isWaiting && (() => {
                      if (!student.ngayKetThuc) return false;
                      const endDate = new Date(student.ngayKetThuc);
                      const diffTime = endDate.getTime() - systemCurrentDate.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays >= 0 && diffDays <= 30 && student.trangThai === 'Còn hạn';
                    })();

                    return (
                      <tr key={student.id} className="hover:bg-white/5 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-100 text-sm">{student.name}</span>
                            <span className="text-[10px] bg-sky-500/10 text-sky-400 font-mono font-bold px-1.5 py-0.5 rounded border border-sky-500/20 shadow-sm" title="Mã số học viên">
                              {student.id}
                            </span>
                            {student.gioiTinh && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                student.gioiTinh === 'Nam' ? 'bg-sky-500/10 text-sky-300' : student.gioiTinh === 'Nữ' ? 'bg-rose-500/10 text-rose-300' : 'bg-slate-500/10 text-slate-300'
                              }`}>
                                {student.gioiTinh}
                              </span>
                            )}
                          </div>
                          
                          <div className="text-[10px] text-slate-400 space-y-0.5 mt-1 font-sans">
                            {student.ngaySinh && (
                              <div><span className="text-slate-500">Ngày sinh:</span> <span className="font-mono text-slate-300">{formatToVNDate(student.ngaySinh)}</span></div>
                            )}
                            <div><span className="text-slate-500">Phụ huynh:</span> <span className="text-slate-300">{student.hoTenPhuHuynh || 'Chưa cập nhật'}</span> <span className="text-slate-500 font-mono">({student.sdtPhuHuynh})</span></div>
                            {student.coSo && (
                              <div><span className="text-slate-500">Cơ sở:</span> <span className="text-amber-400 font-medium">{student.coSo}</span></div>
                            )}
                          </div>
                        </td>

                        {/* Môn học đăng ký */}
                        <td className="py-3.5 px-4">
                          {student.danhSachMonHoc && student.danhSachMonHoc.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-[180px]">
                              {student.danhSachMonHoc.map((mon, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/25 flex items-center gap-1"
                                >
                                  <Award className="w-2.5 h-2.5 text-sky-400" />
                                  {mon}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">Chưa đăng ký</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 space-y-1">
                          {isWaiting ? (
                            <span className="text-amber-400/90 font-medium italic text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              Chờ xếp lớp
                            </span>
                          ) : studentClasses.length === 0 ? (
                            <span className="text-slate-500 italic text-[11px]">Chưa sắp lớp</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {studentClasses.map((cls) => (
                                <span
                                  key={cls.id}
                                  className={`inline-block text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                                    cls.type === 'Học bù'
                                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                      : 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
                                  }`}
                                  title={`${cls.name} (${cls.schedule})`}
                                >
                                  {cls.name.split(' ').slice(0, 2).join(' ')}
                                  {cls.type === 'Học bù' && ' (Bù)'}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {isWaiting ? (
                            <span className="text-slate-400 italic text-[11px]">
                              Chưa có lịch &amp; ngày
                            </span>
                          ) : (
                            <>
                              <span className="text-slate-300 block font-mono text-[11px]">
                                {formatToVNDate(student.ngayBatDau)} &rarr; {formatToVNDate(student.ngayKetThuc)}
                              </span>
                              <span className="text-[10px] text-slate-500 italic block mt-0.5">
                                ({student.soBuoiHoc || 24} buổi học)
                              </span>
                            </>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center justify-center font-bold font-mono px-2 py-1 rounded-lg text-xs ${
                            student.soVeHocBu > 0
                              ? 'bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.25)] ring-2 ring-amber-500/20'
                              : 'bg-white/5 text-slate-400'
                          }`}>
                            {student.soVeHocBu}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {isWaiting ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2.5 py-1 rounded-full border border-amber-500/30">
                              <Hourglass className="w-3 h-3 text-amber-400" />
                              Chờ lớp
                            </span>
                          ) : student.trangThai === 'Hết hạn' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-rose-500/15 text-rose-300 font-bold px-2.5 py-1 rounded-full border border-rose-500/30">
                              <AlertCircle className="w-3 h-3" />
                              Hết hạn
                            </span>
                          ) : isExpiringSoon ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/15 text-amber-300 font-bold px-2.5 py-1 rounded-full border border-amber-500/30 animate-pulse">
                              <Clock className="w-3 h-3" />
                              Sắp hết hạn
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/15 text-emerald-300 font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                              <UserCheck className="w-3 h-3" />
                              Còn hạn
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {student.soVeHocBu > 0 ? (
                            <button
                              id={`btn-xep-lich-bu-${student.id}`}
                              onClick={() => openMakeupModal(student)}
                              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center justify-center gap-1 mx-auto active:scale-95 shadow-[0_0_10px_rgba(245,158,11,0.2)] cursor-pointer"
                            >
                              <Ticket className="w-3.5 h-3.5" />
                              Sắp lịch học bù
                            </button>
                          ) : (
                            <button
                              disabled
                              className="text-slate-500 font-medium text-xs px-3 py-1.5 border border-dashed border-white/10 rounded-xl mx-auto block cursor-not-allowed"
                            >
                              Không có vé bù
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-[11px]">
              <span>Hiển thị</span>
              <strong className="text-sky-400 font-mono font-bold">{displayedStudents.length}</strong>
              <span>học viên (từ {filteredStudents.length > 0 ? (validCurrentPage - 1) * pageSize + 1 : 0} - {Math.min(validCurrentPage * pageSize, filteredStudents.length)} / {filteredStudents.length} học viên)</span>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={validCurrentPage === 1}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1 text-xs cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Trước
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                        validCurrentPage === page
                          ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={validCurrentPage === totalPages}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1 text-xs cursor-pointer"
                >
                  Sau
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Classes List, Capacity, Schedules */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-display font-bold text-white">Quản Lý Lớp Học</h3>
                <p className="text-[11px] text-slate-400">Lịch học cố định &amp; Sĩ số giới hạn</p>
              </div>

              <button
                onClick={() => setAddClassModalOpen(true)}
                className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-sky-500/20 transition cursor-pointer"
              >
                + Lớp mới
              </button>
            </div>

            <div className="space-y-3.5">
              {classes.map((cls) => {
                const currentSiSo = getSiSoThucTe(cls.id);
                const percent = (currentSiSo / cls.siSoToiDa) * 100;
                
                const progressColor = percent >= 100 
                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' 
                  : percent >= 80 
                  ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                  : 'bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.4)]';

                return (
                  <div key={cls.id} className="glass-card border border-white/10 rounded-xl p-3.5 hover:border-white/20 transition space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-xs tracking-wide">{cls.tenLop || cls.tenMon}</h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-sky-400 font-mono flex items-center gap-1">
                            <Award className="w-2.5 h-2.5" />
                            {cls.tenMon}
                          </span>
                          {cls.coSo && (
                            <span className="text-[10px] text-amber-300 font-mono flex items-center gap-1">
                              <Building2 className="w-2.5 h-2.5 text-amber-400" />
                              {cls.coSo}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">| {cls.phongHoc}</span>
                        </div>
                      </div>
                      
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        currentSiSo >= cls.siSoToiDa
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-white/5 text-slate-300 border border-white/10'
                      }`}>
                        Sĩ số: {currentSiSo}/{cls.siSoToiDa}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-mono">
                        <Clock className="w-3.5 h-3.5 text-sky-400" />
                        Lịch: {cls.lichHocCoDinh}
                      </div>

                      {(cls.ngayBatDau || cls.ngayKetThuc) && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                          <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>
                            Khóa: {formatToVNDate(cls.ngayBatDau)} ➔ {formatToVNDate(cls.ngayKetThuc)} ({cls.soBuoiHoc || 24} buổi)
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        ></div>
                      </div>
                      {currentSiSo >= cls.siSoToiDa && (
                        <span className="text-[9px] text-rose-400 font-semibold block flex items-center gap-0.5 animate-pulse">
                          <ShieldAlert className="w-2.5 h-2.5" /> Chặn đăng ký - Đã đủ sĩ số tối đa!
                        </span>
                      )}
                    </div>

                    {currentSiSo < cls.siSoToiDa && (
                      <div className="pt-1.5 flex justify-end">
                        <select
                          id={`quick-add-to-${cls.id}`}
                          defaultValue=""
                          onChange={(e) => {
                            if (!e.target.value) return;
                            handleEnrollDirect(e.target.value, cls.id, 'Chính thức');
                            e.target.value = '';
                          }}
                          className="text-[10px] bg-slate-900 border border-white/10 text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium cursor-pointer"
                        >
                          <option value="" disabled className="bg-slate-950 text-slate-400">+ Xếp học viên nhanh</option>
                          {hocVienList
                            .filter((h) => h.trangThai === 'Còn hạn')
                            .filter((h) => !danhSachLop.some((d) => d.idLop === cls.id && d.idHocVien === h.id))
                            .map((h) => {
                              const clash = checkLichTrungLap(h.id, cls.id);
                              return (
                                <option key={h.id} value={h.id} className="bg-slate-950 text-white">
                                  {h.name} {clash ? `⚠️ (Trùng lịch: ${clash.clashingClassName})` : ''}
                                </option>
                              );
                            })}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Sắp lịch học bù */}
      {makeupModalOpen && selectedStudentForMakeup && (
        <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-md">
          <div className="glass-panel max-w-md w-full overflow-hidden shadow-2xl border border-white/25 rounded-2xl flex flex-col">
            <div className="bg-slate-900/60 border-b border-white/10 text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-bold text-base">Sắp Lịch Học Bù Học Viên</h3>
              </div>
              <button
                onClick={() => setMakeupModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-xs text-amber-300 space-y-1">
                <p className="font-semibold text-white">Học viên: {selectedStudentForMakeup.name}</p>
                <p>Số vé học bù còn tồn: <span className="font-bold text-amber-400">{selectedStudentForMakeup.soVeHocBu} vé</span></p>
                <p className="text-[11px] text-slate-400 italic font-medium">Hệ thống sẽ tự động trừ -1 vé bù khi sắp lịch thành công.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Chọn lớp học bù trống
                </label>
                <select
                  id="select-makeup-class"
                  value={targetClassForMakeup}
                  onChange={(e) => setTargetClassForMakeup(e.target.value)}
                  className="w-full bg-slate-900 border border-white/15 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium cursor-pointer text-slate-200"
                >
                  <option value="" className="bg-slate-950 text-slate-400">-- Chọn lớp muốn bù --</option>
                  {classes.map((cls) => {
                    const currentSiSo = getSiSoThucTe(cls.id);
                    const isFull = currentSiSo >= cls.siSoToiDa;
                    const isClashing = checkLichTrungLap(selectedStudentForMakeup.id, cls.id);

                    return (
                      <option
                        key={cls.id}
                        value={cls.id}
                        disabled={isFull}
                        className="bg-slate-950 text-white"
                      >
                        {cls.tenLop ? `${cls.tenLop} (${cls.tenMon})` : cls.tenMon} ({cls.phongHoc}) - Sĩ số {currentSiSo}/{cls.siSoToiDa} 
                        {isFull ? ' [HẾT CHỖ]' : ''}
                        {isClashing ? ' [⚠️ TRÙNG LỊCH]' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {targetClassForMakeup && (() => {
                const isClashing = checkLichTrungLap(selectedStudentForMakeup.id, targetClassForMakeup);
                if (isClashing) {
                  return (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl text-xs text-rose-300 flex items-start gap-2 animate-fade-in">
                      <ShieldAlert className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-bold block text-white">⚠️ Cảnh báo trùng lịch học:</span>
                        <span>
                          Lớp bù trùng thời gian với lớp chính khóa: <strong>"{isClashing.clashingClassName}"</strong> ({isClashing.schedule}). Vui lòng cân nhắc sắp lịch khác cho học viên.
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <div className="bg-slate-950/30 px-6 py-4 border-t border-white/10 flex justify-end gap-2.5">
              <button
                onClick={() => setMakeupModalOpen(false)}
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Đóng
              </button>
              <button
                id="btn-confirm-makeup"
                onClick={handleConfirmMakeup}
                disabled={!targetClassForMakeup}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer"
              >
                Xác nhận Học Bù (-1 Vé)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Đăng ký học viên mới */}
      {addStudentModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full overflow-hidden shadow-2xl border border-white/25 rounded-2xl flex flex-col max-h-[90vh]">
            <div className="bg-slate-900/60 border-b border-white/10 text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" />
                <h3 className="font-display font-bold text-base">Đăng Ký Học Viên Mới</h3>
              </div>
              <button
                onClick={() => setAddStudentModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="flex-1 overflow-y-auto scrollbar-thin">
              <div className="p-6 space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    Mã số học viên <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="input-id-add"
                    type="text"
                    required
                    placeholder="Nhập thủ công (Ví dụ: HV008, KH201...)"
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-mono placeholder-slate-500 uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide">
                    Họ và tên học sinh <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="input-name-add"
                    type="text"
                    required
                    placeholder="Nguyễn Gia Khánh"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(capitalizeWords(e.target.value))}
                    className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-medium placeholder-slate-500 capitalize"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">
                      Ngày tháng năm sinh <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="input-dob-add"
                      type="date"
                      required
                      value={newStudentDob}
                      onChange={(e) => setNewStudentDob(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">
                      Giới tính <span className="text-rose-400">*</span>
                    </label>
                    <select
                      id="select-gender-add"
                      value={newStudentGender}
                      onChange={(e) => setNewStudentGender(e.target.value as 'Nam' | 'Nữ' | 'Khác')}
                      className="w-full bg-slate-900 border border-white/15 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium cursor-pointer text-slate-200"
                    >
                      <option value="Nam" className="bg-slate-950 text-white">Nam</option>
                      <option value="Nữ" className="bg-slate-950 text-white">Nữ</option>
                      <option value="Khác" className="bg-slate-950 text-white">Khác</option>
                    </select>
                  </div>
                </div>

                {/* Checkbox Học sinh chờ lớp */}
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-amber-500/30 flex items-center justify-between">
                  <label htmlFor="checkbox-cho-xep-lop-admin" className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      id="checkbox-cho-xep-lop-admin"
                      type="checkbox"
                      checked={isWaitingClass}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIsWaitingClass(checked);
                        if (checked) {
                          setSelectedEnrollClass('');
                          setNewStudentRegularClass('');
                        } else {
                          setNewStudentSubjects([]);
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-white text-xs block flex items-center gap-1.5">
                        Học sinh chờ lớp
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Khi chọn mục này, phần chọn môn học đăng ký sẽ được kích hoạt để chọn các môn chờ xếp lớp
                      </span>
                    </div>
                  </label>
                  {isWaitingClass && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                      Chờ xếp lớp
                    </span>
                  )}
                </div>

                {/* Phần chọn Môn học (Chỉ kích hoạt khi chọn Học sinh chờ lớp) */}
                <div className={`space-y-2 bg-slate-950/60 p-3.5 rounded-xl border transition-all duration-200 ${
                  isWaitingClass
                    ? 'border-amber-500/40 bg-slate-900/90 shadow-md ring-1 ring-amber-500/20'
                    : 'border-white/10 opacity-40 pointer-events-none'
                }`}>
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5 text-xs">
                      <Award className={`w-3.5 h-3.5 ${isWaitingClass ? 'text-amber-400' : 'text-slate-500'}`} />
                      Môn học đăng ký {isWaitingClass && <span className="text-rose-400">*</span>}
                      <span className="text-[10px] text-slate-400 font-normal lowercase">(chọn được nhiều môn)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {isWaitingClass ? (
                        <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                          Đã kích hoạt: {newStudentSubjects.length} môn
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic font-mono bg-white/5 px-2 py-0.5 rounded">
                          Chưa kích hoạt (Chỉ áp dụng khi chọn Chờ lớp)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {monHocList.map((mh) => {
                      const isSelected = newStudentSubjects.includes(mh.tenMon);
                      return (
                        <button
                          key={mh.id}
                          type="button"
                          disabled={!isWaitingClass}
                          onClick={() => {
                            if (isSelected) {
                              setNewStudentSubjects((prev) => prev.filter((m) => m !== mh.tenMon));
                            } else {
                              setNewStudentSubjects((prev) => [...prev, mh.tenMon]);
                            }
                          }}
                          className={`p-2 rounded-xl text-left border transition text-xs flex items-center justify-between gap-1 cursor-pointer disabled:cursor-not-allowed ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md'
                              : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-white/5 border-white/10'
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
                  {!isWaitingClass ? (
                    <p className="text-[10px] text-slate-400 italic">
                      💡 Mục chọn môn học sẽ được kích hoạt khi bạn tích chọn ô <strong>"Học sinh chờ lớp"</strong> ở trên.
                    </p>
                  ) : newStudentSubjects.length === 0 ? (
                    <p className="text-[10px] text-amber-400 italic">
                      ⚠️ Vui lòng nhấp chọn các môn học học sinh có nguyện vọng đăng ký chờ lớp.
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    Cơ sở học <span className="text-rose-400">*</span>
                  </label>
                  <select
                    id="select-coso-add"
                    value={newStudentCoSo}
                    onChange={(e) => setNewStudentCoSo(e.target.value)}
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

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide">
                    Họ và tên phụ huynh <span className="text-slate-500 font-normal italic">(Không bắt buộc)</span>
                  </label>
                  <input
                    id="input-parent-name-add"
                    type="text"
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={newStudentParentName}
                    onChange={(e) => setNewStudentParentName(capitalizeWords(e.target.value))}
                    className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-medium placeholder-slate-500 capitalize"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide">
                    Số điện thoại phụ huynh <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="input-phone-add"
                    type="text"
                    required
                    placeholder="0912345678"
                    value={newStudentPhone}
                    onChange={(e) => setNewStudentPhone(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-medium placeholder-slate-500"
                  />
                </div>

                <div className={`space-y-1.5 transition-opacity ${isWaitingClass ? 'opacity-30 pointer-events-none' : ''}`}>
                  <div className="flex justify-between items-center">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">
                      Xếp trực tiếp vào lớp
                    </label>
                    {isWaitingClass && (
                      <span className="text-[10px] text-amber-400 font-semibold italic">(Khóa do chọn Học sinh chờ lớp)</span>
                    )}
                  </div>
                  <select
                    id="select-student-enroll-add"
                    value={selectedEnrollClass}
                    disabled={isWaitingClass}
                    onChange={(e) => {
                      const classId = e.target.value;
                      setSelectedEnrollClass(classId);
                      if (classId) {
                        const foundClass = classes.find(c => c.id === classId);
                        if (foundClass) {
                          const effStart = newStudentStart || foundClass.ngayBatDau || '2026-07-01';
                          if (!newStudentStart && foundClass.ngayBatDau) {
                            setNewStudentStart(foundClass.ngayBatDau);
                          }
                          const autoSessions = calculateSessionsBetween(
                            effStart,
                            foundClass.ngayBatDau,
                            foundClass.ngayKetThuc,
                            foundClass.days,
                            foundClass.soBuoiHoc
                          );
                          setNewStudentSoBuoiHoc(autoSessions);
                        }
                      }
                    }}
                    className="w-full bg-slate-900 border border-white/15 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium cursor-pointer text-slate-200 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Không xếp lớp ngay / Tự nhập --</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.tenLop ? `${c.tenLop} (${c.tenMon})` : c.tenMon} ({c.id} - Max {c.siSoToiDa} HS)
                      </option>
                    ))}
                  </select>
                </div>

                {!selectedEnrollClass && !isWaitingClass && (
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">
                      Hoặc nhập tên lớp khác
                    </label>
                    <input
                      id="input-regular-class-add"
                      type="text"
                      placeholder="Ví dụ: Toán Tư Duy Tiểu Học..."
                      value={newStudentRegularClass}
                      onChange={(e) => setNewStudentRegularClass(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-medium placeholder-slate-500"
                    />
                  </div>
                )}

                <div className={`grid grid-cols-2 gap-3 transition-opacity ${isWaitingClass ? 'opacity-30 pointer-events-none' : ''}`}>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block font-bold text-slate-400 uppercase tracking-wide">
                        Ngày bắt đầu gói {!isWaitingClass && <span className="text-rose-400">*</span>}
                      </label>
                      {isWaitingClass && (
                        <span className="text-[10px] text-amber-400 font-semibold italic">(Khóa)</span>
                      )}
                    </div>
                    <input
                      id="input-start-add"
                      type="date"
                      required={!isWaitingClass}
                      disabled={isWaitingClass}
                      value={newStudentStart}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setNewStudentStart(newDate);
                        if (selectedEnrollClass) {
                          const foundClass = classes.find(c => c.id === selectedEnrollClass);
                          if (foundClass) {
                            const autoSessions = calculateSessionsBetween(
                              newDate,
                              foundClass.ngayBatDau,
                              foundClass.ngayKetThuc,
                              foundClass.days,
                              foundClass.soBuoiHoc
                            );
                            setNewStudentSoBuoiHoc(autoSessions);
                          }
                        }
                      }}
                      className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-mono disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block font-bold text-slate-400 uppercase tracking-wide">
                        Số buổi học đăng ký {!isWaitingClass && <span className="text-rose-400">*</span>}
                      </label>
                      {isWaitingClass && (
                        <span className="text-[10px] text-amber-400 font-semibold italic">(Khóa)</span>
                      )}
                    </div>
                    <input
                      id="input-student-manager-sessions-add"
                      type="number"
                      required={!isWaitingClass}
                      disabled={isWaitingClass}
                      min={0}
                      max={100}
                      value={newStudentSoBuoiHoc}
                      onChange={(e) => setNewStudentSoBuoiHoc(Number(e.target.value))}
                      className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-mono disabled:cursor-not-allowed font-bold"
                    />
                    {selectedEnrollClass && !isWaitingClass && (() => {
                      const foundClass = classes.find(c => c.id === selectedEnrollClass);
                      if (!foundClass) return null;
                      const isAfter = foundClass.ngayKetThuc && newStudentStart > foundClass.ngayKetThuc;
                      return (
                        <div className={`text-[10px] font-medium flex items-start gap-1 mt-1 ${isAfter ? 'text-rose-400' : 'text-emerald-400'}`}>
                          <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          {isAfter ? (
                            <span>⚠️ Ngày bắt đầu ({formatToVNDate(newStudentStart)}) sau ngày kết thúc lớp ({formatToVNDate(foundClass.ngayKetThuc)}).</span>
                          ) : (
                            <span>
                              ⚡ Tự tính: <strong>{newStudentSoBuoiHoc} buổi</strong> (từ {formatToVNDate(newStudentStart)} đến kết thúc lớp {formatToVNDate(foundClass.ngayKetThuc || foundClass.ngayBatDau)})
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="bg-sky-500/10 border border-sky-500/20 p-3 rounded-xl text-[11px] text-sky-300 flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                  <span>
                    Sau khi đăng ký hồ sơ học viên thành công, hãy chọn <strong>"+ Xếp học viên nhanh"</strong> ở bảng Quản lý Lớp học để đưa học viên vào lớp chính thức.
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/30 px-6 py-4 border-t border-white/10 flex justify-end gap-2.5 sticky bottom-0 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setAddStudentModalOpen(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  id="btn-confirm-add-student"
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-[0_0_15px_rgba(56,189,248,0.25)] cursor-pointer"
                >
                  Đăng Ký Hồ Sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Thêm lớp học mới */}
      {addClassModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAddClassModalOpen(false);
          }}
        >
          <div 
            className="max-w-xl w-full mx-auto my-auto max-h-[92vh] overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-panel w-full overflow-hidden shadow-2xl border border-white/25 rounded-2xl flex flex-col">
              <div className="bg-slate-900/60 border-b border-white/10 text-white px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <RoyalLogo className="w-6 h-6 shrink-0" />
                  <h3 className="font-display font-bold text-base uppercase tracking-wide">Thêm Lớp Học Ngoại Khóa Mới</h3>
                </div>
                <button
                  onClick={() => setAddClassModalOpen(false)}
                  className="text-slate-400 hover:text-white font-bold text-lg transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveClass}>
                <div className="p-6 space-y-4 text-xs">
                  {/* MÔN HỌC - Load từ dữ liệu hệ thống */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-300 uppercase tracking-wide flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-sky-400" />
                        Môn học <span className="text-rose-400">*</span>
                      </span>
                      <span className="text-[10px] text-sky-400 font-normal">Nạp từ danh mục môn học</span>
                    </label>

                    {monHocList && monHocList.length > 0 ? (
                      <select
                        id="select-admin-mon-hoc"
                        required
                        value={newClassSubject}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewClassSubject(val);
                          const mh = monHocList.find((m) => m.tenMon === val);
                          if (mh) {
                            setNewClassSoBuoiHoc(mh.soBuoiHoc);
                            const count = classes.filter((c) => c.tenMon === val).length;
                            setNewClassTenLop(`${val} - Lớp 0${count + 1}`);
                          }
                        }}
                        className="w-full bg-slate-900 border border-white/15 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-sky-500 font-bold cursor-pointer text-slate-200"
                      >
                        <option value="">-- Chọn môn học ({monHocList.length} môn) --</option>
                        {monHocList.map((m) => (
                          <option key={m.id} value={m.tenMon} className="bg-slate-950 text-white font-medium">
                            {m.tenMon} ({m.id} • {m.soBuoiHoc} buổi • {m.hocPhiTheoKhoa.toLocaleString('vi-VN')} đ/khóa)
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Bóng rổ, Bóng đá, Cầu lông..."
                        value={newClassSubject}
                        onChange={(e) => setNewClassSubject(e.target.value)}
                        className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-medium"
                      />
                    )}
                  </div>

                  {/* TÊN LỚP HỌC */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                      Tên lớp học <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="input-classname-add"
                      type="text"
                      required
                      placeholder="Ví dụ: Bóng rổ K1, Bóng đá Chiều T7, Bơi lội Căn bản A1..."
                      value={newClassTenLop}
                      onChange={(e) => setNewClassTenLop(e.target.value)}
                      className={`w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-bold placeholder-slate-500 ${isNewClassNameDuplicate ? 'border-rose-500 ring-2 ring-rose-500/30' : ''}`}
                    />
                    {isNewClassNameDuplicate && (
                      <p className="text-rose-400 text-[10px] font-bold mt-1 animate-pulse">⚠️ Tên lớp học này đã tồn tại!</p>
                    )}
                  </div>

                  {/* CƠ SỞ - Load từ dữ liệu hệ thống */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-300 uppercase tracking-wide flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-amber-400" />
                        Cơ sở học tập <span className="text-rose-400">*</span>
                      </span>
                      <span className="text-[10px] text-amber-400 font-normal">Nạp từ dữ liệu hệ thống</span>
                    </label>
                    <select
                      id="select-admin-class-coso"
                      required
                      value={newClassCoSo}
                      onChange={(e) => setNewClassCoSo(e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium cursor-pointer text-slate-200"
                    >
                      <option value="">-- Chọn cơ sở học tập ({coSoList.length} cơ sở) --</option>
                      {coSoList.map((cs) => (
                        <option key={cs.id} value={cs.name} className="bg-slate-950 text-white font-medium">
                          {cs.name} ({cs.id} • {cs.diaChi})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* PHÒNG HỌC & SĨ SỐ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        Phòng học / Địa điểm <span className="text-rose-400">*</span>
                      </label>
                      <input
                        id="input-classroom-add"
                        type="text"
                        required
                        placeholder="Phòng 201 - Edison"
                        value={newClassRoom}
                        onChange={(e) => setNewClassRoom(e.target.value)}
                        className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-medium placeholder-slate-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-sky-400" />
                        Sĩ số tối đa giới hạn <span className="text-rose-400">*</span>
                      </label>
                      <input
                        id="input-capacity-add"
                        type="number"
                        required
                        min={1}
                        max={50}
                        value={newClassCapacity}
                        onChange={(e) => setNewClassCapacity(Number(e.target.value))}
                        className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-medium placeholder-slate-500"
                      />
                    </div>
                  </div>

                  {/* LỊCH HỌC TRONG TUẦN & GIỜ HỌC */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide flex items-center justify-between">
                      <span>Chọn các ngày học cố định trong tuần <span className="text-rose-400">*</span></span>
                      <span className="text-[10px] text-sky-400 font-mono">Đã chọn: {newClassDays.length} ngày</span>
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 pt-1">
                      {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => {
                        const isSelected = newClassDays.includes(day);
                        const dayMap: Record<string, string> = {
                          'T2': 'Thứ 2', 'T3': 'Thứ 3', 'T4': 'Thứ 4', 'T5': 'Thứ 5',
                          'T6': 'Thứ 6', 'T7': 'Thứ 7', 'CN': 'Chủ Nhật'
                        };
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDaySelection(day)}
                            className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                              isSelected
                                ? 'bg-sky-500 border-sky-400 text-slate-950 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            {dayMap[day]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      Giờ học buổi <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="input-time-add"
                      type="time"
                      required
                      placeholder="17:30"
                      value={newClassTime}
                      onChange={(e) => setNewClassTime(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-mono"
                    />
                  </div>

                  {/* SỐ BUỔI HỌC, THỜI GIAN BẮT ĐẦU & THỜI GIAN KẾT THÚC (HỆ THỐNG TỰ TÍNH) */}
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-sky-500/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Calculator className="w-4 h-4 text-sky-400" />
                        Thời lượng &amp; Lịch hoàn thành
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        Tự động tính ngày kết thúc
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Số buổi học */}
                      <div className="space-y-1.5">
                        <label className="block font-bold text-slate-300 uppercase tracking-wide">
                          Số buổi học <span className="text-rose-400">*</span>
                        </label>
                        <input
                          id="input-sobuoihoc-add"
                          type="number"
                          required
                          min={1}
                          max={100}
                          placeholder="24"
                          value={newClassSoBuoiHoc}
                          onChange={(e) => setNewClassSoBuoiHoc(Number(e.target.value))}
                          className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-bold font-mono"
                        />
                        <div className="flex gap-1 pt-0.5">
                          {[12, 16, 24, 36].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setNewClassSoBuoiHoc(num)}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono border transition ${
                                newClassSoBuoiHoc === num
                                  ? 'bg-sky-500 text-slate-950 font-bold border-sky-400'
                                  : 'bg-white/5 text-slate-400 hover:text-white border-white/10'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Thời gian bắt đầu */}
                      <div className="space-y-1.5">
                        <label className="block font-bold text-slate-300 uppercase tracking-wide">
                          Thời gian bắt đầu <span className="text-rose-400">*</span>
                        </label>
                        <input
                          id="input-startdate-add"
                          type="date"
                          required
                          value={newClassStartDate}
                          onChange={(e) => setNewClassStartDate(e.target.value)}
                          className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-mono cursor-pointer"
                        />
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {formatToVNDate(newClassStartDate)}
                        </span>
                      </div>

                      {/* Thời gian kết thúc: HỆ THỐNG TỰ TÍNH THEO SỐ BUỔI HỌC */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block font-bold text-slate-300 uppercase tracking-wide">
                            Thời gian kết thúc
                          </label>
                          <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">(Tự tính)</span>
                        </div>
                        <div className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-2.5 text-emerald-400 font-mono text-xs font-bold flex items-center justify-between shadow-inner">
                          <span>{newClassEndDate ? formatToVNDate(newClassEndDate) : '-- / -- / ----'}</span>
                          <CalendarCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        </div>
                        <span className="text-[10px] text-emerald-300/80 block font-mono">
                          {newClassEndDate ? `(Dự kiến: ${newClassEndDate})` : 'Cần chọn ngày bắt đầu & lịch học'}
                        </span>
                      </div>
                    </div>

                    {/* Preview box */}
                    {newClassEndDate && newClassDays.length > 0 && (
                      <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 flex items-start gap-2.5 text-sky-200">
                        <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                        <div className="text-[11px] leading-relaxed">
                          Lớp học gồm <strong>{newClassSoBuoiHoc} buổi</strong> diễn ra vào các ngày <strong>{newClassDays.join(', ')} lúc {newClassTime}</strong>, bắt đầu từ <strong>{formatToVNDate(newClassStartDate)}</strong> và hoàn tất vào <strong>{formatToVNDate(newClassEndDate)}</strong>.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-950/30 px-6 py-4 border-t border-white/10 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAddClassModalOpen(false)}
                    className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    id="btn-confirm-add-class"
                    className="px-5 py-2 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-lg shadow-sky-500/20 cursor-pointer flex items-center gap-1.5"
                  >
                    Thêm Lớp Học
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
