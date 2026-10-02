import React, { useState, useMemo, useEffect } from 'react';
import { LopHoc, DanhSachLop, MonHoc, CoSo, calculateEndDate, formatToVNDate } from '../types';
import RoyalLogo from './RoyalLogo';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  ShieldAlert, 
  Check, 
  Lock, 
  Award, 
  Sparkles, 
  Building2, 
  Clock, 
  CheckCircle2,
  CalendarCheck,
  Calculator
} from 'lucide-react';

interface ClassManagerProps {
  classes: LopHoc[];
  danhSachLop: DanhSachLop[];
  monHocList?: MonHoc[];
  coSoList?: CoSo[];
  onAddClass: (classData: Omit<LopHoc, 'id'>) => void;
  onEditClass: (classData: LopHoc) => void;
  onDeleteClass: (classId: string) => void;
}

export default function ClassManager({
  classes,
  danhSachLop,
  monHocList = [],
  coSoList = [],
  onAddClass,
  onEditClass,
  onDeleteClass,
}: ClassManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDay, setSelectedDay] = useState<'all' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6' | 'T7' | 'CN'>('all');
  const [selectedCoSoFilter, setSelectedCoSoFilter] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<LopHoc | null>(null);

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

  // Form states
  const [selectedSubject, setSelectedSubject] = useState('');
  const [tenLop, setTenLop] = useState('');
  const [coSo, setCoSo] = useState('');
  const [room, setRoom] = useState('');
  const [capacity, setCapacity] = useState(10);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [classTime, setClassTime] = useState('17:30');
  const [trangThai, setTrangThai] = useState<'Đang hoạt động' | 'Dự kiến' | 'Đã khóa'>('Đang hoạt động');
  const [soBuoiHoc, setSoBuoiHoc] = useState<number>(24);
  const [startDate, setStartDate] = useState('2026-07-01');

  // Tính thời gian kết thúc tự động dựa trên: Thời gian bắt đầu, Các ngày học trong tuần, và Số buổi học
  const calculatedEndDate = useMemo(() => {
    if (!startDate || selectedDays.length === 0 || !soBuoiHoc) return '';
    return calculateEndDate(startDate, selectedDays, Number(soBuoiHoc));
  }, [startDate, selectedDays, soBuoiHoc]);

  const getSiSoThucTe = (lopId: string) => {
    return danhSachLop.filter((item) => item.idLop === lopId).length;
  };

  const toggleDaySelection = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays((prev) => prev.filter((d) => d !== day));
    } else {
      setSelectedDays((prev) => [...prev, day]);
    }
  };

  const formatLichHocCoDinh = (days: string[], time: string) => {
    if (days.length === 0) return `Chưa xếp lịch lúc ${time}`;
    const dayMap: Record<string, string> = {
      'T2': 'Thứ 2',
      'T3': 'Thứ 3',
      'T4': 'Thứ 4',
      'T5': 'Thứ 5',
      'T6': 'Thứ 6',
      'T7': 'Thứ 7',
      'CN': 'Chủ Nhật',
    };
    const mappedDays = days.map((d) => dayMap[d] || d);
    return `${mappedDays.join(', ')} lúc ${time}`;
  };

  const openAddModal = () => {
    setEditingClass(null);
    const defaultMh = monHocList[0]?.tenMon || '';
    setSelectedSubject(defaultMh);
    const existingCount = classes.filter((c) => c.tenMon === defaultMh).length;
    setTenLop(defaultMh ? `${defaultMh} - Lớp ${existingCount + 1}` : '');
    setCoSo(coSoList[0]?.name || '');
    setRoom('Phòng 101 - Apollo');
    setCapacity(12);
    setSelectedDays(['T2', 'T4']);
    setClassTime('17:30');
    setTrangThai('Đang hoạt động');
    const mhObj = monHocList.find((m) => m.tenMon === defaultMh);
    setSoBuoiHoc(mhObj?.soBuoiHoc || 24);
    setStartDate('2026-07-01');
    setIsModalOpen(true);
  };

  const openEditModal = (cls: LopHoc) => {
    setEditingClass(cls);
    setSelectedSubject(cls.tenMon);
    setTenLop(cls.tenLop || cls.tenMon);
    setCoSo(cls.coSo || coSoList[0]?.name || '');
    setRoom(cls.phongHoc);
    setCapacity(cls.siSoToiDa);
    setSelectedDays(cls.days || []);
    setClassTime(cls.time || '17:30');
    setTrangThai(cls.trangThai || 'Đang hoạt động');
    setSoBuoiHoc(cls.soBuoiHoc || 24);
    setStartDate(cls.ngayBatDau || '2026-07-01');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject.trim()) {
      alert('❌ Vui lòng chọn môn học từ dữ liệu hệ thống!');
      return;
    }
    if (!tenLop.trim()) {
      alert('❌ Vui lòng nhập Tên lớp học!');
      return;
    }
    if (!coSo.trim()) {
      alert('❌ Vui lòng chọn Cơ sở học!');
      return;
    }
    if (!room.trim() || selectedDays.length === 0) {
      alert('❌ Vui lòng điền phòng học và chọn ít nhất một ngày học trong tuần!');
      return;
    }
    if (!startDate) {
      alert('❌ Vui lòng chọn Thời gian bắt đầu!');
      return;
    }

    const isDuplicate = classes.some(
      (c) =>
        (c.tenLop?.trim().toLowerCase() === tenLop.trim().toLowerCase() ||
          c.tenMon.trim().toLowerCase() === tenLop.trim().toLowerCase()) &&
        (!editingClass || c.id !== editingClass.id)
    );
    if (isDuplicate) {
      alert(`⚠️ Tên lớp học "${tenLop}" đã tồn tại trong hệ thống! Vui lòng đặt tên khác.`);
      return;
    }

    const scheduleStr = formatLichHocCoDinh(selectedDays, classTime);

    if (editingClass) {
      onEditClass({
        id: editingClass.id,
        tenMon: selectedSubject.trim(),
        tenLop: tenLop.trim(),
        coSo: coSo.trim(),
        phongHoc: room.trim(),
        siSoToiDa: Number(capacity),
        lichHocCoDinh: scheduleStr,
        days: selectedDays,
        time: classTime,
        trangThai: trangThai,
        soBuoiHoc: Number(soBuoiHoc),
        ngayBatDau: startDate,
        ngayKetThuc: calculatedEndDate,
      });
      alert(`✅ Cập nhật lớp học "${tenLop}" thành công!`);
    } else {
      onAddClass({
        tenMon: selectedSubject.trim(),
        tenLop: tenLop.trim(),
        coSo: coSo.trim(),
        phongHoc: room.trim(),
        siSoToiDa: Number(capacity),
        lichHocCoDinh: scheduleStr,
        days: selectedDays,
        time: classTime,
        trangThai: trangThai,
        soBuoiHoc: Number(soBuoiHoc),
        ngayBatDau: startDate,
        ngayKetThuc: calculatedEndDate,
      });
      alert(`🎉 Thêm lớp học ngoại khóa "${tenLop}" thành công!`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (cls: LopHoc) => {
    const studentCount = getSiSoThucTe(cls.id);
    const displayName = cls.tenLop || cls.tenMon;
    let confirmMsg = `Bạn có chắc chắn muốn xóa lớp "${displayName}"?`;
    if (studentCount > 0) {
      confirmMsg = `⚠️ CẢNH BÁO: Lớp "${displayName}" đang có ${studentCount} học viên đang theo học.\nNếu xóa lớp, các thông tin xếp lớp này sẽ bị gỡ bỏ.\n\nBạn vẫn muốn xóa lớp này chứ?`;
    }

    if (window.confirm(confirmMsg)) {
      onDeleteClass(cls.id);
    }
  };

  const filteredClasses = classes.filter((cls) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (cls.tenLop || '').toLowerCase().includes(term) ||
      cls.tenMon.toLowerCase().includes(term) ||
      cls.phongHoc.toLowerCase().includes(term) ||
      (cls.coSo || '').toLowerCase().includes(term) ||
      cls.id.toLowerCase().includes(term);

    const matchesDay = selectedDay === 'all' || (cls.days && cls.days.includes(selectedDay));
    const matchesCoSo = selectedCoSoFilter === 'all' || cls.coSo === selectedCoSoFilter;

    return matchesSearch && matchesDay && matchesCoSo;
  });

  const activeClassesCount = classes.filter((c) => c.trangThai === 'Đang hoạt động' || !c.trangThai).length;
  const closedClassesCount = classes.filter((c) => c.trangThai === 'Đã khóa').length;
  const upcomingClassesCount = classes.filter((c) => c.trangThai === 'Dự kiến').length;
  const totalCapacity = classes.reduce((sum, c) => sum + c.siSoToiDa, 0);
  const totalEnrolled = classes.reduce((sum, c) => sum + getSiSoThucTe(c.id), 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <RoyalLogo className="w-8 h-8" />
            <h1 className="text-xl font-display font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              Quản Lý Lớp Học Ngoại Khóa
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono border border-sky-500/30 lowercase">
                {classes.length} lớp học
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý danh sách lớp học, phòng ốc, cơ sở đào tạo, số buổi và thời gian kết thúc tự động tính.
          </p>
        </div>

        <button
          id="btn-add-class-manager"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95 transition duration-150 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Thêm Lớp Học Mới
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Lớp Hoạt Động</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
          <div className="text-2xl font-display font-extrabold text-emerald-400 font-mono">{activeClassesCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Sẵn sàng nhận học sinh</div>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Lớp Dự Kiến</span>
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          </div>
          <div className="text-2xl font-display font-extrabold text-amber-400 font-mono">{upcomingClassesCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Đang tuyển sinh mới</div>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Lớp Đã Khóa</span>
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
          </div>
          <div className="text-2xl font-display font-extrabold text-rose-400 font-mono">{closedClassesCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Đã kết thúc khóa học</div>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Sĩ Số Đang Học</span>
            <Users className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-display font-extrabold text-sky-400 font-mono">
            {totalEnrolled} <span className="text-xs font-normal text-slate-400">/ {totalCapacity}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Lấp đầy {totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0}% công suất
          </div>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="search-classes-input"
              type="text"
              placeholder="Tìm theo tên lớp, môn học, cơ sở, phòng học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass-input rounded-xl pl-10 pr-4 py-2 text-white text-xs placeholder-slate-400"
            />
          </div>

          {/* Campus Filter */}
          {coSoList && coSoList.length > 0 && (
            <div className="w-full md:w-56">
              <select
                value={selectedCoSoFilter}
                onChange={(e) => setSelectedCoSoFilter(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 text-xs rounded-xl px-3 py-2 text-slate-200 cursor-pointer"
              >
                <option value="all">🏢 Tất cả cơ sở</option>
                {coSoList.map((cs) => (
                  <option key={cs.id} value={cs.name} className="bg-slate-950 text-white">
                    {cs.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Day of Week Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 pl-1 whitespace-nowrap">
              <Filter className="w-3.5 h-3.5 text-sky-400" /> Thứ:
            </span>
            <div className="flex gap-1">
              {(['all', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const).map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedDay === day
                      ? 'bg-sky-500 text-slate-950 shadow-md'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {day === 'all' ? 'Tất cả' : day}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/20">
          <table className="w-full border-collapse text-left" id="table-classes-list">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                <th className="py-3 px-4">Mã lớp</th>
                <th className="py-3 px-4">Lớp học &amp; Môn học</th>
                <th className="py-3 px-4">Cơ sở &amp; Địa điểm</th>
                <th className="py-3 px-4">Lịch học &amp; Thời hạn khóa</th>
                <th className="py-3 px-4 text-center">Sĩ số học viên</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 font-medium">
                    Không tìm thấy lớp học nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredClasses.map((cls) => {
                  const currentSiSo = getSiSoThucTe(cls.id);
                  const isFull = currentSiSo >= cls.siSoToiDa;
                  const fillPercent = (currentSiSo / cls.siSoToiDa) * 100;
                  const displayName = cls.tenLop || cls.tenMon;

                  return (
                    <tr key={cls.id} className="hover:bg-white/5 transition">
                      {/* Class ID */}
                      <td className="py-4 px-4 font-mono font-bold text-sky-400">
                        <span className="bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded text-[10px]">
                          {cls.id}
                        </span>
                      </td>

                      {/* Class Name & Subject */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-white text-sm">{displayName}</div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="bg-sky-500/15 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                            <Award className="w-3 h-3 text-sky-400" />
                            {cls.tenMon}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              cls.trangThai === 'Dự kiến'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : cls.trangThai === 'Đã khóa'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {cls.trangThai || 'Đang hoạt động'}
                          </span>
                          <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                            ⏱ {cls.soBuoiHoc || 24} buổi
                          </span>
                        </div>
                      </td>

                      {/* Campus & Room */}
                      <td className="py-4 px-4 text-slate-300">
                        <div className="space-y-1">
                          {cls.coSo && (
                            <div className="flex items-center gap-1.5 text-amber-300 text-[11px] font-medium">
                              <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="truncate max-w-[200px]" title={cls.coSo}>
                                {cls.coSo}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span>{cls.phongHoc}</span>
                          </div>
                        </div>
                      </td>

                      {/* Schedule & Duration Dates */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span>{cls.lichHocCoDinh}</span>
                          </div>
                          {(cls.ngayBatDau || cls.ngayKetThuc) && (
                            <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                              <CalendarCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>
                                {formatToVNDate(cls.ngayBatDau)} ➔ {formatToVNDate(cls.ngayKetThuc)}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Capacity */}
                      <td className="py-4 px-4">
                        <div className="max-w-[140px] mx-auto space-y-1.5">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className={`font-bold ${isFull ? 'text-rose-400' : 'text-slate-300'}`}>
                              {currentSiSo} / {cls.siSoToiDa} học sinh
                            </span>
                            <span className="text-slate-500 font-medium">
                              {Math.round(fillPercent)}%
                            </span>
                          </div>
                          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isFull ? 'bg-rose-500' : fillPercent >= 80 ? 'bg-amber-500' : 'bg-sky-500'
                              }`}
                              style={{ width: `${Math.min(fillPercent, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(cls)}
                            className="p-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg border border-sky-500/20 transition cursor-pointer"
                            title="Chỉnh sửa thông tin lớp"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cls)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition cursor-pointer"
                            title="Xóa lớp học"
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
      </div>

      {/* MODAL: Thêm mới / Chỉnh sửa lớp học ngoại khóa */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div 
            className="max-w-xl w-full mx-auto my-auto max-h-[92vh] overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-panel w-full overflow-hidden shadow-2xl border border-white/25 rounded-2xl flex flex-col">
              <div className="bg-slate-900/80 border-b border-white/10 text-white px-6 py-4 flex justify-between items-center backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <RoyalLogo className="w-6 h-6 shrink-0" />
                  <h3 className="font-display font-bold text-base uppercase tracking-wide">
                    {editingClass ? `Chỉnh Sửa Lớp Học [${editingClass.id}]` : 'Thêm Lớp Học Ngoại Khóa Mới'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white font-bold text-lg transition cursor-pointer p-1 hover:bg-white/5 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-1">
                <div className="p-6 space-y-4 text-xs">
                  {/* MÔN HỌC - Load từ dữ liệu hệ thống (monHocList) */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-300 uppercase tracking-wide flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-sky-400" />
                        Môn học <span className="text-rose-400">*</span>
                      </span>
                      <span className="text-[10px] text-sky-400 font-normal">Nạp từ dữ liệu hệ thống</span>
                    </label>

                    {monHocList && monHocList.length > 0 ? (
                      <select
                        id="select-class-mon-hoc"
                        required
                        value={selectedSubject}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedSubject(val);
                          const mh = monHocList.find((m) => m.tenMon === val);
                          if (mh) {
                            setSoBuoiHoc(mh.soBuoiHoc);
                            // Auto-suggest class name if empty
                            const sameSubjectCount = classes.filter((c) => c.tenMon === val).length;
                            setTenLop(`${val} - Lớp 0${sameSubjectCount + 1}`);
                          }
                        }}
                        className="w-full bg-slate-900 border border-white/15 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-sky-500 font-bold cursor-pointer text-slate-200"
                      >
                        <option value="">-- Chọn môn học ({monHocList.length} môn trong hệ thống) --</option>
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
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-medium"
                      />
                    )}

                    {(() => {
                      const selectedMh = monHocList.find((m) => m.tenMon === selectedSubject);
                      if (!selectedMh) return null;
                      return (
                        <div className="bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 rounded-lg flex items-center justify-between text-[11px] text-sky-300">
                          <span>Mã môn: <strong className="font-mono text-white">{selectedMh.id}</strong></span>
                          <span>Định mức: <strong className="text-white">{selectedMh.soBuoiHoc} buổi</strong></span>
                          <span>Học phí: <strong className="text-amber-400 font-mono">{selectedMh.hocPhiTheoKhoa.toLocaleString('vi-VN')} đ</strong></span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* TÊN LỚP HỌC */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                      Tên lớp học <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="input-class-ten-lop"
                      type="text"
                      required
                      placeholder="Ví dụ: Bóng rổ K1, Bóng đá Chiều Thứ 7, Bơi lội Căn bản A1..."
                      value={tenLop}
                      onChange={(e) => setTenLop(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-bold placeholder-slate-500"
                    />
                    <p className="text-[10px] text-slate-400">
                      Tên định danh riêng của lớp học (phân biệt giữa các ca học và khóa khác nhau).
                    </p>
                  </div>

                  {/* CƠ SỞ - Load từ dữ liệu hệ thống (coSoList) */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-300 uppercase tracking-wide flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-amber-400" />
                        Cơ sở học tập <span className="text-rose-400">*</span>
                      </span>
                      <span className="text-[10px] text-amber-400 font-normal">Nạp từ dữ liệu hệ thống</span>
                    </label>
                    <select
                      id="select-class-co-so"
                      required
                      value={coSo}
                      onChange={(e) => setCoSo(e.target.value)}
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
                        id="input-class-room"
                        type="text"
                        required
                        placeholder="Ví dụ: Phòng 101, Sân A..."
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-medium placeholder-slate-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-sky-400" />
                        Sĩ số học sinh tối đa <span className="text-rose-400">*</span>
                      </label>
                      <input
                        id="input-class-capacity"
                        type="number"
                        required
                        min={2}
                        max={50}
                        value={capacity}
                        onChange={(e) => setCapacity(Number(e.target.value))}
                        className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* LỊCH HỌC TRONG TUẦN & GIỜ HỌC */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide flex items-center justify-between">
                      <span>Chọn các ngày học cố định hàng tuần <span className="text-rose-400">*</span></span>
                      <span className="text-[10px] text-sky-400 font-mono">Đã chọn: {selectedDays.length} ngày</span>
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 pt-1">
                      {(['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const).map((day) => {
                        const isSelected = selectedDays.includes(day);
                        const dayLabelMap: Record<string, string> = {
                          'T2': 'Thứ 2', 'T3': 'Thứ 3', 'T4': 'Thứ 4', 'T5': 'Thứ 5',
                          'T6': 'Thứ 6', 'T7': 'Thứ 7', 'CN': 'Chủ Nhật'
                        };
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDaySelection(day)}
                            className={`py-2 rounded-xl text-[11px] font-bold border transition duration-150 cursor-pointer ${
                              isSelected
                                ? 'bg-sky-500 border-sky-400 text-slate-950 font-extrabold shadow-md'
                                : 'bg-slate-900 border-white/10 text-slate-300 hover:border-white/25 hover:bg-white/5'
                            }`}
                          >
                            {dayLabelMap[day]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-sky-400" />
                        Giờ học cố định <span className="text-rose-400">*</span>
                      </label>
                      <input
                        id="input-class-time"
                        type="time"
                        required
                        value={classTime}
                        onChange={(e) => setClassTime(e.target.value)}
                        className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-mono cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-bold text-slate-400 uppercase tracking-wide">
                        Trạng thái lớp học <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={trangThai}
                        onChange={(e) => setTrangThai(e.target.value as any)}
                        className="w-full bg-slate-900 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-sky-500 cursor-pointer"
                      >
                        <option value="Đang hoạt động">🟢 Đang hoạt động</option>
                        <option value="Dự kiến">🟡 Dự kiến mở</option>
                        <option value="Đã khóa">🔴 Đã khóa</option>
                      </select>
                    </div>
                  </div>

                  {/* SỐ BUỔI HỌC, THỜI GIAN BẮT ĐẦU & THỜI GIAN KẾT THÚC (TỰ TÍNH) */}
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-sky-500/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Calculator className="w-4 h-4 text-sky-400" />
                        Tính toán thời lượng khóa học
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
                          id="input-so-buoi-hoc"
                          type="number"
                          required
                          min={1}
                          max={100}
                          value={soBuoiHoc}
                          onChange={(e) => setSoBuoiHoc(Number(e.target.value))}
                          className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-bold font-mono"
                        />
                        <div className="flex gap-1 pt-0.5">
                          {[12, 16, 24, 36].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setSoBuoiHoc(num)}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono border transition ${
                                soBuoiHoc === num
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
                          id="input-thoi-gian-bat-dau"
                          type="date"
                          required
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-mono cursor-pointer"
                        />
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {formatToVNDate(startDate)}
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
                          <span>{calculatedEndDate ? formatToVNDate(calculatedEndDate) : '-- / -- / ----'}</span>
                          <CalendarCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        </div>
                        <span className="text-[10px] text-emerald-300/80 block font-mono">
                          {calculatedEndDate ? `(Dự kiến: ${calculatedEndDate})` : 'Cần chọn ngày bắt đầu & lịch học'}
                        </span>
                      </div>
                    </div>

                    {/* Preview box */}
                    {calculatedEndDate && selectedDays.length > 0 && (
                      <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 flex items-start gap-2.5 text-sky-200">
                        <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                        <div className="text-[11px] leading-relaxed">
                          Lớp học gồm <strong>{soBuoiHoc} buổi</strong> diễn ra vào các ngày <strong>{formatLichHocCoDinh(selectedDays, classTime)}</strong>, bắt đầu từ <strong>{formatToVNDate(startDate)}</strong> và hoàn tất vào <strong>{formatToVNDate(calculatedEndDate)}</strong>.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-950/40 px-6 py-4 border-t border-white/10 flex justify-end gap-2.5 sticky bottom-0 backdrop-blur-md">
                  {editingClass && trangThai !== 'Đã khóa' && (
                    <button
                      type="button"
                      onClick={() => {
                        const displayName = editingClass.tenLop || editingClass.tenMon;
                        if (
                          window.confirm(
                            `🔒 Bạn có chắc chắn muốn khóa lớp học "${displayName}" vì đã hoàn thành khóa học?\n\nTrạng thái sẽ chuyển thành "Đã khóa".`
                          )
                        ) {
                          onEditClass({
                            ...editingClass,
                            trangThai: 'Đã khóa',
                          });
                          setIsModalOpen(false);
                          alert(`🔒 Đã khóa lớp "${displayName}" thành công!`);
                        }
                      }}
                      className="mr-auto px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl font-bold border border-rose-500/20 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Khóa lớp
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition active:scale-95 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 rounded-xl font-bold transition active:scale-95 shadow-lg shadow-sky-500/20 cursor-pointer flex items-center gap-1.5"
                  >
                    {editingClass ? 'Lưu Thay Đổi' : 'Thêm Lớp Học'}
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
