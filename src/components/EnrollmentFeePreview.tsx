import React from 'react';
import { BillingType, calculateTuitionFee } from '../types';
import { Calculator, Sparkles, CheckCircle2, Clock, AlertCircle, Coins } from 'lucide-react';

interface EnrollmentFeePreviewProps {
  totalSessions: number;
  fullCourseFee: number;
  pricePerSession: number;
  startSessionIndex: number;
  onStartSessionChange?: (sessionIndex: number) => void;
  classNameTitle?: string;
}

export default function EnrollmentFeePreview({
  totalSessions = 24,
  fullCourseFee = 3600000,
  pricePerSession = 150000,
  startSessionIndex = 1,
  onStartSessionChange,
  classNameTitle,
}: EnrollmentFeePreviewProps) {
  const calculation = calculateTuitionFee(
    startSessionIndex,
    totalSessions,
    fullCourseFee,
    pricePerSession
  );

  const isFullCourse = calculation.billingType === 'full_course';
  const passedSessions = Math.max(0, startSessionIndex - 1);

  return (
    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-white/15 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Bảng Dự Toán Học Phí Trực Tuyến</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                isFullCourse 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              }`}>
                {isFullCourse ? 'Đăng ký Trọn khóa' : 'Học lẻ theo buổi'}
              </span>
            </h4>
            {classNameTitle && (
              <p className="text-[11px] text-slate-400 mt-0.5">{classNameTitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-white/10">
          <span className="text-[11px] text-slate-400 font-medium">Bắt đầu từ buổi:</span>
          {onStartSessionChange ? (
            <input
              type="number"
              min={1}
              max={totalSessions}
              value={startSessionIndex}
              onChange={(e) => onStartSessionChange(Math.max(1, Math.min(totalSessions, Number(e.target.value) || 1)))}
              className="w-14 bg-slate-900 border border-white/20 rounded-lg px-2 py-0.5 text-center font-mono font-bold text-white text-xs focus:outline-none focus:border-sky-500"
            />
          ) : (
            <span className="font-mono font-bold text-white text-xs">#{startSessionIndex}</span>
          )}
          <span className="text-[10px] text-slate-500 font-mono">/ {totalSessions}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center">
        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
          <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-sky-400" />
            Số buổi thực học
          </div>
          <div className="text-lg font-extrabold text-white font-mono mt-1">
            {calculation.registeredSessions} <span className="text-xs font-normal text-slate-400">/ {totalSessions} buổi</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {passedSessions > 0 ? `(Đã qua ${passedSessions} buổi trước khi vào)` : '(Học từ buổi khai giảng đầu tiên)'}
          </div>
        </div>

        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
          <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-center gap-1">
            <Coins className="w-3 h-3 text-amber-400" />
            Đơn giá áp dụng
          </div>
          <div className="text-lg font-extrabold text-amber-400 font-mono mt-1">
            {isFullCourse ? (
              `${(fullCourseFee).toLocaleString('vi-VN')} đ`
            ) : (
              `${pricePerSession.toLocaleString('vi-VN')} đ`
            )}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {isFullCourse ? 'Học phí trọn khóa chuẩn' : 'Biểu phí tính lẻ theo từng buổi'}
          </div>
        </div>

        <div className="bg-emerald-500/15 border border-emerald-500/30 p-3 rounded-xl">
          <div className="text-[10px] text-emerald-300 font-bold uppercase flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Tổng học phí phải nộp
          </div>
          <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1">
            {calculation.subtotalAmount.toLocaleString('vi-VN')} đ
          </div>
          <div className="text-[10px] text-emerald-300/80 mt-0.5 font-medium">
            {isFullCourse ? 'Miễn phí chênh lệch trọn gói' : `(${calculation.registeredSessions} buổi × ${pricePerSession.toLocaleString('vi-VN')} đ)`}
          </div>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-white/5 flex items-start gap-2">
        <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          {isFullCourse ? (
            <span>
              Học sinh đăng ký từ <strong>Buổi 1 (Trọn khóa)</strong>, áp dụng biểu phí trọn gói tiêu chuẩn của nhà trường là <strong>{fullCourseFee.toLocaleString('vi-VN')} đ</strong>.
            </span>
          ) : (
            <span>
              Học sinh vào học khi khóa đã diễn ra (từ <strong>Buổi thứ #{startSessionIndex}</strong>). Hệ thống khấu trừ tự động {passedSessions} buổi đã qua và tính phí theo số buổi thực tế tham gia: <strong>{calculation.registeredSessions} buổi × {pricePerSession.toLocaleString('vi-VN')} đ = {calculation.subtotalAmount.toLocaleString('vi-VN')} đ</strong>.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
