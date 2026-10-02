/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  User, 
  X, 
  ArrowRightLeft,
  GraduationCap,
  Sparkles,
  BookOpen,
  Calendar,
  Award,
  LogOut
} from 'lucide-react';
import { 
  HocVien, 
  LopHoc, 
  DanhSachLop, 
  DiemDanh, 
  MonHoc, 
  ClassTransferRecord, 
  DifferenceStatus 
} from '../types';

interface Student {
  id: string;
  fullName: string;
}

interface ClassItem {
  id: string;
  name: string;
  totalSessions: number;
  remainingSessions: number;
  pricePerSession: number;
  fullCourseFee: number;
  currentStudents: number;
  maxStudents: number;
}

export interface ClassTransferModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  student?: HocVien | null;
  currentClassId?: string;
  classes?: LopHoc[];
  danhSachLop?: DanhSachLop[];
  diemDanhList?: DiemDanh[];
  monHocList?: MonHoc[];
  onConfirmTransfer?: (transferRecord: ClassTransferRecord) => void;
  onBulkTransfer?: (params: {
    fromClassId: string;
    toClassId: string;
    studentIds: string[];
    transferDate: string;
    reason: string;
  }) => Promise<void> | void;
}

export const ClassTransferModal: React.FC<ClassTransferModalProps> = ({
  isOpen = true,
  onClose,
  student,
  currentClassId,
  classes = [],
  danhSachLop = [],
  diemDanhList = [],
  monHocList = [],
  onConfirmTransfer,
  onBulkTransfer,
}) => {
  if (isOpen === false) return null;

  // Mode: Chuyển bù trừ cá nhân HOẶC Chuyển hết khóa (đơn lẻ / cả lớp) HOẶC Kết thúc khóa (dừng học)
  const [transferMode, setTransferMode] = useState<'individual_offset' | 'progression' | 'course_exit'>('individual_offset');
  const [progressionScope, setProgressionScope] = useState<'single' | 'batch'>('single');
  const [exitReason, setExitReason] = useState<string>('Hoàn thành mục tiêu khóa học, tạm dừng');
  const [generateCertificate, setGenerateCertificate] = useState<boolean>(true);

  // Selected Student
  const [selectedStudentId, setSelectedStudentId] = useState<string>(student?.id || 'HS001');

  // Selected Classes
  const [selectedFromClassId, setSelectedFromClassId] = useState<string>('');
  const [selectedToClassId, setSelectedToClassId] = useState<string>('');
  const [customAttended, setCustomAttended] = useState<number | null>(null);

  // Sync selectedStudentId when prop student changes
  useEffect(() => {
    if (student?.id) {
      setSelectedStudentId(student.id);
    }
  }, [student]);

  // Khóa cuộn màn hình chính (document.body.style.overflow = 'hidden') khi modal mở
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || '';
      };
    }
  }, [isOpen]);

  // Lắng nghe phím ESC để đóng modal
  useEffect(() => {
    if (!isOpen || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Available students list
  const availableStudents = useMemo(() => {
    if (student) {
      return [{ id: student.id, fullName: student.name, currentClass: student.lopChinhKhoa || 'Lớp ngoại khóa' }];
    }
    if (danhSachLop.length > 0) {
      const studentMap = new Map<string, { id: string; fullName: string; currentClass: string }>();
      danhSachLop.forEach(ds => {
        const foundClass = classes.find(c => c.id === ds.idLop);
        const name = (ds as any).tenHocVien || ds.idHocVien;
        studentMap.set(ds.idHocVien, {
          id: ds.idHocVien,
          fullName: name,
          currentClass: foundClass?.tenLop || foundClass?.tenMon || 'Lớp ngoại khóa'
        });
      });
      if (studentMap.size > 0) {
        return Array.from(studentMap.values());
      }
    }
    // Fallback demo students
    return [
      { id: 'HS001', fullName: 'Nguyễn Hoàng Long (MSHS: RS-8921)', currentClass: 'Cờ vua Nền tảng K01' },
      { id: 'HS002', fullName: 'Lê Minh Anh (MSHS: RS-7712)', currentClass: 'Bóng rổ Cơ bản K02' },
      { id: 'HS003', fullName: 'Trần Bảo Ngọc (MSHS: RS-4519)', currentClass: 'Bơi lội Aqua Star' },
      { id: 'HS004', fullName: 'Phạm Đức Huy (MSHS: RS-6320)', currentClass: 'Robotics STEM Sáng tạo' }
    ];
  }, [danhSachLop, classes]);

  // Current student object
  const currentStudent = useMemo(() => {
    return availableStudents.find(s => s.id === selectedStudentId) || availableStudents[0];
  }, [availableStudents, selectedStudentId]);

  // Available classes converted to ClassItem format
  const mappedClasses: ClassItem[] = useMemo(() => {
    if (classes && classes.length > 0) {
      return classes.map(c => {
        const subject = monHocList.find(m => m.tenMon === c.tenMon);
        const pricePerSession = subject?.hocPhiTheoBuoi || 150000;
        const totalSessions = c.soBuoiHoc || 16;
        const fullCourseFee = subject?.hocPhiTheoKhoa || (totalSessions * pricePerSession);
        const currentStudents = danhSachLop.filter(ds => ds.idLop === c.id && ds.status !== 'transferred_out').length;
        const maxStudents = c.siSoToiDa || 20;

        return {
          id: c.id,
          name: c.tenLop || c.tenMon,
          totalSessions,
          remainingSessions: Math.max(8, totalSessions - 4),
          pricePerSession,
          fullCourseFee,
          currentStudents,
          maxStudents
        };
      });
    }

    // Default fallback classes matching user spec
    return [
      {
        id: 'C01',
        name: 'Cờ vua Nền tảng K01',
        totalSessions: 16,
        remainingSessions: 12,
        pricePerSession: 150000,
        fullCourseFee: 2400000,
        currentStudents: 15,
        maxStudents: 20
      },
      {
        id: 'C02',
        name: 'Bơi lội Cơ bản K02',
        totalSessions: 16,
        remainingSessions: 10,
        pricePerSession: 200000,
        fullCourseFee: 3200000,
        currentStudents: 12,
        maxStudents: 18
      },
      {
        id: 'C03',
        name: 'Robotics Sáng tạo Junior',
        totalSessions: 20,
        remainingSessions: 14,
        pricePerSession: 220000,
        fullCourseFee: 4400000,
        currentStudents: 10,
        maxStudents: 16
      },
      {
        id: 'C04',
        name: 'Bóng rổ Nâng cao Pro',
        totalSessions: 16,
        remainingSessions: 8,
        pricePerSession: 180000,
        fullCourseFee: 2880000,
        currentStudents: 14,
        maxStudents: 16
      }
    ];
  }, [classes, monHocList, danhSachLop]);

  // Detect active from-class for student
  useEffect(() => {
    if (!selectedFromClassId) {
      if (currentClassId) {
        const match = mappedClasses.find(c => c.id === currentClassId);
        if (match) setSelectedFromClassId(match.id);
        else setSelectedFromClassId(mappedClasses[0]?.id || 'C01');
      } else {
        const enrollment = danhSachLop.find(ds => ds.idHocVien === selectedStudentId);
        if (enrollment) {
          const match = mappedClasses.find(c => c.id === enrollment.idLop);
          if (match) setSelectedFromClassId(match.id);
          else setSelectedFromClassId(mappedClasses[0]?.id || 'C01');
        } else {
          setSelectedFromClassId(mappedClasses[0]?.id || 'C01');
        }
      }
    }
  }, [currentClassId, selectedStudentId, danhSachLop, mappedClasses, selectedFromClassId]);

  // Set default to-class if none selected
  useEffect(() => {
    if (!selectedToClassId) {
      const otherClass = mappedClasses.find(c => c.id !== selectedFromClassId);
      if (otherClass) setSelectedToClassId(otherClass.id);
      else setSelectedToClassId(mappedClasses[1]?.id || 'C02');
    }
  }, [selectedFromClassId, mappedClasses, selectedToClassId]);

  // Active oldClass and newClass
  const oldClass: ClassItem = useMemo(() => {
    return mappedClasses.find(c => c.id === selectedFromClassId) || mappedClasses[0] || {
      id: 'C01',
      name: 'Cờ vua Nền tảng K01',
      totalSessions: 16,
      remainingSessions: 12,
      pricePerSession: 150000,
      fullCourseFee: 2400000,
      currentStudents: 15,
      maxStudents: 20
    };
  }, [mappedClasses, selectedFromClassId]);

  const newClass: ClassItem = useMemo(() => {
    return mappedClasses.find(c => c.id === selectedToClassId && c.id !== oldClass.id) || 
      mappedClasses.find(c => c.id !== oldClass.id) || 
      mappedClasses[1] || {
        id: 'C02',
        name: 'Bơi lội Cơ bản K02',
        totalSessions: 16,
        remainingSessions: 10,
        pricePerSession: 200000,
        fullCourseFee: 3200000,
        currentStudents: 12,
        maxStudents: 18
      };
  }, [mappedClasses, selectedToClassId, oldClass.id]);

  // Auto count attended sessions from real attendance if available
  const autoAttended = useMemo(() => {
    if (diemDanhList.length > 0 && selectedStudentId && oldClass.id) {
      return diemDanhList.filter(
        d => d.idHocVien === selectedStudentId && 
             d.idLop === oldClass.id && 
             (d.trangThai === 'Có mặt' || d.trangThai === 'Vắng có phép')
      ).length;
    }
    return 4; // Default demo attended sessions
  }, [diemDanhList, selectedStudentId, oldClass.id]);

  const oldAttendedSessions = customAttended !== null ? customAttended : autoAttended;

  // 1. Tính toán bù trừ chuyển lớp
  const remainingOldSessions = Math.max(0, oldClass.totalSessions - oldAttendedSessions);
  const remainingOldCredit = remainingOldSessions * oldClass.pricePerSession;
  const requiredFeeNewClass = newClass.remainingSessions * newClass.pricePerSession;

  const isLateralTransfer = remainingOldCredit >= requiredFeeNewClass;
  const amountToPay = isLateralTransfer ? 0 : (requiredFeeNewClass - remainingOldCredit);

  // Check if new class has available slots
  const availableSlotsNewClass = Math.max(0, newClass.maxStudents - newClass.currentStudents);
  const isNewClassFull = availableSlotsNewClass <= 0;

  // Handle Submit Transfer
  const handleConfirmAction = () => {
    if (isNewClassFull) {
      alert(`⚠️ Lớp đích "${newClass.name}" đã đạt sĩ số tối đa (${newClass.currentStudents}/${newClass.maxStudents}). Vui lòng chọn lớp khác!`);
      return;
    }

    if (transferMode === 'individual_offset') {
      const diffStatus: DifferenceStatus = amountToPay > 0 ? 'student_must_pay' : 'settled';
      const record: ClassTransferRecord = {
        id: `TRF-${Date.now().toString().slice(-6)}`,
        studentId: selectedStudentId,
        studentName: currentStudent?.fullName || 'Học viên',
        transferType: 'subject_or_shift_change',
        fromClassId: oldClass.id,
        fromClassName: oldClass.name,
        toClassId: newClass.id,
        toClassName: newClass.name,
        transferDate: new Date().toISOString().split('T')[0],
        attendedSessionsOldClass: oldAttendedSessions,
        remainingSessionsOldClass: remainingOldSessions,
        remainingCreditOldClass: remainingOldCredit,
        newClassRemainingSessions: newClass.remainingSessions,
        requiredFeeNewClass: requiredFeeNewClass,
        feeDifference: amountToPay > 0 ? amountToPay : -(remainingOldCredit - requiredFeeNewClass),
        differenceStatus: diffStatus,
        transferMode: 'single',
        creditApplied: remainingOldCredit,
        surchargeAmount: amountToPay,
        reason: 'Đổi môn / Đổi ca học (Tính bù trừ theo buổi)',
        createdBy: 'Admin Giáo vụ',
        createdAt: new Date().toLocaleString('vi-VN'),
      };

      if (onConfirmTransfer) {
        onConfirmTransfer(record);
      } else {
        alert(`✅ Đã xác nhận chuyển lớp cho em ${currentStudent?.fullName} sang lớp ${newClass.name} thành công!`);
      }

      if (onClose) onClose();
    } else if (transferMode === 'course_exit') {
      // Course exit mode
      const record: ClassTransferRecord = {
        id: `EXIT-${Date.now().toString().slice(-6)}`,
        studentId: selectedStudentId,
        studentName: currentStudent?.fullName || 'Học viên',
        transferType: 'course_exit',
        fromClassId: oldClass.id,
        fromClassName: oldClass.name,
        toClassId: 'NONE',
        toClassName: 'Kết Thúc Khóa (Dừng Học)',
        transferDate: new Date().toISOString().split('T')[0],
        attendedSessionsOldClass: oldClass.totalSessions || 16,
        remainingSessionsOldClass: 0,
        remainingCreditOldClass: 0,
        newClassRemainingSessions: 0,
        requiredFeeNewClass: 0,
        feeDifference: 0,
        differenceStatus: 'settled',
        transferMode: 'single',
        creditApplied: 0,
        surchargeAmount: 0,
        reason: `${exitReason}${generateCertificate ? ' (Đã tự động tạo Chứng nhận hoàn thành khóa & Nhận xét HLV)' : ''}`,
        createdBy: 'Admin Giáo vụ',
        createdAt: new Date().toLocaleString('vi-VN'),
      };

      if (onConfirmTransfer) {
        onConfirmTransfer(record);
      } else {
        alert(`🎓 Đã ghi nhận học sinh ${currentStudent?.fullName} hoàn thành và kết thúc khóa học!\n${generateCertificate ? '🏆 Đã tự động tạo Phiếu chứng nhận hoàn thành khóa học & Nhận xét của Huấn luyện viên.' : ''}`);
      }

      if (onClose) onClose();
    } else {
      // Progression mode
      if (progressionScope === 'batch') {
        if (oldClass.currentStudents > availableSlotsNewClass) {
          alert(`❌ Sĩ số lớp mới không đủ chỗ! Cần ${oldClass.currentStudents} chỗ nhưng chỉ còn trống ${availableSlotsNewClass} chỗ.`);
          return;
        }

        if (onBulkTransfer) {
          const studentIdsInClass = danhSachLop
            .filter(ds => ds.idLop === oldClass.id)
            .map(ds => ds.idHocVien);

          onBulkTransfer({
            fromClassId: oldClass.id,
            toClassId: newClass.id,
            studentIds: studentIdsInClass.length > 0 ? studentIdsInClass : [selectedStudentId],
            transferDate: new Date().toISOString().split('T')[0],
            reason: `Chuyển cả lớp hoàn thành khóa học từ ${oldClass.name} lên ${newClass.name}`
          });
        } else {
          alert(`🚀 Đã chuyển toàn bộ ${oldClass.currentStudents} học sinh từ ${oldClass.name} lên ${newClass.name} thành công!`);
        }

        if (onClose) onClose();
      } else {
        // Single student progression
        const record: ClassTransferRecord = {
          id: `TRF-${Date.now().toString().slice(-6)}`,
          studentId: selectedStudentId,
          studentName: currentStudent?.fullName || 'Học viên',
          transferType: 'course_progression',
          fromClassId: oldClass.id,
          fromClassName: oldClass.name,
          toClassId: newClass.id,
          toClassName: newClass.name,
          transferDate: new Date().toISOString().split('T')[0],
          attendedSessionsOldClass: oldClass.totalSessions,
          remainingSessionsOldClass: 0,
          remainingCreditOldClass: 0,
          newClassRemainingSessions: newClass.totalSessions,
          requiredFeeNewClass: newClass.fullCourseFee,
          feeDifference: newClass.fullCourseFee,
          differenceStatus: 'student_must_pay',
          transferMode: 'single',
          creditApplied: 0,
          surchargeAmount: newClass.fullCourseFee,
          reason: 'Hoàn thành khóa học, thăng hạng lên cấp độ tiếp theo',
          createdBy: 'Admin Giáo vụ',
          createdAt: new Date().toLocaleString('vi-VN'),
        };

        if (onConfirmTransfer) {
          onConfirmTransfer(record);
        } else {
          alert(`🎉 Đã nâng cấp khóa mới cho học sinh ${currentStudent?.fullName} sang ${newClass.name}!`);
        }

        if (onClose) onClose();
      }
    }
  };

  const modalBody = (
    <div className="bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-6 w-full mx-auto my-auto max-h-[92vh] overflow-y-auto space-y-5 animate-scale-in">
      {/* 1. Header Toolbar chọn loại xử lý */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <ArrowRightLeft size={18} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Xử Lý Học Vụ Cuối Khóa / Chuyển Lớp</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold gap-1">
            <button 
              type="button"
              onClick={() => setTransferMode('individual_offset')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${transferMode === 'individual_offset' ? 'bg-white shadow text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'}`}>
              Đổi Môn/Đổi Ca (Bù Trừ)
            </button>
            <button 
              type="button"
              onClick={() => setTransferMode('progression')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${transferMode === 'progression' ? 'bg-white shadow text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'}`}>
              Lên Cấp Độ Mới
            </button>
            <button 
              type="button"
              onClick={() => setTransferMode('course_exit')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${transferMode === 'course_exit' ? 'bg-white shadow text-rose-600 font-bold' : 'text-slate-600 hover:text-slate-900'}`}>
              Kết Thúc Khóa (Dừng Học)
            </button>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              title="Đóng modal"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* TRƯỜNG HỢP 1: ĐỔI MÔN BÙ TRỪ HỌC PHÍ */}
      {transferMode === 'individual_offset' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Chọn Học Sinh Cần Chuyển</label>
            <select 
              value={selectedStudentId} 
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                setCustomAttended(null);
              }}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none">
              {availableStudents.map(stu => (
                <option key={stu.id} value={stu.id}>
                  {stu.fullName} - Đang học: {stu.currentClass}
                </option>
              ))}
            </select>
          </div>

          {/* Selector for Class Change Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Lớp Học Hiện Tại (Cũ)</label>
              <select
                value={oldClass.id}
                onChange={(e) => setSelectedFromClassId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 text-xs font-medium bg-slate-50 text-slate-800"
              >
                {mappedClasses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.currentStudents}/{c.maxStudents} HS)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Lớp Chuyển Đến (Mới)</label>
              <select
                value={newClass.id}
                onChange={(e) => setSelectedToClassId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 text-xs font-medium bg-white text-slate-800 focus:border-indigo-500"
              >
                {mappedClasses.filter(c => c.id !== oldClass.id).map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Còn {c.maxStudents - c.currentStudents} chỗ)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <p className="text-xs text-slate-500 font-medium">Lớp cũ: <span className="text-slate-800 font-bold">{oldClass.name}</span></p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <span>Đã học:</span>
                <input
                  type="number"
                  min="0"
                  max={oldClass.totalSessions}
                  value={oldAttendedSessions}
                  onChange={(e) => setCustomAttended(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-12 px-1.5 py-0.5 border border-slate-300 rounded text-center text-xs font-bold text-slate-800 bg-white"
                  title="Nhấp để điều chỉnh số buổi đã học"
                />
                <span>buổi | Còn: <strong className="text-slate-800">{remainingOldSessions}</strong> buổi</span>
              </div>
              <p className="text-sm font-bold text-slate-700 mt-1.5">Tiền còn lại: {remainingOldCredit.toLocaleString('vi-VN')} đ</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">({remainingOldSessions} buổi x {oldClass.pricePerSession.toLocaleString('vi-VN')} đ)</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Lớp chuyển đến: <span className="text-slate-800 font-bold">{newClass.name}</span></p>
              <p className="text-xs text-slate-500 mt-1">Số buổi tham gia: <strong className="text-slate-800">{newClass.remainingSessions}</strong> buổi</p>
              <p className="text-sm font-bold text-slate-700 mt-1.5">Phí lớp mới: {requiredFeeNewClass.toLocaleString('vi-VN')} đ</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">({newClass.remainingSessions} buổi x {newClass.pricePerSession.toLocaleString('vi-VN')} đ)</p>
            </div>
          </div>

          {/* KẾT QUẢ ĐỐI SOÁT */}
          {isLateralTransfer ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="text-emerald-600 mt-0.5 shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold text-emerald-800">CHUYỂN NGANG THÀNH CÔNG (Không đóng bù)</p>
                <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                  Số tiền còn lại đủ chi trả cho lớp mới. <strong>Lưu ý:</strong> Tiền thừa ({Math.abs(remainingOldCredit - requiredFeeNewClass).toLocaleString('vi-VN')} đ) được bảo lưu vào ví học sinh theo quy chế.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-rose-600 mt-0.5 shrink-0" size={20} />
              <div className="flex-1">
                <p className="text-sm font-bold text-rose-800">YÊU CẦU ĐÓNG BÙ THEO BUỔI</p>
                <p className="text-xs text-rose-700 mt-0.5">Số tiền còn lại ít hơn học phí số buổi của lớp mới.</p>
                <p className="text-base font-extrabold text-rose-600 mt-1">
                  Số tiền cần đóng bù: +{amountToPay.toLocaleString('vi-VN')} VNĐ
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TRƯỜNG HỢP 2: HẾT KHÓA / LÊN CẤP ĐỘ MỚI */}
      {transferMode === 'progression' && (
        <div className="space-y-4">
          <div className="flex gap-4 p-2 bg-slate-50 rounded-xl border border-slate-200">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input 
                type="radio" 
                checked={progressionScope === 'single'} 
                onChange={() => setProgressionScope('single')} 
                name="scope"
                className="accent-indigo-600"
              />
              <User size={16} className="text-indigo-600" /> Chuyển từng học sinh
            </label>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input 
                type="radio" 
                checked={progressionScope === 'batch'} 
                onChange={() => setProgressionScope('batch')} 
                name="scope"
                className="accent-indigo-600"
              />
              <Users size={16} className="text-indigo-600" /> Chuyển theo cả lớp (Bulk Transfer)
            </label>
          </div>

          {/* Class selection for progression */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Lớp Hoàn Thành (Cũ)</label>
              <select
                value={oldClass.id}
                onChange={(e) => setSelectedFromClassId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-medium"
              >
                {mappedClasses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.currentStudents} học sinh)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Lớp Cấp Độ Kế Tiếp (Mới)</label>
              <select
                value={newClass.id}
                onChange={(e) => setSelectedToClassId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-medium"
              >
                {mappedClasses.filter(c => c.id !== oldClass.id).map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Trống {c.maxStudents - c.currentStudents} chỗ)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {progressionScope === 'batch' ? (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <Users size={15} /> Chế độ chuyển toàn bộ học sinh theo lớp
              </div>
              <p>
                Chế độ chuyển cả lớp sẽ ghi danh toàn bộ <strong>{oldClass.currentStudents} học sinh</strong> của lớp hoàn thành sang lớp cấp độ tiếp theo. Sĩ số lớp mới còn trống: <strong>{availableSlotsNewClass} chỗ</strong>.
              </p>
              {oldClass.currentStudents > availableSlotsNewClass && (
                <p className="text-rose-600 font-bold mt-1">
                  ⚠️ Cảnh báo: Sĩ số lớp mới không đủ tiếp nhận tất cả học sinh!
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Chọn Học Sinh Hoàn Thành Khóa</label>
              <select 
                value={selectedStudentId} 
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm font-medium">
                {availableStudents.map(stu => (
                  <option key={stu.id} value={stu.id}>
                    {stu.fullName} - Hoàn thành {oldClass.name} (Đủ điều kiện lên cấp độ mới)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center justify-between">
            <span>Học phí áp dụng cho lớp tiếp theo:</span>
            <strong className="text-indigo-600 text-sm font-bold font-mono">
              Học phí trọn khóa mới ({newClass.fullCourseFee.toLocaleString('vi-VN')} đ)
            </strong>
          </div>
        </div>
      )}

      {/* 2. Giao diện khi chọn: KẾT THÚC KHÓA (KHÔNG HỌC TIẾP) */}
      {transferMode === 'course_exit' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Học sinh hoàn thành khóa</label>
              <select 
                value={selectedStudentId} 
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm font-medium bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none">
                {availableStudents.map(stu => (
                  <option key={stu.id} value={stu.id}>
                    {stu.fullName} - Lớp: {stu.currentClass} (Đã học 16/16 buổi)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Lý do không tiếp tục khóa sau</label>
              <select 
                value={exitReason} 
                onChange={(e) => setExitReason(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm font-medium bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none">
                <option value="Hoàn thành mục tiêu khóa học, tạm dừng">Hoàn thành mục tiêu khóa học, tạm dừng</option>
                <option value="Trùng thời khóa biểu học chính khóa / xe bus">Trùng thời khóa biểu học chính khóa / xe bus</option>
                <option value="Kế hoạch cá nhân / Gia đình chuyển nơi sinh sống">Kế hoạch cá nhân / Gia đình chuyển nơi sinh sống</option>
                <option value="Hoàn thành khóa học, không có nhu cầu học tiếp">Hoàn thành khóa học, không có nhu cầu học tiếp</option>
                <option value="Lý do khác">Lý do khác</option>
              </select>
            </div>
          </div>

          {/* Hộp xác nhận tài chính */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="text-emerald-600 mt-0.5 shrink-0" size={20} />
            <div className="text-xs space-y-1">
              <p className="text-sm font-bold text-emerald-800">ĐỐI SOÁT HỌC PHÍ: ĐÃ HOÀN TẤT NGHĨA VỤ</p>
              <p className="text-emerald-700">
                Học sinh đã hoàn thành toàn bộ 16/16 buổi của lớp cũ. Không phát sinh học phí đóng bù và không bảo lưu học phí.
              </p>
            </div>
          </div>

          {/* Tùy chọn cấp chứng chỉ hoàn thành khóa */}
          <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
            <Award className="text-indigo-600 shrink-0" size={20} />
            <label className="text-xs font-medium text-indigo-900 flex items-center gap-2 cursor-pointer flex-1">
              <input 
                type="checkbox" 
                checked={generateCertificate} 
                onChange={(e) => setGenerateCertificate(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              Tự động tạo Phiếu chứng nhận hoàn thành khóa học & Nhận xét của Huấn luyện viên
            </label>
          </div>
        </div>
      )}

      {/* FOOTER ACTIONS */}
      <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
        {onClose && (
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition cursor-pointer">
            Hủy bỏ
          </button>
        )}
        <button 
          type="button"
          onClick={handleConfirmAction}
          className={`px-5 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer ${
            transferMode === 'course_exit' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}>
          {transferMode === 'course_exit' ? (
            <>
              <LogOut size={16} />
              Xác Nhận Kết Thúc Khóa Học
            </>
          ) : (
            <>
              <ArrowRight size={16} />
              Xác Nhận Chuyển Lớp
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Always render fixed in viewport to avoid having to scroll up to see the popup
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div 
        className="w-full max-w-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {modalBody}
      </div>
    </div>
  );
};

export default ClassTransferModal;
