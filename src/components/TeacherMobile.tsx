/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HocVien, LopHoc, DanhSachLop, DiemDanh, formatToVNDate } from '../types';
import RoyalLogo from './RoyalLogo';
import { Calendar, CheckCircle2, AlertTriangle, User, MessageCircle, Save, Send, Trash, Image as ImageIcon, Plus, Info, Check } from 'lucide-react';

interface TeacherMobileProps {
  hocVienList: HocVien[];
  classes: LopHoc[];
  danhSachLop: DanhSachLop[];
  diemDanhList: DiemDanh[];
  onSaveDiemDanh: (
    idLop: string,
    ngayHoc: string,
    attendanceData: {
      idHocVien: string;
      trangThai: 'Có mặt' | 'Vắng có phép' | 'Vắng không phép';
      nhanXetRieng: string;
    }[],
    nhanXetChung: string,
    images: string[]
  ) => void;
}

export default function TeacherMobile({
  hocVienList,
  classes,
  danhSachLop,
  diemDanhList,
  onSaveDiemDanh,
}: TeacherMobileProps) {
  // State quản lý chọn lớp
  const [selectedLopId, setSelectedLopId] = useState<string>(classes[0]?.id || '');
  // Ngày học mặc định là ngày hôm nay
  const [ngayHoc, setNgayHoc] = useState<string>(new Date().toISOString().split('T')[0]);

  // Tìm danh sách học viên trong lớp đã chọn
  const [studentsInClass, setStudentsInClass] = useState<{
    student: HocVien;
    loaiHocVien: 'Chính thức' | 'Học bù';
    attendanceState: 'Có mặt' | 'Vắng có phép' | 'Vắng không phép';
    individualComment: string;
  }[]>([]);

  // Nhận xét chung cho cả lớp
  const [nhanXetChung, setNhanXetChung] = useState<string>('');

  // Danh sách hình ảnh đính kèm (tối đa 5)
  const [attachedImages, setAttachedImages] = useState<string[]>([]);

  // Trạng thái Zalo Quick Message Popup
  const [zaloPopupOpen, setZaloPopupOpen] = useState<boolean>(false);
  const [zaloMessageText, setZaloMessageText] = useState<string>('');

  // Khóa cuộn màn hình chính (document.body.style.overflow = 'hidden') khi popup mở
  useEffect(() => {
    if (zaloPopupOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || '';
      };
    }
  }, [zaloPopupOpen]);

  // Trạng thái thông báo thành công
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');

  // Một số hình ảnh bài học mẫu để giáo viên chọn nhanh nếu không muốn upload từ máy
  const sampleLessonImages = [
    'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=60',
  ];

  // Khi thay đổi lớp hoặc ngày học, tải lại danh sách học viên & dữ liệu điểm danh đã lưu (nếu có)
  useEffect(() => {
    // 1. Lấy danh sách học viên thuộc lớp này từ DanhSachLop
    const relations = danhSachLop.filter((item) => item.idLop === selectedLopId);
    
    // 2. Tìm chi tiết điểm danh của lớp trong ngày này để phục hồi trạng thái cũ (nếu có)
    const savedAttendance = diemDanhList.filter(
      (dd) => dd.idLop === selectedLopId && dd.ngayHoc === ngayHoc
    );

    const loadedStudents = relations.map((rel) => {
      const student = hocVienList.find((hv) => hv.id === rel.idHocVien);
      const savedForStudent = savedAttendance.find((dd) => dd.idHocVien === rel.idHocVien);

      return {
        student: student || {
          id: rel.idHocVien,
          name: 'Học viên ẩn',
          sdtPhuHuynh: '0900000000',
          ngayBatDau: '2026-01-01',
          ngayKetThuc: '2026-12-31',
          trangThai: 'Còn hạn' as const,
          soVeHocBu: 0,
        },
        loaiHocVien: rel.loaiHocVien,
        attendanceState: savedForStudent
          ? savedForStudent.trangThai
          : ('Có mặt' as const),
        individualComment: savedForStudent ? savedForStudent.nhanXetRieng : '',
      };
    });

    setStudentsInClass(loadedStudents);

    const sessionKey = `nhan_xet_chung_${selectedLopId}_${ngayHoc}`;
    const savedNhanXetChung = localStorage.getItem(sessionKey) || '';
    setNhanXetChung(savedNhanXetChung);

    const imageKey = `hinh_anh_${selectedLopId}_${ngayHoc}`;
    const savedImagesJson = localStorage.getItem(imageKey);
    if (savedImagesJson) {
      try {
        setAttachedImages(JSON.parse(savedImagesJson));
      } catch (e) {
        setAttachedImages([]);
      }
    } else {
      if (savedAttendance.length > 0 && savedAttendance[0].hinhAnh?.length > 0) {
        setAttachedImages(savedAttendance[0].hinhAnh);
      } else {
        setAttachedImages([]);
      }
    }
  }, [selectedLopId, ngayHoc, danhSachLop, hocVienList, diemDanhList]);

  // Cập nhật trạng thái điểm danh cho một học sinh
  const handleAttendanceChange = (
    studentId: string,
    state: 'Có mặt' | 'Vắng có phép' | 'Vắng không phép'
  ) => {
    setStudentsInClass((prev) =>
      prev.map((item) =>
        item.student.id === studentId ? { ...item, attendanceState: state } : item
      )
    );
  };

  // Cập nhật nhận xét riêng cho từng học sinh
  const handleIndividualCommentChange = (studentId: string, text: string) => {
    setStudentsInClass((prev) =>
      prev.map((item) =>
        item.student.id === studentId ? { ...item, individualComment: text } : item
      )
    );
  };

  // Upload ảnh và chuyển sang Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    
    if (attachedImages.length + files.length > 5) {
      alert('Chỉ được tải lên tối đa 5 hình ảnh!');
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAttachedImages((prev) => [...prev, reader.result as string].slice(0, 5));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Chọn ảnh nhanh từ thư viện mẫu
  const handleSelectSampleImage = (url: string) => {
    if (attachedImages.length >= 5) {
      alert('Chỉ được đính kèm tối đa 5 hình ảnh!');
      return;
    }
    if (attachedImages.includes(url)) {
      setAttachedImages((prev) => prev.filter((img) => img !== url));
    } else {
      setAttachedImages((prev) => [...prev, url]);
    }
  };

  // Xóa ảnh đã đính kèm
  const handleRemoveImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Logic 1: Lưu nhật ký điểm danh
  const handleSave = () => {
    const formattedData = studentsInClass.map((s) => ({
      idHocVien: s.student.id,
      trangThai: s.attendanceState,
      nhanXetRieng: s.individualComment,
    }));

    localStorage.setItem(`nhan_xet_chung_${selectedLopId}_${ngayHoc}`, nhanXetChung);
    localStorage.setItem(`hinh_anh_${selectedLopId}_${ngayHoc}`, JSON.stringify(attachedImages));

    onSaveDiemDanh(selectedLopId, ngayHoc, formattedData, nhanXetChung, attachedImages);

    setToastMsg('Lưu nhật ký điểm danh thành công!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Logic 3: Tạo Zalo Quick Message Template
  const handleGenerateZaloMessage = () => {
    const currentClass = classes.find((c) => c.id === selectedLopId);
    if (!currentClass) return;

    let message = `📝 *BÁO CÁO LỚP HỌC BUỔI ${formatToVNDate(ngayHoc)}*\n`;
    message += `🏫 Lớp: ${currentClass.tenMon} (${currentClass.lichHocCoDinh})\n`;
    message += `📍 Phòng học: ${currentClass.phongHoc}\n`;
    if (nhanXetChung) {
      message += `📢 Nhận xét chung: ${nhanXetChung}\n`;
    }
    message += `----------------------------------\n`;
    message += `📋 *CHI TIẾT ĐIỂM DANH & NHẬN XÉT CHI TIẾT:*\n\n`;

    studentsInClass.forEach((item, index) => {
      const typeLabel = item.loaiHocVien === 'Học bù' ? ' [Học bù]' : '';
      message += `${index + 1}. Bé ${item.student.name}${typeLabel}\n`;
      message += `   - Trạng thái: ${item.attendanceState}\n`;
      message += `   - Nhận xét: ${item.individualComment || 'Bé học tập tốt, ngoan ngoãn.'}\n`;
      if (item.student.soVeHocBu > 0 && item.attendanceState === 'Vắng có phép') {
        message += `   - 📌 Đã cộng +1 vé học bù (Tổng tồn: ${item.student.soVeHocBu + 1} vé)\n`;
      }
      message += `\n`;
    });

    message += `💌 Cảm ơn phụ huynh đã luôn đồng hành cùng các con!`;

    setZaloMessageText(message);
    setZaloPopupOpen(true);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(zaloMessageText);
    alert('Đã copy tin nhắn vào khay nhớ tạm! Nhấn OK để tự động mở ứng dụng Zalo để dán và gửi.');
    window.open('zalo://', '_blank');
  };

  return (
    <div className="flex justify-center items-center py-2 md:py-4 bg-transparent w-full md:min-h-[800px]">
      {/* Mobile Device Container Wrapper */}
      <div className="relative w-full max-w-full md:max-w-[410px] md:bg-slate-900 rounded-3xl md:rounded-[48px] md:p-4 md:shadow-2xl md:border-4 md:border-slate-950 md:ring-12 md:ring-slate-800 md:ring-offset-4 md:ring-offset-slate-950 flex flex-col overflow-hidden">
        
        {/* Notch - hidden on mobile screens */}
        <div className="hidden md:flex absolute top-6 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-full z-20 items-center justify-between px-4">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
          <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
        </div>

        {/* Mobile Screen Area */}
        <div 
          className="w-full text-white rounded-2xl md:rounded-[36px] overflow-y-auto overflow-x-hidden min-h-[640px] md:min-h-[720px] md:max-h-[720px] flex flex-col pt-3 md:pt-10 relative select-none scrollbar-thin"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #090d16 100%)' }}
        >
          {/* Header Mobile App */}
          <div className="bg-slate-950/40 text-white px-5 py-4 flex flex-col gap-1 sticky top-0 z-10 shadow-md border-b border-white/10 backdrop-blur-md">
            <div className="flex justify-between items-center">
              <span className="font-display font-bold text-base tracking-wide flex items-center gap-2">
                <RoyalLogo className="w-5 h-5 shrink-0" />
                <span>Sổ Liên Lạc Điện Tử</span>
              </span>
              <span className="text-[10px] bg-white/5 text-slate-300 px-2 py-0.5 rounded font-mono border border-white/10">
                Teacher App
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Điểm danh, nhận xét &amp; Gửi tin nhắn Zalo cực nhanh</p>
          </div>

          {/* Form Filter & Chọn lớp */}
          <div className="p-4 space-y-3.5 bg-white/5 border-b border-white/10">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Lớp học giảng dạy
              </label>
              <select
                id="select-lop-mobile"
                value={selectedLopId}
                onChange={(e) => setSelectedLopId(e.target.value)}
                className="w-full glass-input text-white text-xs rounded-xl px-3 py-2.5 font-medium cursor-pointer"
              >
                {classes.map((cls) => {
                  const currentCount = danhSachLop.filter((d) => d.idLop === cls.id).length;
                  return (
                    <option key={cls.id} value={cls.id} className="bg-slate-900 text-white">
                      {cls.tenMon} ({currentCount}/{cls.siSoToiDa} HS)
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-sky-400" />
                Ngày buổi học
              </label>
              <input
                id="input-ngay-mobile"
                type="date"
                value={ngayHoc}
                onChange={(e) => setNgayHoc(e.target.value)}
                className="w-full glass-input text-white text-xs rounded-xl px-3 py-2 font-mono"
              />
            </div>
          </div>

          {/* Danh sách học viên điểm danh */}
          <div className="p-4 space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Danh sách điểm danh ({studentsInClass.length} học viên)
              </h3>
              <span className="text-[10px] text-slate-500 italic">Vuốt xuống để cuộn</span>
            </div>

            {studentsInClass.length === 0 ? (
              <div className="glass-card border border-dashed border-white/10 rounded-2xl p-6 text-center space-y-2">
                <User className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-500">Chưa có học viên nào được xếp vào lớp này.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {studentsInClass.map((item) => {
                  const isHocBu = item.loaiHocVien === 'Học bù';
                  const labelColor = isHocBu
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    : 'bg-sky-500/10 text-sky-300 border border-sky-500/20';

                  return (
                    <div
                      key={item.student.id}
                      className={`glass-card border p-3.5 rounded-2xl shadow-md transition space-y-3 ${
                        item.attendanceState === 'Vắng có phép'
                          ? 'border-amber-500/40 bg-amber-500/5'
                          : item.attendanceState === 'Vắng không phép'
                          ? 'border-rose-500/40 bg-rose-500/5'
                          : 'border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            isHocBu ? 'bg-amber-500/20 text-amber-300' : 'bg-sky-500/20 text-sky-300'
                          }`}>
                            {item.student.name.split(' ').pop()?.charAt(0) || 'H'}
                          </div>
                          <div>
                            <span className="font-semibold text-xs text-white block">
                              {item.student.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              PH: {item.student.sdtPhuHuynh}
                            </span>
                          </div>
                        </div>

                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${labelColor}`}>
                          {item.loaiHocVien}
                        </span>
                      </div>

                      {/* Trạng thái 3 Radio buttons */}
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          id={`radio-comat-${item.student.id}`}
                          onClick={() => handleAttendanceChange(item.student.id, 'Có mặt')}
                          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-bold border transition cursor-pointer ${
                            item.attendanceState === 'Có mặt'
                              ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.4)] font-extrabold'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mb-1" />
                          Có mặt
                        </button>

                        <button
                          type="button"
                          id={`radio-cophep-${item.student.id}`}
                          onClick={() => handleAttendanceChange(item.student.id, 'Vắng có phép')}
                          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-bold border transition cursor-pointer ${
                            item.attendanceState === 'Vắng có phép'
                              ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.4)] font-extrabold'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5 mb-1" />
                          Có phép
                        </button>

                        <button
                          type="button"
                          id={`radio-khongphep-${item.student.id}`}
                          onClick={() => handleAttendanceChange(item.student.id, 'Vắng không phép')}
                          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-bold border transition cursor-pointer ${
                            item.attendanceState === 'Vắng không phép'
                              ? 'bg-rose-500 border-rose-400 text-white shadow-[0_0_8px_rgba(239,68,68,0.4)] font-extrabold'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5 mb-1" />
                          Không phép
                        </button>
                      </div>

                      {item.attendanceState === 'Vắng có phép' && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl text-[9px] text-amber-300 flex items-start gap-1">
                          <span className="font-bold">⚠️ Logic:</span>
                          <span>Học viên sẽ được tự động cộng <strong>+1 vé học bù</strong> sau khi giáo viên bấm [Lưu nhật ký].</span>
                        </div>
                      )}

                      <div>
                        <input
                          id={`input-nhanxet-${item.student.id}`}
                          type="text"
                          value={item.individualComment}
                          onChange={(e) => handleIndividualCommentChange(item.student.id, e.target.value)}
                          placeholder="Nhận xét riêng của buổi học..."
                          className="w-full glass-input text-white text-[11px] rounded-xl px-2.5 py-2 focus:outline-none placeholder-slate-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Nhận xét chung & Hình ảnh */}
            <div className="glass-card border border-white/10 rounded-2xl p-3.5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-sky-400" />
                NỘI DUNG &amp; NHẬN XÉT CHUNG BUỔI HỌC
              </h4>

              <div>
                <textarea
                  id="nhan-xet-chung-mobile"
                  value={nhanXetChung}
                  onChange={(e) => setNhanXetChung(e.target.value)}
                  placeholder="Hôm nay các con học bài số 10: Toán logic hình học. Cả lớp tương tác sôi nổi, hoàn thành bài tập vẽ tại lớp..."
                  rows={3}
                  className="w-full glass-input text-white text-xs rounded-xl p-2.5 placeholder-slate-500"
                ></textarea>
              </div>

              {/* Tải lên hình ảnh */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                    Hình ảnh hoạt động ({attachedImages.length}/5)
                  </span>
                  <label className="text-[11px] font-semibold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 cursor-pointer px-2.5 py-1 rounded-lg border border-sky-500/20 transition flex items-center gap-0.5">
                    <Plus className="w-3 h-3" />
                    Tải ảnh lên
                    <input
                      id="upload-image-mobile"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Chọn nhanh ảnh mẫu */}
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 block italic">Chọn nhanh ảnh hoạt động lớp:</span>
                  <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                    {sampleLessonImages.map((url, i) => {
                      const isSelected = attachedImages.includes(url);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelectSampleImage(url)}
                          className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 transition cursor-pointer ${
                            isSelected ? 'border-sky-500 ring-2 ring-sky-500/50' : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          <img src={url} alt="sample" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-sky-500/30 flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {attachedImages.length > 0 && (
                  <div className="grid grid-cols-5 gap-1.5 pt-1">
                    {attachedImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-slate-950/40 group">
                        <img src={img} alt="attached" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute -top-1 -right-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-0.5 shadow transition cursor-pointer animate-pulse"
                        >
                          <Trash className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Các nút hành động chính */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                id="btn-luu-mobile"
                onClick={handleSave}
                disabled={studentsInClass.length === 0}
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold py-3 px-2 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(56,189,248,0.25)] active:scale-95 transition disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <Save className="w-4 h-4" />
                LƯU NHẬT KÝ
              </button>

              <button
                type="button"
                id="btn-zalo-mobile"
                onClick={handleGenerateZaloMessage}
                disabled={studentsInClass.length === 0}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold py-3 px-2 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.25)] active:scale-95 transition disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <Send className="w-4 h-4" />
                GỬI ZALO NHANH
              </button>
            </div>
          </div>

          {/* Toast thông báo */}
          {showToast && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-white/10 text-white text-[11px] font-medium py-2 px-4 rounded-full shadow-lg flex items-center gap-1.5 z-20 animate-fade-in">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
              {toastMsg}
            </div>
          )}
        </div>
      </div>

      {/* Zalo Quick Message Dialog */}
      {zaloPopupOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setZaloPopupOpen(false);
          }}
        >
          <div 
            className="glass-panel max-w-lg w-full overflow-hidden shadow-2xl border border-white/25 rounded-2xl flex flex-col my-auto max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900/60 border-b border-white/10 text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-sky-400" />
                <h3 className="font-display font-bold text-base">Zalo Quick Message Integration</h3>
              </div>
              <button
                onClick={() => setZaloPopupOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto text-xs">
              <div className="bg-sky-500/10 border border-sky-500/20 p-3.5 rounded-xl text-sky-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 mt-0.5 text-sky-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-0.5 text-white">Hướng dẫn gửi Zalo nhanh cá nhân:</p>
                  <p className="text-slate-400 leading-relaxed">
                    Hệ thống đã tự động định dạng mẫu báo cáo học tập bên dưới. Nhấn nút <strong>Sao chép &amp; Mở Zalo</strong>, hệ thống sẽ mở ứng dụng Zalo cá nhân của giáo viên để dán nhanh gửi cho phụ huynh.
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Nội dung báo cáo chi tiết:</span>
                <div className="bg-slate-950/40 border border-white/10 rounded-xl p-4 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed select-all max-h-[300px] overflow-y-auto">
                  {zaloMessageText}
                </div>
              </div>
            </div>

            <div className="bg-slate-950/30 px-6 py-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setZaloPopupOpen(false)}
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Đóng
              </button>
              
              <button
                onClick={handleCopyToClipboard}
                className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-[0_0_15px_rgba(56,189,248,0.25)] cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Sao chép &amp; Mở Zalo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
