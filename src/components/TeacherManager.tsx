import React, { useState, useEffect } from 'react';
import { GiaoVien, LopHoc, capitalizeWords } from '../types';
import RoyalLogo from './RoyalLogo';
import { Users, Search, Filter, Phone, Mail, BookOpen, Plus, Edit2, Trash2, ShieldCheck, Check } from 'lucide-react';

interface TeacherManagerProps {
  teachers: GiaoVien[];
  classes: LopHoc[];
  onAddTeacher: (teacherData: Omit<GiaoVien, 'id'>) => void;
  onEditTeacher: (teacherData: GiaoVien) => void;
  onDeleteTeacher: (teacherId: string) => void;
}

export default function TeacherManager({
  teachers,
  classes,
  onAddTeacher,
  onEditTeacher,
  onDeleteTeacher,
}: TeacherManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Đang dạy' | 'Nghỉ phép' | 'Đã nghỉ'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<GiaoVien | null>(null);

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

  const [teacherName, setTeacherName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [status, setStatus] = useState<'Đang dạy' | 'Nghỉ phép' | 'Đã nghỉ'>('Đang dạy');

  const openAddModal = () => {
    setEditingTeacher(null);
    setTeacherName('');
    setPhone('');
    setEmail('');
    setSubject('');
    setStatus('Đang dạy');
    setIsModalOpen(true);
  };

  const openEditModal = (teacher: GiaoVien) => {
    setEditingTeacher(teacher);
    setTeacherName(teacher.name);
    setPhone(teacher.sdt);
    setEmail(teacher.email);
    setSubject(teacher.monDay);
    setStatus(teacher.trangThai);
    setIsModalOpen(true);
  };

  const validateEmail = (mail: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim() || !phone.trim() || !email.trim() || !subject.trim()) {
      alert('❌ Vui lòng điền đầy đủ tất cả thông tin yêu cầu!');
      return;
    }

    if (!validateEmail(email)) {
      alert('❌ Email không hợp lệ! Vui lòng nhập đúng định dạng (Ví dụ: abc@domain.com)');
      return;
    }

    if (editingTeacher) {
      onEditTeacher({
        id: editingTeacher.id,
        name: teacherName.trim(),
        sdt: phone.trim(),
        email: email.trim(),
        monDay: subject.trim(),
        trangThai: status,
      });
    } else {
      onAddTeacher({
        name: teacherName.trim(),
        sdt: phone.trim(),
        email: email.trim(),
        monDay: subject.trim(),
        trangThai: status,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (teacher: GiaoVien) => {
    const isTeachingActive = classes.some((c) => c.tenMon === teacher.monDay);
    let msg = `Bạn có chắc chắn muốn xóa giáo viên "${teacher.name}"?`;
    if (isTeachingActive) {
      msg = `⚠️ CẢNH BÁO: Giáo viên "${teacher.name}" hiện tại được ghi nhận đang dạy môn "${teacher.monDay}".\nBạn vẫn chắc chắn muốn xóa giáo viên này chứ?`;
    }

    if (window.confirm(msg)) {
      onDeleteTeacher(teacher.id);
    }
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.monDay.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.sdt.includes(searchTerm) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || teacher.trangThai === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const countActive = teachers.filter((t) => t.trangThai === 'Đang dạy').length;
  const countOnLeave = teachers.filter((t) => t.trangThai === 'Nghỉ phép').length;

  return (
    <div className="space-y-6 animate-fade-in" id="teacher-manager-section">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card border border-white/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Tổng giáo viên</span>
            <span className="text-2xl font-display font-bold text-white">{teachers.length} Thầy cô</span>
          </div>
        </div>

        <div className="glass-card border border-white/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Đang tích cực giảng dạy</span>
            <span className="text-2xl font-display font-bold text-emerald-400">{countActive} Nhân sự</span>
          </div>
        </div>

        <div className="glass-card border border-white/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Nghỉ phép ngắn hạn</span>
            <span className="text-2xl font-display font-bold text-amber-400">{countOnLeave} Thầy cô</span>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <RoyalLogo className="w-8 h-8 shrink-0" />
            <div>
              <h3 className="text-lg font-display font-bold text-white">Danh Sách Giáo Viên / Giảng Viên</h3>
              <p className="text-xs text-slate-400">Quản lý hồ sơ, liên hệ và chuyên môn giảng dạy của giáo viên</p>
            </div>
          </div>

          <button
            id="btn-add-teacher-manager"
            onClick={openAddModal}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 active:scale-95 shadow-[0_0_15px_rgba(56,189,248,0.3)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Thêm giáo viên mới
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="search-teachers-input"
              type="text"
              placeholder="Tìm theo họ tên, sđt, email, môn giảng dạy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-white text-xs placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 pl-1 whitespace-nowrap">
              <Filter className="w-3.5 h-3.5 text-sky-400" /> Trạng thái:
            </span>
            <div className="flex gap-1.5">
              {(['all', 'Đang dạy', 'Nghỉ phép', 'Đã nghỉ'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    statusFilter === status
                      ? 'bg-sky-500 text-slate-950 shadow-md'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {status === 'all' ? 'Tất cả' : status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/20">
          <table className="w-full border-collapse text-left" id="table-teachers-list">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                <th className="py-3 px-4">Mã số</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4">Liên hệ</th>
                <th className="py-3 px-4">Môn dạy chính</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 font-medium">
                    Không tìm thấy giáo viên nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => {
                  return (
                    <tr key={teacher.id} className="hover:bg-white/5 transition">
                      <td className="py-4 px-4 font-mono font-bold text-sky-400">
                        <span className="bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded text-[10px]">
                          {teacher.id}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-bold text-white text-sm">
                        {teacher.name}
                      </td>

                      <td className="py-4 px-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-sky-400" />
                          <span className="font-mono text-xs">{teacher.sdt}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-xs break-all">{teacher.email}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{teacher.monDay}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          teacher.trangThai === 'Đang dạy'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : teacher.trangThai === 'Nghỉ phép'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}>
                          {teacher.trangThai}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(teacher)}
                            className="p-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg border border-sky-500/20 transition cursor-pointer"
                            title="Sửa hồ sơ giáo viên"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(teacher)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition cursor-pointer"
                            title="Xóa giáo viên"
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

      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div 
            className="glass-panel max-w-md w-full overflow-hidden shadow-2xl border border-white/25 rounded-2xl flex flex-col my-auto max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900/60 border-b border-white/10 text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" />
                <h3 className="font-display font-bold text-base">
                  {editingTeacher ? `Cập Nhật Hồ Sơ [${editingTeacher.id}]` : 'Thêm Giáo Viên Mới'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto scrollbar-thin">
              <div className="p-6 space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide">
                    Họ và tên giáo viên <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="input-teacher-name"
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={teacherName}
                    onChange={(e) => setTeacherName(capitalizeWords(e.target.value))}
                    className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-medium placeholder-slate-500 capitalize"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide">
                    Số điện thoại liên hệ <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="input-teacher-phone"
                    type="tel"
                    required
                    placeholder="Ví dụ: 0912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-mono placeholder-slate-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide">
                    Địa chỉ Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="input-teacher-email"
                    type="email"
                    required
                    placeholder="Ví dụ: hoten@royalschool.edu.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-mono placeholder-slate-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide">
                    Môn dạy chính / Chuyên môn <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="input-teacher-subject"
                    type="text"
                    required
                    list="classes-autocomplete-list"
                    placeholder="Tự nhập hoặc chọn lớp (Toán Tư Duy, Tiếng Anh...)"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs font-medium placeholder-slate-500"
                  />
                  <datalist id="classes-autocomplete-list">
                    {classes.map((c) => (
                      <option key={c.id} value={c.tenMon} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide">
                    Trạng thái giảng dạy <span className="text-rose-400">*</span>
                  </label>
                  <select
                    id="select-teacher-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Đang dạy' | 'Nghỉ phép' | 'Đã nghỉ')}
                    className="w-full bg-slate-900 border border-white/15 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium cursor-pointer text-slate-200"
                  >
                    <option value="Đang dạy" className="bg-slate-950 text-white">Đang dạy</option>
                    <option value="Nghỉ phép" className="bg-slate-950 text-white">Nghỉ phép</option>
                    <option value="Đã nghỉ" className="bg-slate-950 text-white">Đã nghỉ</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-950/30 px-6 py-4 border-t border-white/10 flex justify-end gap-2.5 sticky bottom-0 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition active:scale-95 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl font-bold transition active:scale-95 shadow-lg shadow-sky-500/20 cursor-pointer"
                >
                  {editingTeacher ? 'Cập Nhật' : 'Tạo Giáo Viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
