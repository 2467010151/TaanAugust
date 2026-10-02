import React, { useState } from 'react';
import { LopHoc, DanhSachLop } from '../types';
import RoyalLogo from './RoyalLogo';
import { Calendar, ChevronLeft, ChevronRight, CheckSquare, Square, Info, MapPin, Clock, Users, Search, Filter } from 'lucide-react';

interface ScheduleManagerProps {
  classes: LopHoc[];
  danhSachLop: DanhSachLop[];
}

export default function ScheduleManager({ classes, danhSachLop }: ScheduleManagerProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 6, 1));
  const [selectedStatusTab, setSelectedStatusTab] = useState<'all' | 'Đang hoạt động' | 'Dự kiến' | 'Đã khóa'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [checkedClassIds, setCheckedClassIds] = useState<Record<string, boolean>>(() => {
    return classes.reduce((acc, cls) => {
      acc[cls.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
  });

  const getSiSoThucTe = (lopId: string) => {
    return danhSachLop.filter((item) => item.idLop === lopId).length;
  };

  const getDayCode = (dayOfWeek: number): string => {
    const map: Record<number, string> = {
      1: 'T2',
      2: 'T3',
      3: 'T4',
      4: 'T5',
      5: 'T6',
      6: 'T7',
      0: 'CN',
    };
    return map[dayOfWeek] || '';
  };

  const getStatusBadgeStyles = (status?: string) => {
    switch (status) {
      case 'Dự kiến':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Đã khóa':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToggleSelectAll = (check: boolean) => {
    const updated = { ...checkedClassIds };
    filteredClassesForList.forEach((cls) => {
      updated[cls.id] = check;
    });
    setCheckedClassIds(updated);
  };

  const toggleClassCheck = (classId: string) => {
    setCheckedClassIds((prev) => ({
      ...prev,
      [classId]: !prev[classId],
    }));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const firstDayOfMonth = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  
  const startDay = firstDayOfMonth.getDay();
  const emptyCellsBefore = startDay === 0 ? 6 : startDay - 1;

  const calendarDays: { dayNum: number | null; dateObj: Date | null }[] = [];
  
  for (let i = 0; i < emptyCellsBefore; i++) {
    calendarDays.push({ dayNum: null, dateObj: null });
  }
  
  for (let d = 1; d <= totalDays; d++) {
    calendarDays.push({
      dayNum: d,
      dateObj: new Date(year, month, d),
    });
  }

  const totalCells = Math.ceil(calendarDays.length / 7) * 7;
  const emptyCellsAfter = totalCells - calendarDays.length;
  for (let i = 0; i < emptyCellsAfter; i++) {
    calendarDays.push({ dayNum: null, dateObj: null });
  }

  const filteredClassesForList = classes.filter((cls) => {
    const matchesStatus = selectedStatusTab === 'all' || (cls.trangThai || 'Đang hoạt động') === selectedStatusTab;
    const matchesSearch = cls.tenMon.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          cls.phongHoc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getClassesForDay = (date: Date) => {
    const dayOfWeek = date.getDay();
    const dayCode = getDayCode(dayOfWeek);

    return classes.filter((cls) => {
      if (!checkedClassIds[cls.id]) return false;
      return cls.days && cls.days.includes(dayCode);
    });
  };

  return (
    <div className="space-y-6 animate-fade-in" id="schedule-tab-section">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/40 backdrop-blur-md p-5 border border-white/10 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <RoyalLogo className="w-9 h-9 shrink-0" />
            <h1 className="text-xl font-display font-bold text-white uppercase tracking-wide">
              Lịch Học Lớp Ngoại Khóa
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Xem lịch học hàng tuần tổng quan dưới dạng lịch tháng. Lọc theo trạng thái và cấu hình hiển thị lớp linh hoạt.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-950/60 p-1.5 rounded-xl border border-white/5">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition active:scale-95 cursor-pointer"
            title="Tháng trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-white px-4 font-display min-w-[120px] text-center uppercase tracking-wider">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition active:scale-95 cursor-pointer"
            title="Tháng sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel rounded-2xl p-5 shadow-2xl space-y-4 border border-white/10">
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                Tìm kiếm lớp học
              </span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm tên lớp hoặc phòng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-white text-xs placeholder-slate-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block flex items-center gap-1">
                <Filter className="w-3 h-3 text-sky-400" /> Trạng thái lớp học
              </span>
              <div className="flex flex-col gap-1 bg-slate-950/40 p-1 rounded-xl border border-white/5">
                {[
                  { id: 'all', label: 'Tất cả lớp học' },
                  { id: 'Đang hoạt động', label: '🟢 Đang hoạt động' },
                  { id: 'Dự kiến', label: '🟡 Dự kiến mở' },
                  { id: 'Đã khóa', label: '🔴 Đã khóa' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedStatusTab(tab.id as any)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition flex justify-between items-center cursor-pointer ${
                      selectedStatusTab === tab.id
                        ? 'bg-sky-500 text-slate-950 shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      selectedStatusTab === tab.id ? 'bg-slate-950/20 text-slate-950' : 'bg-white/5 text-slate-400'
                    }`}>
                      {tab.id === 'all'
                        ? classes.length
                        : classes.filter((c) => (c.trangThai || 'Đang hoạt động') === tab.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Hiển thị lịch ({filteredClassesForList.length})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleSelectAll(true)}
                    className="text-[10px] text-sky-400 hover:text-sky-300 font-bold hover:underline cursor-pointer"
                  >
                    Chọn hết
                  </button>
                  <span className="text-slate-600 text-[10px]">|</span>
                  <button
                    onClick={() => handleToggleSelectAll(false)}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-bold hover:underline cursor-pointer"
                  >
                    Bỏ hết
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
                {filteredClassesForList.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs font-medium">
                    Không tìm thấy lớp học nào.
                  </div>
                ) : (
                  filteredClassesForList.map((cls) => {
                    const isChecked = !!checkedClassIds[cls.id];
                    const currentSiSo = getSiSoThucTe(cls.id);
                    return (
                      <div
                        key={cls.id}
                        onClick={() => toggleClassCheck(cls.id)}
                        className={`p-2.5 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                          isChecked
                            ? 'bg-sky-950/10 border-sky-500/20 hover:bg-sky-950/20'
                            : 'bg-transparent border-white/5 hover:border-white/10 text-slate-400'
                        }`}
                      >
                        <button className="pt-0.5 text-sky-400 focus:outline-none">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 fill-sky-500/10" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600" />
                          )}
                        </button>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start gap-1">
                            <span className={`text-xs font-bold ${isChecked ? 'text-white' : 'text-slate-400'}`}>
                              {cls.tenMon}
                            </span>
                            <span className="text-[9px] bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded font-mono font-bold whitespace-nowrap">
                              {cls.id}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-sky-400" /> {cls.time} ({cls.days.join(',')})
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-rose-400" /> {cls.phongHoc.split(' - ')[0]}
                            </span>
                            <span className="flex items-center gap-0.5 font-bold text-slate-300">
                              <Users className="w-3 h-3 text-emerald-400" /> {currentSiSo}/{cls.siSoToiDa} HS
                            </span>
                          </div>

                          <div className="pt-1">
                            <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-bold ${getStatusBadgeStyles(cls.trangThai)}`}>
                              {cls.trangThai || 'Đang hoạt động'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-sky-500/5 border border-sky-500/10 p-3 rounded-xl flex gap-2">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Tích chọn các lớp học ở danh sách phía trên để đưa lịch học của lớp đó hiển thị trực quan lên bảng lịch tháng ở bên phải.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="glass-panel rounded-2xl p-5 shadow-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-pulse"></div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400 block">
                  Bảng Lịch Học Theo Tháng
                </span>
              </div>
              <span className="text-[10px] bg-slate-950 border border-white/5 px-2.5 py-1 rounded-lg text-slate-400 font-mono">
                Thứ 2 → Chủ Nhật
              </span>
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden bg-slate-950/20">
              <div className="grid grid-cols-7 border-b border-white/10 bg-white/5 text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400 py-3">
                <div>Thứ 2</div>
                <div>Thứ 3</div>
                <div>Thứ 4</div>
                <div>Thứ 5</div>
                <div>Thứ 6</div>
                <div>Thứ 7</div>
                <div className="text-rose-400">Chủ Nhật</div>
              </div>

              <div className="grid grid-cols-7 bg-slate-950/40 divide-x divide-y divide-white/15 min-h-[480px]">
                {calendarDays.map((cell, index) => {
                  const { dayNum, dateObj } = cell;
                  const dayOfWeek = dateObj ? dateObj.getDay() : null;
                  const isSunday = dayOfWeek === 0;

                  const isMockToday = dateObj && 
                    dateObj.getFullYear() === 2026 && 
                    dateObj.getMonth() === 6 && 
                    dateObj.getDate() === 9;

                  const actualToday = new Date();
                  const isActualToday = dateObj && 
                    dateObj.getFullYear() === actualToday.getFullYear() && 
                    dateObj.getMonth() === actualToday.getMonth() && 
                    dateObj.getDate() === actualToday.getDate();

                  const isToday = isMockToday || isActualToday;
                  
                  const classesToday = dateObj ? getClassesForDay(dateObj) : [];

                  return (
                    <div
                      key={index}
                      className={`p-1.5 min-h-[90px] flex flex-col justify-between transition-colors duration-150 relative ${
                        dayNum === null
                          ? 'bg-slate-950/20'
                          : isToday
                            ? 'bg-white shadow-[0_0_25px_rgba(255,255,255,0.25)] text-slate-950 border-2 border-sky-400/50'
                            : 'hover:bg-white/3 group'
                      }`}
                    >
                      {dayNum !== null && (
                        <div className="flex justify-between items-center mb-1.5">
                          <span className={`text-[11px] font-bold font-mono px-1.5 py-0.5 rounded-md ${
                            isToday
                              ? isSunday 
                                ? 'text-rose-600 bg-rose-500/10' 
                                : 'text-slate-950 bg-slate-900/10'
                              : isSunday 
                                ? 'text-rose-400 bg-rose-500/5' 
                                : 'text-slate-300'
                          }`}>
                            {dayNum} {isToday && <span className="text-[9px] font-sans font-bold text-sky-600 ml-0.5">(Hôm nay)</span>}
                          </span>
                          {classesToday.length > 0 && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                              isToday ? 'bg-sky-500/15 text-sky-700' : 'bg-sky-500/10 text-sky-400'
                            }`}>
                              {classesToday.length} ca
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[85px] scrollbar-none pb-1">
                        {dayNum !== null && classesToday.map((cls) => {
                          const statusStyle = isToday
                            ? cls.trangThai === 'Dự kiến'
                              ? 'border-amber-600/35 bg-amber-500/10 text-amber-800'
                              : cls.trangThai === 'Đã khóa'
                                ? 'border-rose-600/35 bg-rose-500/10 text-rose-800 line-through opacity-70'
                                : 'border-sky-600/35 bg-sky-500/10 text-sky-800'
                            : cls.trangThai === 'Dự kiến' 
                              ? 'border-amber-500/20 bg-amber-500/5 text-amber-300'
                              : cls.trangThai === 'Đã khóa'
                                ? 'border-rose-500/20 bg-rose-500/5 text-rose-300 line-through opacity-70'
                                : 'border-sky-500/20 bg-sky-500/5 text-sky-300';
                          return (
                            <div
                              key={cls.id}
                              className={`p-1 rounded text-[9px] border font-medium space-y-0.5 shadow-sm leading-tight hover:brightness-110 transition ${statusStyle}`}
                              title={`${cls.tenMon} (${cls.id}) \nPhòng: ${cls.phongHoc} \nGiờ học: ${cls.time}`}
                            >
                              <div className="font-bold truncate">{cls.tenMon}</div>
                              <div className="flex items-center justify-between text-[8px] font-mono opacity-90">
                                <span>🕒 {cls.time}</span>
                                <span className={`truncate max-w-[40px] text-[7px] ${isToday ? 'text-slate-600 font-semibold' : 'text-slate-400'}`}>
                                  📍 {cls.phongHoc.split(' - ')[0]}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {dayNum !== null && !isToday && (
                        <div className="absolute inset-0 bg-sky-500/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-slate-400 pt-2 border-t border-white/5">
              <span className="font-semibold uppercase tracking-wider text-slate-500">Ghi chú màu sắc:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-sky-500/10 border border-sky-500/30"></span>
                <span>Lớp Đang hoạt động</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500/10 border border-amber-500/30"></span>
                <span>Lớp Dự kiến mở</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-500/10 border border-rose-500/30 line-through"></span>
                <span>Lớp Đã khóa</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
