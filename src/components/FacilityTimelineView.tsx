import React, { useState, useMemo } from 'react';
import { LopHoc, FacilityItem, INITIAL_FACILITIES, DanhSachLop } from '../types';
import { 
  Building2, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Layers, 
  Users, 
  Sparkles, 
  Filter, 
  Search,
  Check
} from 'lucide-react';

interface FacilityTimelineViewProps {
  classes: LopHoc[];
  danhSachLop: DanhSachLop[];
  facilities?: FacilityItem[];
}

const DAYS_OF_WEEK = [
  { key: 'T2', label: 'Thứ 2' },
  { key: 'T3', label: 'Thứ 3' },
  { key: 'T4', label: 'Thứ 4' },
  { key: 'T5', label: 'Thứ 5' },
  { key: 'T6', label: 'Thứ 6' },
  { key: 'T7', label: 'Thứ 7' },
  { key: 'CN', label: 'Chủ Nhật' },
];

export default function FacilityTimelineView({
  classes,
  danhSachLop,
  facilities = INITIAL_FACILITIES,
}: FacilityTimelineViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('all');

  const filteredFacilities = useMemo(() => {
    return facilities.filter(f => {
      const matchCat = selectedCategory === 'all' || f.category === selectedCategory;
      const matchSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.location.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [facilities, selectedCategory, searchTerm]);

  const getClassesForFacilityAndDay = (facility: FacilityItem, dayKey: string) => {
    return classes.filter(cls => {
      const matchFacility = 
        cls.phongHoc?.toLowerCase().includes(facility.name.toLowerCase()) ||
        facility.name.toLowerCase().includes(cls.phongHoc?.toLowerCase()) ||
        (cls.coSo && facility.name.toLowerCase().includes(cls.coSo.toLowerCase()));

      const matchDay = cls.days?.includes(dayKey) || cls.lichHocCoDinh?.includes(dayKey);
      return matchFacility && matchDay;
    });
  };

  const conflicts = useMemo(() => {
    const conflictList: {
      facilityId: string;
      facilityName: string;
      day: string;
      class1: LopHoc;
      class2: LopHoc;
    }[] = [];

    facilities.forEach(fac => {
      DAYS_OF_WEEK.forEach(day => {
        const assignedClasses = classes.filter(cls => {
          const matchFac = cls.phongHoc?.toLowerCase().includes(fac.name.toLowerCase()) ||
                           fac.name.toLowerCase().includes(cls.phongHoc?.toLowerCase());
          const matchDay = cls.days?.includes(day.key) || cls.lichHocCoDinh?.includes(day.key);
          return matchFac && matchDay;
        });

        if (assignedClasses.length > 1) {
          for (let i = 0; i < assignedClasses.length; i++) {
            for (let j = i + 1; j < assignedClasses.length; j++) {
              conflictList.push({
                facilityId: fac.id,
                facilityName: fac.name,
                day: day.label,
                class1: assignedClasses[i],
                class2: assignedClasses[j],
              });
            }
          }
        }
      });
    });

    return conflictList;
  }, [facilities, classes]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-display font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-400" />
            <span>LƯỚI MA TRẬN THỜI KHÓA BIỂU SÂN BÃI &amp; PHÒNG HỌC</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Giúp Giáo vụ phát hiện ngay khung giờ trống hoặc phát hiện xung đột lịch phòng học
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm sân bãi, phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-white/20 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="all">Tất cả khu vực ({facilities.length})</option>
            <option value="outdoor">Sân thể thao ngoài trời</option>
            <option value="indoor">Phòng thể chất trong nhà</option>
            <option value="pool">Hồ bơi bốn mùa</option>
          </select>
        </div>
      </div>

      {conflicts.length > 0 ? (
        <div className="bg-rose-500/15 border border-rose-500/30 rounded-2xl p-4 text-rose-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-rose-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Phát hiện {conflicts.length} xung đột lịch sân bãi/phòng học cần xử lý!</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {conflicts.map((conf, idx) => (
              <div key={idx} className="bg-slate-950/60 p-2.5 rounded-xl border border-rose-500/20">
                <span className="font-bold text-white">{conf.facilityName}</span> ({conf.day}):{' '}
                <span className="text-amber-400">{conf.class1.tenLop || conf.class1.tenMon} ({conf.class1.time})</span>{' '}
                trùng với{' '}
                <span className="text-rose-400 font-bold">{conf.class2.tenLop || conf.class2.tenMon} ({conf.class2.time})</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-300">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Hệ thống kiểm tra tự động: Không có bất kỳ xung đột lịch sân bãi hay phòng học nào trong tuần!</span>
        </div>
      )}

      <div className="bg-slate-900/80 border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-950 border-b border-white/10 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-64 border-r border-white/10">Sân bãi / Phòng học</th>
                {DAYS_OF_WEEK.map(day => (
                  <th key={day.key} className="py-3 px-3 text-center border-r border-white/5 last:border-r-0">
                    <span className="block text-white text-xs">{day.label}</span>
                    <span className="text-[10px] text-slate-500 font-normal">{day.key}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredFacilities.map(facility => (
                <tr key={facility.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3.5 px-4 bg-slate-950/40 border-r border-white/10">
                    <div className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{facility.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{facility.location}</div>
                    <span className={`inline-block text-[9px] px-1.5 py-0.2 rounded mt-1 font-mono font-bold ${
                      facility.category === 'outdoor' 
                        ? 'bg-amber-500/20 text-amber-300' 
                        : facility.category === 'pool'
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {facility.category === 'outdoor' ? 'Ngoài trời' : facility.category === 'pool' ? 'Hồ bơi' : 'Trong nhà'}
                    </span>
                  </td>

                  {DAYS_OF_WEEK.map(day => {
                    const assigned = getClassesForFacilityAndDay(facility, day.key);

                    return (
                      <td 
                        key={day.key} 
                        className={`p-2 border-r border-white/5 last:border-r-0 align-top ${
                          assigned.length > 1 ? 'bg-rose-500/10' : ''
                        }`}
                      >
                        {assigned.length === 0 ? (
                          <div className="h-full min-h-[50px] rounded-lg border border-dashed border-white/5 flex items-center justify-center text-[10px] text-slate-600 hover:text-slate-400 hover:border-white/20 transition">
                            Trống
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {assigned.map(cls => {
                              const enrolledCount = danhSachLop.filter(ds => ds.idLop === cls.id).length;
                              const capacity = cls.siSoToiDa || 20;

                              return (
                                <div
                                  key={cls.id}
                                  className="bg-slate-900 border border-sky-500/30 hover:border-sky-500/70 p-2 rounded-xl text-[11px] shadow-sm transition space-y-1"
                                >
                                  <div className="font-bold text-sky-300 flex items-center justify-between">
                                    <span className="truncate">{cls.tenLop || cls.tenMon}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-amber-400" />
                                    <span>{cls.time || '17:30'}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5 border-t border-white/5">
                                    <span className="flex items-center gap-0.5">
                                      <Users className="w-3 h-3 text-slate-500" />
                                      {enrolledCount}/{capacity} HS
                                    </span>
                                    <span className="text-[9px] text-emerald-400 font-bold">
                                      Đang học
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
