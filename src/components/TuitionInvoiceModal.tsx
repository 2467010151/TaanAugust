import React, { useState, useEffect } from 'react';
import { TuitionInvoice, formatToVNDate } from '../types';
import RoyalLogo from './RoyalLogo';
import { 
  X, 
  Printer, 
  QrCode, 
  Copy, 
  Check, 
  CreditCard, 
  Building2, 
  Calendar, 
  User, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  DollarSign, 
  Receipt,
  Download
} from 'lucide-react';

interface TuitionInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: TuitionInvoice | null;
  onRecordPayment?: (invoiceId: string, paidAmount: number) => void;
}

export default function TuitionInvoiceModal({
  isOpen,
  onClose,
  invoice,
  onRecordPayment,
}: TuitionInvoiceModalProps) {
  // Khóa cuộn màn hình chính (document.body.style.overflow = 'hidden') khi modal mở
  useEffect(() => {
    if (isOpen && invoice) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || '';
      };
    }
  }, [isOpen, invoice]);

  // Lắng nghe phím Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !invoice) return null;

  const [isCopiedSyntax, setIsCopiedSyntax] = useState(false);
  const [isCopiedAcc, setIsCopiedAcc] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmountInput, setPaymentAmountInput] = useState<number>(invoice.outstandingAmount);

  const copySyntax = () => {
    navigator.clipboard.writeText(invoice.transferSyntax);
    setIsCopiedSyntax(true);
    setTimeout(() => setIsCopiedSyntax(false), 2000);
  };

  const copyAccountNo = () => {
    navigator.clipboard.writeText('02839110001');
    setIsCopiedAcc(true);
    setTimeout(() => setIsCopiedAcc(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (onRecordPayment && paymentAmountInput > 0) {
      onRecordPayment(invoice.id, paymentAmountInput);
      setShowPaymentForm(false);
    }
  };

  const isFullPaid = invoice.paymentStatus === 'paid' || invoice.outstandingAmount === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[95vh] text-slate-100">
        
        {/* Modal Top Bar */}
        <div className="print:hidden bg-slate-950/90 border-b border-white/10 px-5 py-3.5 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Receipt className="w-4 h-4 text-amber-400" />
            <span className="font-bold uppercase tracking-wider">Phiếu Báo Học Phí &amp; Thông Tin Chuyển Khoản</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In phiếu (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-thin print:p-0 print:overflow-visible">
          
          {/* Header Báo Phí */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <RoyalLogo className="w-12 h-12 drop-shadow-md shrink-0" />
              <div>
                <h2 className="font-display font-black text-base sm:text-lg text-white uppercase tracking-tight">
                  Trường Song Ngữ Quốc Tế Royal (Royal School)
                </h2>
                <p className="text-[11px] text-amber-400 font-bold uppercase tracking-widest">
                  Phân Hệ Ngoại Khóa &amp; Bồi Dưỡng Năng Khiếu
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Hotline: 028 3911 0001 • Email: accounting@royalschool.edu.vn
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20 inline-block">
                {invoice.invoiceCode}
              </div>
              <div className="text-[11px] text-slate-400">
                Ngày phát hành: <strong className="text-white">{invoice.createdAt.slice(0, 10)}</strong>
              </div>
              <div className="text-[11px] text-slate-400">
                Hạn chót nộp: <strong className="text-amber-400">{invoice.dueDate}</strong>
              </div>
            </div>
          </div>

          <div className="text-center space-y-1 py-1">
            <h1 className="text-xl sm:text-2xl font-display font-extrabold text-white uppercase tracking-tight">
              PHIẾU BÁO HỌC PHÍ NGOẠI KHÓA
            </h1>
            <p className="text-xs text-slate-400">
              Kính gửi Quý Phụ huynh thông tin học phí học kỳ ngoại khóa của học sinh
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-xl border border-white/10 text-xs">
            <div className="space-y-1.5">
              <div className="text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-400" />
                <span>Họ và tên học sinh:</span>
                <strong className="text-white text-sm">{invoice.studentName}</strong>
              </div>
              <div className="text-slate-400">
                Mã học viên: <strong className="font-mono text-white">{invoice.studentId}</strong>
              </div>
              <div className="text-slate-400">
                Hình thức tính phí:{' '}
                <span className={`px-2 py-0.5 rounded font-bold font-mono text-[10px] ${
                  invoice.billingType === 'full_course' 
                    ? 'bg-emerald-500/20 text-emerald-300' 
                    : 'bg-sky-500/20 text-sky-300'
                }`}>
                  {invoice.billingType === 'full_course' ? 'Đăng ký Trọn khóa' : `Vào từ buổi #${invoice.startSessionIndex} (Học lẻ)`}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Lớp ngoại khóa:</span>
                <strong className="text-white">{invoice.className}</strong>
              </div>
              <div className="text-slate-400">
                Số buổi học đăng ký:{' '}
                <strong className="text-white font-mono">{invoice.registeredSessions}</strong> / {invoice.totalSessionsInCourse} buổi
              </div>
              <div className="text-slate-400">
                Đơn giá 1 buổi:{' '}
                <strong className="text-amber-400 font-mono">{invoice.sessionRate.toLocaleString('vi-VN')} đ</strong>
              </div>
            </div>
          </div>

          <div className="border border-white/10 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-white/10">
                  <th className="py-2.5 px-4">Nội Dung Thanh Toán</th>
                  <th className="py-2.5 px-3 text-center">Buổi Học</th>
                  <th className="py-2.5 px-4 text-right">Đơn Giá</th>
                  <th className="py-2.5 px-4 text-right">Thành Tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">{invoice.className}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {invoice.billingType === 'full_course' 
                        ? 'Biểu phí trọn khóa chuẩn (Học từ buổi 1)' 
                        : `Quy đổi theo buổi: Bắt đầu từ buổi thứ #${invoice.startSessionIndex} đến kết thúc khóa`}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-white font-bold">
                    {invoice.registeredSessions} buổi
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">
                    {invoice.billingType === 'full_course' 
                      ? `${invoice.subtotalAmount.toLocaleString('vi-VN')} đ/khóa` 
                      : `${invoice.sessionRate.toLocaleString('vi-VN')} đ/buổi`}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white text-sm">
                    {invoice.subtotalAmount.toLocaleString('vi-VN')} đ
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="bg-slate-950/60 p-4 border-t border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Tổng học phí theo biểu phí:</span>
                <span className="font-mono font-bold text-sm">{invoice.subtotalAmount.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Số tiền đã thanh toán:</span>
                <span className="font-mono text-emerald-400 font-bold">-{invoice.paidAmount.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-white/10">
                <span className="text-white uppercase">Số tiền còn phải nộp (Công nợ):</span>
                <span className={`font-mono text-base ${isFullPaid ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {invoice.outstandingAmount.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-white/15 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                  Kênh Thanh Toán Ngân Hàng Tự Động (VietQR)
                </h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isFullPaid 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : invoice.paymentStatus === 'partially_paid'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {isFullPaid ? 'ĐÃ HOÀN TẤT THANH TOÁN' : invoice.paymentStatus === 'partially_paid' ? 'THANH TOÁN MỘT PHẦN' : 'CHƯA THANH TOÁN'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-4 flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-md">
                {invoice.bankTransferQr ? (
                  <img
                    src={invoice.bankTransferQr}
                    alt="VietQR Payment"
                    className="w-44 h-44 object-contain"
                  />
                ) : (
                  <div className="w-44 h-44 flex flex-col items-center justify-center text-slate-800 text-xs">
                    <QrCode className="w-12 h-12 text-slate-600 mb-2" />
                    <span>Mã VietQR tự động</span>
                  </div>
                )}
                <span className="text-[10px] font-mono font-bold text-slate-800 mt-1">
                  Quét bằng App Ngân hàng bất kỳ
                </span>
              </div>

              <div className="md:col-span-8 space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Ngân hàng thụ hưởng:</span>
                    <strong className="text-white text-xs">MBBank (Quân Đội)</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Chủ tài khoản:</span>
                    <strong className="text-white text-xs">TRUONG SONG NGU QUOC TE ROYAL</strong>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Số tài khoản:</span>
                    <strong className="font-mono text-white text-sm">02839110001</strong>
                  </div>
                  <button
                    type="button"
                    onClick={copyAccountNo}
                    className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white font-medium text-[11px] transition flex items-center gap-1 cursor-pointer"
                  >
                    {isCopiedAcc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopiedAcc ? 'Đã sao chép' : 'Sao chép STK'}</span>
                  </button>
                </div>

                <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-400 uppercase font-bold block">Cú pháp chuyển khoản bắt buộc:</span>
                    <strong className="font-mono text-amber-300 text-sm tracking-wide">{invoice.transferSyntax}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={copySyntax}
                    className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    {isCopiedSyntax ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopiedSyntax ? 'Đã sao chép' : 'Sao chép cú pháp'}</span>
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 italic">
                  * Hệ thống tự động gạch nợ công nợ học phí trong vòng 5-10 phút sau khi ngân hàng báo có tiền.
                </p>
              </div>
            </div>
          </div>

          {onRecordPayment && !isFullPaid && (
            <div className="print:hidden bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  Ghi Nhận Thu Học Phí (Kế Toán / Giáo Vụ)
                </span>
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(!showPaymentForm)}
                  className="text-xs font-bold text-sky-400 hover:text-sky-300 underline cursor-pointer"
                >
                  {showPaymentForm ? 'Thu gọn' : 'Nhập tiền thu'}
                </button>
              </div>

              {showPaymentForm && (
                <form onSubmit={handleConfirmPay} className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <div className="flex-1 w-full space-y-1">
                    <label className="text-[11px] text-slate-400 block font-medium">
                      Số tiền thực nhận (VNĐ):
                    </label>
                    <input
                      type="number"
                      min={1000}
                      max={invoice.outstandingAmount}
                      value={paymentAmountInput}
                      onChange={(e) => setPaymentAmountInput(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer self-end"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác Nhận Đã Thu</span>
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

        <div className="print:hidden bg-slate-950/80 px-6 py-3 border-t border-white/10 flex justify-between items-center text-xs text-slate-400">
          <span>Phiếu báo phí được tạo tự động bởi Hệ thống Quản lý Học vụ Royal School.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
