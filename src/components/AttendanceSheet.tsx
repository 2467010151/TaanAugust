import React, { useState, useMemo } from 'react';
import { LopHoc, HocVien, DanhSachLop, DiemDanh } from '../types';
import { 
  UserCheck, 
  Check, 
  X, 
  Clock, 
  Users, 
  MessageSquare, 
  Calendar, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  Filter
} from 'lucide-react';

interface AttendanceSheetProps {
  classes: LopHoc[];
  students: HocVien[];
  danhSachLop: DanhSachLop[];
  diemDanhList: DiemDanh[];
  onSaveAttendance: (newRecords: DiemDanh[]) => void;
  selectedClassId?: string;
}

export default function AttendanceSheet({
  classes,
  students,
  danhSachLop,
  diemDanhList,
  onSaveAttendance,
  selectedClassId: initialClassId,
}: AttendanceSheetProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId || classes[0]?.id || '');
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const currentClass = useMemo(() => {
    return classes.find(c => c.id === selectedClassId) || classes[0] || null;
  }, [classes, selectedClassId]);

  const classStudents = useMemo(() => {
    if (!currentClass) return [];
    const enrollments = danhSachLop.filter(ds => ds.idLop === currentClass.id);
    return enrollments.map(ds => {
      const student = students.find(s => s.id === ds.idHocVien);
      return {
        enrollment: ds,
        student: student || {
          id: ds.idHocVien,
          name: 'Học sinh #' + ds.idHocVien,
          sdtPhuHuynh: '',
          ngayBatDau: '',
          ngayKetThuc: '',
          trangThai: 'Còn hạn' as const,
          soVeHocBu: 0,
        },
      };
    });
  }, [currentClass, danhSachLop, students]);

  const [attendanceMap, setAttendanceMap] = useState<Record<string, {
    status: 'Có mặt' | 'Vắng có phép' | 'Vắng không phép';
    notes: string;
  }>>({});

  React.useEffect(() => {
    if (!currentClass) return;
    const existing = diemDanhList.filter(
      d => d.idLop === currentClass.id && d.ngayHoc === sessionDate
    );
    const initialMap: Record<string, { status: 'Có mặt' | 'Vắng có phép' | 'Vắng không phép'; notes: string }> = {};

    classStudents.forEach(({ student }) => {
      const found = existing.find(e => e.idHocVien === student.id);
      if (found) {
        initialMap[student.id] = {
          status: found.trangThai,
          notes: found.nhanXetRieng || '',
        };
      } else {
        initialMap[student.id] = {
          status: 'Có mặt',
          notes: '',
        };
      }
    });

    setAttendanceMap(initialMap);
    setSaveSuccess(false);
  }, [currentClass, sessionDate, classStudents, diemDanhList]);

  const setStatus = (studentId: string, status: 'Có mặt' | 'Vắng có phép' | 'Vắng không phép') => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { notes: '' }),
        status,
      },
    }));
    setSaveSuccess(false);
  };

  const setNotes = (studentId: string, notes: string) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'Có mặt' }),
        notes,
      },
    }));
  };

  const handleMarkAllPresent = () => {
    const updated: typeof attendanceMap = {};
    classStudents.forEach(({ student }) => {
      updated[student.id] = {
        notes: attendanceMap[student.id]?.notes || '',
        status: 'Có mặt',
      };
    });
    setAttendanceMap(updated);
    setSaveSuccess(false);
  };

  const stats = useMemo(() => {
    let present = 0;
    let absentExcused = 0;
    let absentUnexcused = 0;

    Object.values(attendanceMap).forEach(val => {
      if (val.status === 'Có mặt') present++;
      else if (val.status === 'Vắng có phép') absentExcused++;
      else if (val.status === 'Vắng không phép') absentUnexcused++;
    });

    const total = classStudents.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absentExcused, absentUnexcused, rate };
  }, [attendanceMap, classStudents]);

  const handleSave = () => {
    if (!currentClass) return;

    const newRecords: DiemDanh[] = classStudents.map(({ student }) => {
      const data = attendanceMap[student.id] || { status: 'Có mặt', notes: '' };
      return {
        id: `ATT-${currentClass.id}-${student.id}-${sessionDate}`,
        idLop: currentClass.id,
        ngayHoc: sessionDate,
        idHocVien: student.id,
        trangThai: data.status,
        nhanXetRieng: data.notes,
        hinhAnh: [],
      };
    });

    onSaveAttendance(newRecords);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto animate-fade-in">
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-display font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <span>SỔ ĐIỂM DANH ĐIỆN TỬ (ATTENDANCE SHEET)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Giao diện 1-chạm tối ưu cho giáo viên thao tác trên điện thoại &amp; máy tính bảng
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-slate-950 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id} className="bg-slate-950 text-white">
                {c.tenLop ? `${c.tenLop} (${c.tenMon})` : c.tenMon} - {c.coSo || 'Cơ sở chính'}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            className="bg-slate-950 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div className="bg-slate-900/60 border border-white/10 p-3 rounded-xl text-center">
          <div className="text-[10px] uppercase font-bold text-slate-400">Sĩ số lớp</div>
          <div className="text-lg font-extrabold text-white font-mono mt-0.5">{stats.total}</div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center">
          <div className="text-[10px] uppercase font-bold text-emerald-300">Có mặt</div>
          <div className="text-lg font-extrabold text-emerald-400 font-mono mt-0.5">{stats.present}</div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-center">
          <div className="text-[10px] uppercase font-bold text-amber-300">Vắng có phép</div>
          <div className="text-lg font-extrabold text-amber-400 font-mono mt-0.5">{stats.absentExcused}</div>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-center">
          <div className="text-[10px] uppercase font-bold text-rose-300">Vắng không phép</div>
          <div className="text-lg font-extrabold text-rose-400 font-mono mt-0.5">{stats.absentUnexcused}</div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-sky-500/10 border border-sky-500/20 p-3 rounded-xl text-center">
          <div className="text-[10px] uppercase font-bold text-sky-300">Tỷ lệ chuyên cần</div>
          <div className="text-lg font-extrabold text-sky-400 font-mono mt-0.5">{stats.rate}%</div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
        <button
          type="button"
          onClick={handleMarkAllPresent}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
        >
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Đánh dấu tất cả Có mặt</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Lưu Sổ Điểm Danh</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 p-3 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Đã lưu thành công dữ liệu điểm danh ngày {sessionDate} cho lớp {currentClass?.tenMon}!</span>
        </div>
      )}

      <div className="space-y-3">
        {classStudents.length === 0 ? (
          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-8 text-center text-slate-500 text-xs">
            Lớp học này hiện chưa có học sinh nào được ghi danh.
          </div>
        ) : (
          classStudents.map(({ student, enrollment }, idx) => {
            const currentAtt = attendanceMap[student.id] || { status: 'Có mặt', notes: '' };
            const status = currentAtt.status;

            return (
              <div 
                key={student.id}
                className="bg-slate-900/80 border border-white/10 rounded-2xl p-3.5 sm:p-4 hover:border-white/20 transition shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white/10 text-slate-400 flex items-center justify-center text-[11px] font-mono font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <span>{student.name}</span>
                        <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded font-mono">
                          {student.id}
                        </span>
                        {enrollment.loaiHocVien === 'Học bù' && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                            Học bù
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Phụ huynh: {student.hoTenPhuHuynh || 'Chưa cập nhật'} • SĐT: {student.sdtPhuHuynh}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-950/60 p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setStatus(student.id, 'Có mặt')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        status === 'Có mặt'
                          ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Có mặt</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatus(student.id, 'Vắng có phép')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        status === 'Vắng có phép'
                          ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Vắng có phép</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatus(student.id, 'Vắng không phép')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        status === 'Vắng không phép'
                          ? 'bg-rose-500 text-white shadow-md font-extrabold'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Vắng KP</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <input
                    type="text"
                    placeholder="Nhận xét riêng buổi học (vd: Tiếp thu tốt, tích cực tương tác...)"
                    value={currentAtt.notes}
                    onChange={(e) => setNotes(student.id, e.target.value)}
                    className="flex-1 bg-slate-950/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
