import React, { useState, useEffect } from 'react';
import { CoSo, HocVien, LopHoc } from '../types';
import RoyalLogo from './RoyalLogo';
import { Building2, Plus, Search, Edit2, Trash2, MapPin, Phone, Users, ShieldAlert, Check, X, School, Building } from 'lucide-react';

interface BranchManagerProps {
  coSoList: CoSo[];
  hocVienList: HocVien[];
  classes: LopHoc[];
  onAddCoSo: (coSo: CoSo) => void;
  onUpdateCoSo: (coSo: CoSo) => void;
  onDeleteCoSo: (coSoId: string) => void;
}

export default function BranchManager({
  coSoList,
  hocVienList,
  classes,
  onAddCoSo,
  onUpdateCoSo,
  onDeleteCoSo,
}: BranchManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoSo, setEditingCoSo] = useState<CoSo | null>(null);
  const [deletingCoSo, setDeletingCoSo] = useState<CoSo | null>(null);

  // Khóa cuộn màn hình chính (document.body.style.overflow = 'hidden') khi modal mở
  useEffect(() => {
    if (isModalOpen || deletingCoSo) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || '';
      };
    }
  }, [isModalOpen, deletingCoSo]);

  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const getStudentsCountOfBranch = (branchNameOrId: string) => {
    return hocVienList.filter(
      (h) =>
        (h.coSo && (h.coSo === branchNameOrId || h.coSo.includes(branchNameOrId))) ||
        false
    ).length;
  };

  const handleOpenAdd = () => {
    const maxNum = coSoList.reduce((max, c) => {
      const num = parseInt(c.id.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const nextId = `CS${String(maxNum + 1).padStart(2, '0')}`;

    setEditingCoSo(null);
    setFormId(nextId);
    setFormName('');
    setFormAddress('');
    setFormPhone('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coSo: CoSo) => {
    setEditingCoSo(coSo);
    setFormId(coSo.id);
    setFormName(coSo.name);
    setFormAddress(coSo.diaChi);
    setFormPhone(coSo.sdt);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formId.trim() || !formName.trim() || !formAddress.trim() || !formPhone.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ các thông tin: Mã cơ sở, Tên cơ sở, Địa chỉ, Số điện thoại!');
      return;
    }

    if (!editingCoSo) {
      const exists = coSoList.some(
        (c) => c.id.trim().toUpperCase() === formId.trim().toUpperCase()
      );
      if (exists) {
        setErrorMsg(`Mã cơ sở "${formId}" đã tồn tại trên hệ thống! Vui lòng chọn mã khác.`);
        return;
      }
    }

    const coSoData: CoSo = {
      id: formId.trim().toUpperCase(),
      name: formName.trim(),
      diaChi: formAddress.trim(),
      sdt: formPhone.trim(),
    };

    if (editingCoSo) {
      onUpdateCoSo(coSoData);
    } else {
      onAddCoSo(coSoData);
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingCoSo) return;
    onDeleteCoSo(deletingCoSo.id);
    setDeletingCoSo(null);
  };

  const filteredCoSoList = coSoList.filter((coSo) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      coSo.id.toLowerCase().includes(term) ||
      coSo.name.toLowerCase().includes(term) ||
      coSo.diaChi.toLowerCase().includes(term) ||
      coSo.sdt.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in" id="branch-manager-section">
      <div className="glass-panel p-6 rounded-2xl shadow-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <RoyalLogo className="w-10 h-10 shrink-0" />
            <div>
              <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight">
                Quản Lý Cơ Sở Học
              </h2>
              <p className="text-xs text-slate-400">
                Hệ thống các điểm trường & campus ngoại khóa Royal International School
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          THÊM CƠ SỞ MỚI
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tổng cơ sở học</span>
            <Building className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">{coSoList.length}</div>
          <div className="text-[11px] text-emerald-400 font-medium">Đang hoạt động trên toàn hệ thống</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tổng học viên theo cơ sở</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-display text-sky-400">{hocVienList.length}</div>
          <div className="text-[11px] text-slate-400">Học sinh đăng ký học ngoại khóa</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tổng lớp học ngoại khóa</span>
            <School className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-display text-indigo-400">{classes.length}</div>
          <div className="text-[11px] text-slate-400">Lớp phân bố các bộ môn</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Hotline hỗ trợ tổng</span>
            <Phone className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white mt-1">1900 8888</div>
          <div className="text-[11px] text-slate-400">Hỗ trợ phụ huynh 24/7</div>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm mã cơ sở, tên cơ sở, địa chỉ, sđt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-input rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div className="text-xs text-slate-400">
          Hiển thị <span className="text-amber-400 font-bold font-mono">{filteredCoSoList.length}</span> cơ sở
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCoSoList.length === 0 ? (
          <div className="col-span-full glass-panel p-12 text-center rounded-2xl text-slate-400 text-sm">
            Không tìm thấy cơ sở học nào phù hợp với từ khóa "{searchTerm}".
          </div>
        ) : (
          filteredCoSoList.map((coSo) => {
            const studentCount = getStudentsCountOfBranch(coSo.name) || getStudentsCountOfBranch(coSo.id);
            return (
              <div
                key={coSo.id}
                className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-all duration-200 space-y-4 relative group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                          {coSo.id}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Hoạt động
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-sm mt-1 leading-snug">
                        {coSo.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(coSo)}
                      title="Chỉnh sửa cơ sở"
                      className="p-2 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingCoSo(coSo)}
                      title="Xóa cơ sở"
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300 border-t border-white/5 pt-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300 leading-relaxed">{coSo.diaChi}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <a
                      href={`tel:${coSo.sdt.replace(/\s/g, '')}`}
                      className="font-mono text-sky-300 hover:underline font-semibold"
                    >
                      {coSo.sdt}
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Học viên tại cơ sở:</span>
                    <strong className="text-white font-mono font-bold">{studentCount} HS</strong>
                  </div>
                  <span className="text-[10px] text-slate-500">Royal Campus ID: {coSo.id}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div 
            className="glass-panel max-w-md w-full overflow-hidden shadow-2xl border border-white/20 rounded-2xl flex flex-col my-auto max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900/80 border-b border-white/10 text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-bold text-base">
                  {editingCoSo ? `Chỉnh Sửa Cơ Sở [${editingCoSo.id}]` : 'Thêm Cơ Sở Học Mới'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-400 uppercase tracking-wide">
                  Mã cơ sở <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: CS01, CS05..."
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  disabled={!!editingCoSo}
                  className="w-full glass-input rounded-xl px-3 py-2.5 text-white font-mono uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-400 uppercase tracking-wide">
                  Tên cơ sở <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cơ sở Quận 1 - Royal Central"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-400 uppercase tracking-wide">
                  Địa chỉ <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-400 uppercase tracking-wide">
                  Số điện thoại liên hệ <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ví dụ: 028 3911 0001 hoặc 0901234567"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2.5 text-white font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {editingCoSo ? 'Cập Nhật Cơ Sở' : 'Lưu Cơ Sở'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingCoSo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeletingCoSo(null);
          }}
        >
          <div 
            className="glass-panel max-w-sm w-full p-6 rounded-2xl border border-rose-500/30 space-y-4 text-center shadow-2xl my-auto max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Xác Nhận Xóa Cơ Sở</h3>
              <p className="text-xs text-slate-300 mt-1">
                Bạn có chắc chắn muốn xóa cơ sở <strong className="text-amber-400">{deletingCoSo.name}</strong> ({deletingCoSo.id}) không?
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingCoSo(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition shadow-[0_0_15px_rgba(239,68,68,0.3)] cursor-pointer"
              >
                Xóa Vĩnh Viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
