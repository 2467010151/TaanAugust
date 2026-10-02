import React, { useState, useEffect } from 'react';
import { HocVien, LopHoc, DanhSachLop, DiemDanh, MonHoc, CoSo, formatToVNDate, calculateSessionsBetween, capitalizeWords } from '../types';
import RoyalLogo from './RoyalLogo';
import { 
  Users, 
  Search, 
  Filter, 
  Calendar, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  UserCheck, 
  Clock, 
  Ticket, 
  AlertCircle, 
  Phone, 
  UserPlus, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight,
  Award,
  Building2,
  CheckCircle2,
  Hourglass,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';

interface StudentManagerProps {
  students: HocVien[];
  classes: LopHoc[];
  danhSachLop: DanhSachLop[];
  diemDanhList: DiemDanh[];
  monHocList?: MonHoc[];
  coSoList?: CoSo[];
  onAddStudent: (student: HocVien) => void;
  onEditStudent: (student: HocVien) => void;
  onDeleteStudent: (studentId: string) => void;
  onEnrollStudent: (idLop: string, idHocVien: string, loaiHocVien: 'Chính thức' | 'Học bù') => void;
  onOpenRegister?: () => void;
  onOpenTransferModal?: (student: HocVien) => void;
}

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

function removeVietnameseTones(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export default function StudentManager({
  students,
  classes,
  danhSachLop,
  diemDanhList,
  monHocList = [],
  coSoList = [],
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onEnrollStudent,
  onOpenRegister,
  onOpenTransferModal,
}: StudentManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'has_ticket' | 'near_expiry' | 'waiting'>('all');

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<HocVien | null>(null);

  // Khóa cuộn màn hình chính (document.body.style.overflow = 'hidden') khi modal mở
  useEffect(() => {
    if (isModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || '';
      };
    }
  }, [isModalOpen]);

  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [phone, setPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [dob, setDob] = useState('2018-01-01');
  const [gender, setGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Nam');
  const [startDate, setStartDate] = useState('2026-07-01');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [soBuoiHoc, setSoBuoiHoc] = useState<number>(24);
  const [isWaitingClass, setIsWaitingClass] = useState<boolean>(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedCoSo, setSelectedCoSo] = useState<string>('');

  const systemCurrentDateStr = '2026-07-09';
  const systemCurrentDate = new Date(systemCurrentDateStr);

  const getStudentClasses = (hvId: string) => {
    return danhSachLop
      .filter((dsl) => dsl.idHocVien === hvId)
      .map((dsl) => {
        const cls = classes.find((c) => c.id === dsl.idLop);
        return {
          id: dsl.idLop,
          name: cls?.tenMon || 'Lớp ẩn',
          type: dsl.loaiHocVien,
          schedule: cls?.lichHocCoDinh || '',
        };
      });
  };

  const getSoBuoiConLai = (student: HocVien) => {
    if (student.choXepLop || student.trangThai === 'Chờ lớp') return 0;
    const total = student.soBuoiHoc || 16;
    const attended = (diemDanhList || []).filter(
      (d) => d.idHocVien === student.id && d.trangThai === 'Có mặt'
    ).length;
    return Math.max(0, total - attended);
  };

  const openAddModal = () => {
    if (onOpenRegister) {
      onOpenRegister();
      return;
    }

    const maxNum = students.reduce((max, h) => {
      const num = parseInt(h.id.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const nextId = `HV${String(maxNum + 1).padStart(3, '0')}`;

    setEditingStudent(null);
    setStudentId(nextId);
    setStudentName('');
    setPhone('');
    setParentName('');
    setDob('2018-01-01');
    setGender('Nam');
    setStartDate('2026-07-01');
    setSelectedClassId('');
    setSoBuoiHoc(24);
    setIsWaitingClass(false);
    setSelectedSubjects([]);
    setSelectedCoSo(coSoList[0]?.name || '');
    setIsModalOpen(true);
  };

  const openEditModal = (student: HocVien) => {
    setEditingStudent(student);
    setStudentId(student.id);
    setStudentName(student.name);
    setPhone(student.sdtPhuHuynh);
    setParentName(student.hoTenPhuHuynh || '');
    setDob(student.ngaySinh || '2018-01-01');
    setGender(student.gioiTinh || 'Nam');
    setStartDate(student.ngayBatDau || '2026-07-01');
    setSoBuoiHoc(student.soBuoiHoc || 24);
    setSelectedClassId('');
    setIsWaitingClass(!!student.choXepLop || student.trangThai === 'Chờ lớp');
    setSelectedSubjects(student.danhSachMonHoc || []);
    setSelectedCoSo(student.coSo || coSoList[0]?.name || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !studentName.trim() || !phone.trim()) {
      alert('❌ Vui lòng điền đầy đủ các thông tin bắt buộc (Mã số, Họ tên, SĐT)!');
      return;
    }

    if (!isWaitingClass && !startDate) {
      alert('❌ Vui lòng chọn Ngày bắt đầu gói!');
      return;
    }

    if (isWaitingClass && selectedSubjects.length === 0) {
      alert('❌ Đối với học sinh chờ lớp, vui lòng chọn ít nhất một môn học đăng ký quan tâm!');
      return;
    }

    const cleanId = studentId.trim().toUpperCase();

    if (!editingStudent) {
      const idExists = students.some((s) => s.id.toUpperCase() === cleanId);
      if (idExists) {
        alert(`❌ Mã số học viên "${cleanId}" đã tồn tại! Vui lòng nhập mã số khác.`);
        return;
      }
    }

    let calculatedEndDate = '';
    const classIdToUse = isWaitingClass ? '' : selectedClassId;
    const foundClass = !isWaitingClass ? classes.find(c => c.id === classIdToUse) : null;
    const effectiveStart = isWaitingClass ? '' : startDate;
    const effectiveSessions = isWaitingClass ? 0 : Number(soBuoiHoc);

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

    const effectiveSubjects = isWaitingClass
      ? selectedSubjects
      : (foundClass ? [foundClass.tenMon] : (editingStudent?.danhSachMonHoc || []));

    const savedStudent: HocVien = {
      id: cleanId,
      name: studentName.trim(),
      sdtPhuHuynh: phone.trim(),
      hoTenPhuHuynh: parentName.trim() || undefined,
      ngaySinh: dob || undefined,
      gioiTinh: gender,
      ngayBatDau: effectiveStart,
      ngayKetThuc: calculatedEndDate,
      trangThai: calculatedStatus,
      soVeHocBu: editingStudent?.soVeHocBu || 0,
      soBuoiHoc: effectiveSessions,
      lopChinhKhoa: isWaitingClass ? 'Chờ xếp lớp' : (foundClass ? foundClass.tenMon : editingStudent?.lopChinhKhoa),
      coSo: selectedCoSo || undefined,
      choXepLop: isWaitingClass,
      danhSachMonHoc: effectiveSubjects,
    };

    if (editingStudent) {
      onEditStudent(savedStudent);
    } else {
      onAddStudent(savedStudent);

      if (classIdToUse && !isWaitingClass) {
        onEnrollStudent(classIdToUse, cleanId, 'Chính thức');
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = (student: HocVien) => {
    const studentClasses = getStudentClasses(student.id);
    let confirmMsg = `Bạn có chắc chắn muốn xóa học viên "${student.name}" (Mã: ${student.id}) khỏi hệ thống?`;
    if (studentClasses.length > 0) {
      confirmMsg = `⚠️ CẢNH BÁO: Học viên "${student.name}" đang tham gia ${studentClasses.length} lớp học ngoại khóa.\nNếu xóa học viên, các lịch xếp lớp này cũng sẽ bị hủy bỏ.\n\nBạn vẫn muốn tiếp tục xóa chứ?`;
    }

    if (window.confirm(confirmMsg)) {
      onDeleteStudent(student.id);
    }
  };

  const filteredStudents = students.filter((student) => {
    const termRaw = searchTerm.trim().toLowerCase();
    if (termRaw) {
      const termNorm = removeVietnameseTones(termRaw);
      const studentClasses = getStudentClasses(student.id);

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

    if (statusFilter === 'waiting') {
      return student.choXepLop === true || student.trangThai === 'Chờ lớp';
    }
    if (statusFilter === 'active') {
      return !student.choXepLop && student.trangThai === 'Còn hạn' && (!student.ngayKetThuc || new Date(student.ngayKetThuc) >= systemCurrentDate);
    }
    if (statusFilter === 'expired') {
      return !student.choXepLop && (student.trangThai === 'Hết hạn' || (student.ngayKetThuc && new Date(student.ngayKetThuc) < systemCurrentDate));
    }
    if (statusFilter === 'has_ticket') {
      return student.soVeHocBu > 0;
    }
    if (statusFilter === 'near_expiry') {
      if (student.choXepLop || student.trangThai === 'Chờ lớp') return false;
      const remaining = getSoBuoiConLai(student);
      return remaining >= 1 && remaining <= 2;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const displayedStudents = filteredStudents.slice(
    (validCurrentPage - 1) * pageSize,
    validCurrentPage * pageSize
  );

  const totalStudents = students.length;
  const waitingStudentsCount = students.filter((s) => s.choXepLop || s.trangThai === 'Chờ lớp').length;
  const activeStudents = students.filter((s) => !s.choXepLop && s.trangThai === 'Còn hạn' && (!s.ngayKetThuc || new Date(s.ngayKetThuc) >= systemCurrentDate)).length;
  const expiredStudents = students.filter((s) => !s.choXepLop && (s.trangThai === 'Hết hạn' || (s.ngayKetThuc && new Date(s.ngayKetThuc) < systemCurrentDate))).length;
  const totalTickets = students.reduce((sum, s) => sum + s.soVeHocBu, 0);
  const nearExpiryStudentsCount = students.filter((s) => {
    if (s.choXepLop || s.trangThai === 'Chờ lớp') return false;
    const remaining = getSoBuoiConLai(s);
    return remaining >= 1 && remaining <= 2;
  }).length;

  return (
    <div className="space-y-6 animate-fade-in" id="student-manager-section">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div 
          onClick={() => setStatusFilter('all')}
          className={`glass-card border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] hover:bg-white/5 ${
            statusFilter === 'all' 
              ? 'border-sky-500 bg-sky-500/10 shadow-[0_0_15px_rgba(56,189,248,0.15)]' 
              : 'border-white/10'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Tổng học viên</span>
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-display font-bold text-white">{totalStudents}</span>
        </div>

        <div 
          onClick={() => setStatusFilter('waiting')}
          className={`glass-card border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] hover:bg-white/5 ${
            statusFilter === 'waiting' 
              ? 'border-amber-400 bg-amber-500/15 shadow-[0_0_15px_rgba(251,191,36,0.2)]' 
              : 'border-amber-500/30 bg-amber-500/5'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-amber-300 font-bold">Chờ xếp lớp</span>
            <div className="p-2 bg-amber-500/15 text-amber-400 rounded-lg">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-display font-bold text-amber-400">{waitingStudentsCount}</span>
        </div>

        <div 
          onClick={() => setStatusFilter('active')}
          className={`glass-card border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] hover:bg-white/5 ${
            statusFilter === 'active' 
              ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
              : 'border-white/10'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Còn hạn</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-display font-bold text-emerald-400">{activeStudents}</span>
        </div>

        <div 
          onClick={() => setStatusFilter('expired')}
          className={`glass-card border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] hover:bg-white/5 ${
            statusFilter === 'expired' 
              ? 'border-rose-500 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.15)]' 
              : 'border-white/10'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Hết hạn</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-display font-bold text-rose-400">{expiredStudents}</span>
        </div>

        <div 
          onClick={() => setStatusFilter('has_ticket')}
          className={`glass-card border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] hover:bg-white/5 ${
            statusFilter === 'has_ticket' 
              ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
              : 'border-white/10'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Vé bù tồn</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-display font-bold text-amber-400">{totalTickets}</span>
        </div>

        <div 
          onClick={() => setStatusFilter('near_expiry')}
          className={`glass-card border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] hover:bg-white/5 ${
            statusFilter === 'near_expiry' 
              ? 'border-rose-400 bg-rose-400/10 shadow-[0_0_15px_rgba(251,113,133,0.15)]' 
              : 'border-white/10'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Còn 1-2 buổi</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-display font-bold text-rose-300">{nearExpiryStudentsCount}</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="glass-panel rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <RoyalLogo className="w-7 h-7 drop-shadow-md shrink-0" />
            <div>
              <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                <span>Hồ Sơ &amp; Danh Sách Học Viên Ngoại Khóa</span>
                <span className="text-xs font-mono bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-500/30">
                  {filteredStudents.length} học viên
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Theo dõi tình trạng gói học, đăng ký môn học và xếp lịch tham gia các lớp học của Royal School.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-amber-500 hover:from-sky-400 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-extrabold transition active:scale-95 shadow-md flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-slate-950" />
              <span>Đăng Ký Học Viên Mới</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên, mã số, SĐT, môn học, cơ sở..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full glass-input rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white bg-white/5 border border-white/5'
              }`}
            >
              Tất cả ({totalStudents})
            </button>
            <button
              onClick={() => { setStatusFilter('waiting'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                statusFilter === 'waiting'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20'
              }`}
            >
              <span>Chờ lớp ({waitingStudentsCount})</span>
            </button>
            <button
              onClick={() => { setStatusFilter('active'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white bg-white/5 border border-white/5'
              }`}
            >
              Còn hạn ({activeStudents})
            </button>
            <button
              onClick={() => { setStatusFilter('expired'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                statusFilter === 'expired'
                  ? 'bg-rose-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white bg-white/5 border border-white/5'
              }`}
            >
              Hết hạn ({expiredStudents})
            </button>
            <button
              onClick={() => { setStatusFilter('has_ticket'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                statusFilter === 'has_ticket'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white bg-white/5 border border-white/5'
              }`}
            >
              Có vé bù ({students.filter(s => s.soVeHocBu > 0).length})
            </button>
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/20">
          <table className="w-full border-collapse text-left" id="table-students-manager-list">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                <th className="py-3 px-4">Mã số</th>
                <th className="py-3 px-4">Học viên</th>
                <th className="py-3 px-4">Môn học đăng ký</th>
                <th className="py-3 px-4">Phụ huynh &amp; Liên hệ</th>
                <th className="py-3 px-4">Trạng thái gói học</th>
                <th className="py-3 px-4 text-center">Vé bù</th>
                <th className="py-3 px-4">Lớp xếp</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {displayedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500 font-medium">
                    Không tìm thấy học viên nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                displayedStudents.map((student) => {
                  const studentClasses = getStudentClasses(student.id);
                  const isWaiting = student.choXepLop === true || student.trangThai === 'Chờ lớp';
                  const isExpired = !isWaiting && (student.trangThai === 'Hết hạn' || (student.ngayKetThuc && new Date(student.ngayKetThuc) < systemCurrentDate));

                  return (
                    <tr key={student.id} className="hover:bg-white/5 transition">
                      <td className="py-4 px-4 font-mono font-bold text-sky-400">
                        <span className="bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded text-[10px]">
                          {student.id}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span className="font-bold text-white text-sm block">{student.name}</span>
                          <div className="flex gap-2 text-[10px] text-slate-400">
                            <span>{student.gioiTinh || 'N/A'}</span>
                            <span>•</span>
                            <span>NS: {student.ngaySinh ? formatToVNDate(student.ngaySinh) : 'Chưa nhập'}</span>
                          </div>
                          {student.coSo && (
                            <span className="text-[10px] text-amber-400/90 flex items-center gap-1 font-medium">
                              <Building2 className="w-3 h-3 shrink-0" />
                              {student.coSo}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Môn học đăng ký */}
                      <td className="py-4 px-4">
                        {student.danhSachMonHoc && student.danhSachMonHoc.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
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
                          <span className="text-slate-500 italic text-[11px]">Chưa đăng ký môn</span>
                        )}
                      </td>

                      <td className="py-4 px-4 space-y-1">
                        <div className="text-slate-200 font-medium">{student.hoTenPhuHuynh || 'Chưa cập nhật'}</div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <Phone className="w-3.5 h-3.5 text-sky-400" />
                          <span className="font-mono text-xs">{student.sdtPhuHuynh}</span>
                        </div>
                      </td>

                      {/* Trạng thái gói học */}
                      <td className="py-4 px-4 space-y-1">
                        {isWaiting ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              <Hourglass className="w-3 h-3 text-amber-400" />
                              Chờ xếp lớp
                            </span>
                            <span className="text-[10px] text-slate-400 block italic">Chưa xếp lớp và ngày</span>
                          </div>
                        ) : (
                          <>
                            <div className="text-slate-300 font-mono text-[11px]">
                              {formatToVNDate(student.ngayBatDau)} → {formatToVNDate(student.ngayKetThuc)}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                isExpired
                                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                              }`}>
                                {isExpired ? 'Hết hạn' : 'Còn hạn'}
                              </span>
                              {(() => {
                                const soBuoiConLai = getSoBuoiConLai(student);
                                return (
                                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                    soBuoiConLai <= 2 && soBuoiConLai > 0
                                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20 font-extrabold animate-pulse'
                                      : soBuoiConLai === 0
                                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                                      : 'bg-sky-500/15 text-sky-300 border border-sky-500/20'
                                  }`}>
                                    Còn {soBuoiConLai}/{student.soBuoiHoc || 16} buổi
                                  </span>
                                );
                              })()}
                            </div>
                          </>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold font-mono text-xs ${
                          student.soVeHocBu > 0
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-extrabold shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                            : 'bg-white/5 text-slate-500'
                        }`}>
                          {student.soVeHocBu}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {isWaiting ? (
                          <span className="text-amber-400/90 font-medium italic text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Chờ xếp lớp
                          </span>
                        ) : studentClasses.length === 0 ? (
                          <span className="text-slate-500 italic text-[11px]">
                            {student.lopChinhKhoa || 'Chưa đăng ký lớp'}
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {studentClasses.map((sc) => (
                              <span
                                key={sc.id}
                                className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                                  sc.type === 'Học bù'
                                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                                    : 'bg-sky-500/10 text-sky-300 border-sky-500/20'
                                }`}
                                title={`${sc.name} (${sc.type}) - Lịch: ${sc.schedule}`}
                              >
                                {sc.name} ({sc.type === 'Học bù' ? 'Bù' : 'Chính'})
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {onOpenTransferModal && (
                            <button
                              onClick={() => onOpenTransferModal(student)}
                              className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/20 transition cursor-pointer"
                              title="Chuyển lớp &amp; Bù trừ học phí"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(student)}
                            className="p-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg border border-sky-500/20 transition cursor-pointer"
                            title="Sửa thông tin học viên"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(student)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition cursor-pointer"
                            title="Xóa học viên"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              Trang {validCurrentPage} / {totalPages} (Tổng {filteredStudents.length} học viên)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={validCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white transition flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Trước
              </button>
              <button
                disabled={validCurrentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white transition flex items-center gap-1"
              >
                Sau
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Thêm mới / Chỉnh sửa học viên */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div 
            className="glass-panel max-w-lg w-full overflow-hidden shadow-2xl border border-white/20 rounded-2xl flex flex-col my-auto max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900/80 border-b border-white/10 text-white px-6 py-4 flex justify-between items-center backdrop-blur-lg">
              <div className="flex items-center gap-2.5">
                <RoyalLogo className="w-6 h-6 shrink-0" />
                <h3 className="font-display font-extrabold text-base tracking-wide uppercase">
                  {editingStudent ? `Cập Nhật Học Viên (${editingStudent.id})` : 'Đăng Ký Học Viên Mới'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg transition duration-200 cursor-pointer p-1 hover:bg-white/5 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto scrollbar-thin">
              <div className="p-6 space-y-4 text-xs">
                
                {/* ID & Name */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">
                      Mã số học viên <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="input-student-manager-id"
                      type="text"
                      required
                      disabled={!!editingStudent}
                      placeholder="Ví dụ: HV001"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-mono font-bold placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">
                      Họ và tên học sinh <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="input-student-manager-name"
                      type="text"
                      required
                      placeholder="Ví dụ: Lê Quỳnh Chi"
                      value={studentName}
                      onChange={(e) => setStudentName(capitalizeWords(e.target.value))}
                      className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-bold placeholder-slate-500 capitalize"
                    />
                  </div>
                </div>

                {/* Parents info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">
                      Họ tên phụ huynh
                    </label>
                    <input
                      id="input-student-manager-parent"
                      type="text"
                      placeholder="Ví dụ: Nguyễn Văn B"
                      value={parentName}
                      onChange={(e) => setParentName(capitalizeWords(e.target.value))}
                      className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-medium placeholder-slate-500 capitalize"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">
                      Số điện thoại phụ huynh <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="input-student-manager-phone"
                      type="tel"
                      required
                      placeholder="Ví dụ: 0912345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-mono placeholder-slate-500"
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
                      id="input-student-manager-dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-mono cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">
                      Giới tính
                    </label>
                    <select
                      id="select-student-manager-gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'Nam' | 'Nữ' | 'Khác')}
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
                  <label htmlFor="checkbox-sm-cho-xep-lop" className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      id="checkbox-sm-cho-xep-lop"
                      type="checkbox"
                      checked={isWaitingClass}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIsWaitingClass(checked);
                        if (checked) {
                          setSelectedClassId('');
                        } else {
                          setSelectedSubjects([]);
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-white text-xs flex items-center gap-1.5">
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
                <div className={`space-y-2 bg-slate-900/60 p-3.5 rounded-xl border transition-all duration-200 ${
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
                          Đã kích hoạt: {selectedSubjects.length} môn
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
                      const isSelected = selectedSubjects.includes(mh.tenMon);
                      return (
                        <button
                          key={mh.id}
                          type="button"
                          disabled={!isWaitingClass}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedSubjects((prev) => prev.filter((m) => m !== mh.tenMon));
                            } else {
                              setSelectedSubjects((prev) => [...prev, mh.tenMon]);
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
                  {!isWaitingClass ? (
                    <p className="text-[10px] text-slate-400 italic">
                      💡 Mục chọn môn học sẽ được kích hoạt khi bạn tích chọn ô <strong>"Học sinh chờ lớp"</strong> ở trên.
                    </p>
                  ) : selectedSubjects.length === 0 ? (
                    <p className="text-[10px] text-amber-400 italic">
                      ⚠️ Vui lòng nhấp chọn các môn học học sinh có nguyện vọng đăng ký chờ lớp.
                    </p>
                  ) : null}
                </div>

                {/* Cơ sở học */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    Cơ sở học tập
                  </label>
                  <select
                    value={selectedCoSo}
                    onChange={(e) => setSelectedCoSo(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium cursor-pointer text-slate-200"
                  >
                    <option value="">-- Chọn cơ sở học --</option>
                    {coSoList.map((cs) => (
                      <option key={cs.id} value={cs.name} className="bg-slate-950 text-white">
                        {cs.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Xếp lớp - KHÔNG CHỌN ĐƯỢC nếu là Học sinh chờ lớp */}
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
                    id="select-student-manager-enroll"
                    disabled={isWaitingClass}
                    value={selectedClassId}
                    onChange={(e) => {
                      const classId = e.target.value;
                      setSelectedClassId(classId);
                      if (classId) {
                        const foundClass = classes.find(c => c.id === classId);
                        if (foundClass) {
                          const effStart = startDate || foundClass.ngayBatDau || '2026-07-01';
                          if (!startDate && foundClass.ngayBatDau) {
                            setStartDate(foundClass.ngayBatDau);
                          }
                          const autoSessions = calculateSessionsBetween(
                            effStart,
                            foundClass.ngayBatDau,
                            foundClass.ngayKetThuc,
                            foundClass.days,
                            foundClass.soBuoiHoc
                          );
                          setSoBuoiHoc(autoSessions);
                        }
                      }
                    }}
                    className="w-full bg-slate-900 border border-white/15 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium cursor-pointer text-slate-200 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Không xếp lớp ngay --</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.tenLop ? `${c.tenLop} (${c.tenMon})` : c.tenMon} ({c.id} - Max {c.siSoToiDa} HS)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ngày bắt đầu & Số buổi - KHÔNG CHỌN ĐƯỢC nếu là Học sinh chờ lớp */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-opacity ${isWaitingClass ? 'opacity-30 pointer-events-none' : ''}`}>
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
                      id="input-student-manager-start"
                      type="date"
                      required={!isWaitingClass}
                      disabled={isWaitingClass}
                      value={startDate}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setStartDate(newDate);
                        if (selectedClassId) {
                          const foundClass = classes.find(c => c.id === selectedClassId);
                          if (foundClass) {
                            const autoSessions = calculateSessionsBetween(
                              newDate,
                              foundClass.ngayBatDau,
                              foundClass.ngayKetThuc,
                              foundClass.days,
                              foundClass.soBuoiHoc
                            );
                            setSoBuoiHoc(autoSessions);
                          }
                        }
                      }}
                      className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-mono cursor-pointer disabled:cursor-not-allowed"
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
                      id="input-student-manager-sessions"
                      type="number"
                      required={!isWaitingClass}
                      disabled={isWaitingClass}
                      min={0}
                      max={100}
                      value={soBuoiHoc}
                      onChange={(e) => setSoBuoiHoc(Number(e.target.value))}
                      className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-mono disabled:cursor-not-allowed font-bold"
                    />
                    {selectedClassId && !isWaitingClass && (() => {
                      const foundClass = classes.find(c => c.id === selectedClassId);
                      if (!foundClass) return null;
                      const isAfter = foundClass.ngayKetThuc && startDate > foundClass.ngayKetThuc;
                      return (
                        <div className={`text-[10px] font-medium flex items-start gap-1 mt-1 ${isAfter ? 'text-rose-400' : 'text-emerald-400'}`}>
                          <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          {isAfter ? (
                            <span>⚠️ Ngày bắt đầu ({formatToVNDate(startDate)}) sau ngày kết thúc lớp ({formatToVNDate(foundClass.ngayKetThuc)}).</span>
                          ) : (
                            <span>
                              ⚡ Tự tính: <strong>{soBuoiHoc} buổi</strong> (từ {formatToVNDate(startDate)} đến kết thúc lớp {formatToVNDate(foundClass.ngayKetThuc || foundClass.ngayBatDau)})
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

              </div>

              <div className="bg-slate-950/40 px-6 py-4 border-t border-white/10 flex justify-end gap-2.5 sticky bottom-0 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition active:scale-95 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl font-bold transition active:scale-95 shadow-lg shadow-sky-500/20 cursor-pointer"
                >
                  {editingStudent ? 'Cập Nhật Hồ Sơ' : 'Lưu Đăng Ký Học Viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
