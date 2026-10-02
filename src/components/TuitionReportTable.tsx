/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  QrCode, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Receipt,
  DollarSign,
  Calendar,
  X,
  Send
} from 'lucide-react';
import { 
  TuitionInvoice as AppTuitionInvoice, 
  HocVien, 
  LopHoc, 
  formatToVNDate,
  generateVietQrUrl 
} from '../types';

export interface TuitionInvoiceItem {
  id: string;
  invoiceCode: string;
  studentName: string;
  mainClass: string;
  className: string;
  billingType: 'full_course' | 'prorated_sessions';
  registeredSessions: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: 'paid' | 'partially_paid' | 'unpaid';
  dueDate: string;
  bankTransferQr?: string;
  transferSyntax?: string;
}

const MOCK_INVOICES: TuitionInvoiceItem[] = [
  {
    id: '1',
    invoiceCode: 'INV-202610-001',
    studentName: 'Nguyễn Hoàng Long',
    mainClass: '3A1',
    className: 'Cờ vua Nền tảng K01',
    billingType: 'full_course',
    registeredSessions: 16,
    totalAmount: 2400000,
    paidAmount: 2400000,
    outstandingAmount: 0,
    status: 'paid',
    dueDate: '2026-10-05',
    transferSyntax: 'RS8921 INV001'
  },
  {
    id: '2',
    invoiceCode: 'INV-202610-002',
    studentName: 'Lê Minh Anh',
    mainClass: '2A3',
    className: 'Bơi lội Cơ bản K02',
    billingType: 'prorated_sessions',
    registeredSessions: 10,
    totalAmount: 2000000,
    paidAmount: 1000000,
    outstandingAmount: 1000000,
    status: 'partially_paid',
    dueDate: '2026-10-10',
    transferSyntax: 'RS7712 INV002'
  },
  {
    id: '3',
    invoiceCode: 'INV-202610-003',
    studentName: 'Trần Gia Huy',
    mainClass: '4A2',
    className: 'Robotics Nền tảng K01',
    billingType: 'full_course',
    registeredSessions: 16,
    totalAmount: 3200000,
    paidAmount: 0,
    outstandingAmount: 3200000,
    status: 'unpaid',
    dueDate: '2026-10-03',
    transferSyntax: 'RS6320 INV003'
  }
];

export interface TuitionReportTableProps {
  invoices?: AppTuitionInvoice[];
  students?: HocVien[];
  classes?: LopHoc[];
  onOpenInvoiceModal?: (invoice: AppTuitionInvoice) => void;
  onRecordPayment?: (invoiceId: string, amount: number) => void;
}

export const TuitionReportTable: React.FC<TuitionReportTableProps> = ({
  invoices,
  students = [],
  classes = [],
  onOpenInvoiceModal,
  onRecordPayment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPayInvoice, setSelectedPayInvoice] = useState<TuitionInvoiceItem | null>(null);
  const [payAmountInput, setPayAmountInput] = useState<number>(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Khóa cuộn màn hình chính (document.body.style.overflow = 'hidden') khi modal mở
  useEffect(() => {
    if (selectedPayInvoice) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || '';
      };
    }
  }, [selectedPayInvoice]);

  // Lắng nghe phím ESC
  useEffect(() => {
    if (!selectedPayInvoice) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPayInvoice(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPayInvoice]);

  // Normalize invoices from props or fallback to MOCK_INVOICES
  const invoiceData: TuitionInvoiceItem[] = useMemo(() => {
    if (invoices && invoices.length > 0) {
      return invoices.map(inv => {
        const student = students.find(s => s.id === inv.studentId);
        return {
          id: inv.id,
          invoiceCode: inv.invoiceCode,
          studentName: inv.studentName,
          mainClass: student?.lopChinhKhoa || 'Tiểu học',
          className: inv.className,
          billingType: inv.billingType,
          registeredSessions: inv.registeredSessions,
          totalAmount: inv.subtotalAmount,
          paidAmount: inv.paidAmount,
          outstandingAmount: inv.outstandingAmount,
          status: inv.paymentStatus,
          dueDate: inv.dueDate,
          bankTransferQr: inv.bankTransferQr,
          transferSyntax: inv.transferSyntax
        };
      });
    }
    return MOCK_INVOICES;
  }, [invoices, students]);

  // Filtered list
  const filteredInvoices = useMemo(() => {
    return invoiceData.filter((inv) => {
      const term = searchTerm.trim().toLowerCase();
      const matchSearch =
        !term ||
        inv.studentName.toLowerCase().includes(term) ||
        inv.invoiceCode.toLowerCase().includes(term) ||
        inv.className.toLowerCase().includes(term) ||
        inv.mainClass.toLowerCase().includes(term);

      const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoiceData, searchTerm, statusFilter]);

  // Handle Export to CSV/Excel
  const handleExportExcel = () => {
    const headers = [
      'Mã Báo Phí',
      'Học Sinh',
      'Lớp Chính Khóa',
      'Lớp Ngoại Khóa',
      'Hình Thức Tính Phí',
      'Số Buổi',
      'Tổng Học Phí (VNĐ)',
      'Đã Thu (VNĐ)',
      'Còn Nợ (VNĐ)',
      'Trạng Thái',
      'Hạn Thanh Toán'
    ];

    const rows = filteredInvoices.map(inv => [
      inv.invoiceCode,
      `"${inv.studentName}"`,
      `"${inv.mainClass}"`,
      `"${inv.className}"`,
      inv.billingType === 'full_course' ? 'Trọn khóa' : 'Buổi lẻ',
      inv.registeredSessions,
      inv.totalAmount,
      inv.paidAmount,
      inv.outstandingAmount,
      inv.status === 'paid' ? 'Đã đóng' : inv.status === 'partially_paid' ? 'Nộp 1 phần' : 'Chưa đóng',
      inv.dueDate
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bao_Cao_Hoc_Phi_RoyalSchool_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMsg('Đã xuất thành công file báo cáo học phí!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleOpenPayModal = (inv: TuitionInvoiceItem) => {
    setSelectedPayInvoice(inv);
    setPayAmountInput(inv.outstandingAmount > 0 ? inv.outstandingAmount : 0);
  };

  const handleConfirmPayment = () => {
    if (!selectedPayInvoice) return;
    if (payAmountInput <= 0) {
      alert('Vui lòng nhập số tiền thanh toán hợp lệ lớn hơn 0!');
      return;
    }

    if (onRecordPayment) {
      onRecordPayment(selectedPayInvoice.id, payAmountInput);
    }

    setToastMsg(`Đã ghi nhận thanh toán ${payAmountInput.toLocaleString('vi-VN')} đ cho phiếu ${selectedPayInvoice.invoiceCode} thành công!`);
    setSelectedPayInvoice(null);
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 text-slate-800">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-400 text-xs font-bold animate-bounce">
          <CheckCircle size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Thanh công cụ tìm kiếm và lọc */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Tìm theo tên học sinh, mã báo phí, lớp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white font-medium text-slate-700 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="paid">Đã thanh toán</option>
            <option value="partially_paid">Đóng một phần</option>
            <option value="unpaid">Chưa thanh toán</option>
          </select>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition cursor-pointer"
          >
            <Download size={16} /> Xuất Excel
          </button>
        </div>
      </div>

      {/* Bảng dữ liệu danh sách báo phí */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
              <th className="py-3 px-3">Mã Báo Phí</th>
              <th className="py-3 px-3">Học Sinh / Lớp Chính</th>
              <th className="py-3 px-3">Lớp Ngoại Khóa</th>
              <th className="py-3 px-3">Loại Tính Phí</th>
              <th className="py-3 px-3 text-right">Tổng Phí</th>
              <th className="py-3 px-3 text-right">Đã Nộp</th>
              <th className="py-3 px-3 text-right">Còn Nợ</th>
              <th className="py-3 px-3 text-center">Trạng Thái</th>
              <th className="py-3 px-3 text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                  Không tìm thấy phiếu báo phí nào phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-indigo-600 font-mono text-xs">{inv.invoiceCode}</td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-900">{inv.studentName}</div>
                    <div className="text-xs text-slate-400">Lớp: {inv.mainClass}</div>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-800">{inv.className}</td>
                  <td className="py-3 px-3">
                    {inv.billingType === 'full_course' ? (
                      <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full inline-block">
                        Trọn khóa ({inv.registeredSessions}b)
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-block">
                        Tính buổi lẻ ({inv.registeredSessions}b)
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-medium font-mono">{inv.totalAmount.toLocaleString('vi-VN')} đ</td>
                  <td className="py-3 px-3 text-right text-emerald-600 font-medium font-mono">{inv.paidAmount.toLocaleString('vi-VN')} đ</td>
                  <td className="py-3 px-3 text-right text-rose-600 font-bold font-mono">
                    {inv.outstandingAmount > 0 ? `${inv.outstandingAmount.toLocaleString('vi-VN')} đ` : '-'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {inv.status === 'paid' && (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                        <CheckCircle size={12} /> Đã đóng
                      </span>
                    )}
                    {inv.status === 'partially_paid' && (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                        <Clock size={12} /> Nộp 1 phần
                      </span>
                    )}
                    {inv.status === 'unpaid' && (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-medium">
                        <AlertTriangle size={12} /> Chưa đóng
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button 
                      onClick={() => handleOpenPayModal(inv)}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold px-2.5 py-1.5 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition cursor-pointer"
                    >
                      Thu Phí
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: THU PHÍ / QUÉT VIETQR */}
      {selectedPayInvoice && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPayInvoice(null);
          }}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 my-auto max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-base">Xử Lý Thu Học Phí</h3>
              </div>
              <button 
                onClick={() => setSelectedPayInvoice(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã báo phí:</span>
                <strong className="text-indigo-600 font-mono">{selectedPayInvoice.invoiceCode}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Học sinh:</span>
                <strong className="text-slate-800">{selectedPayInvoice.studentName} ({selectedPayInvoice.mainClass})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lớp ngoại khóa:</span>
                <span className="font-medium text-slate-700">{selectedPayInvoice.className}</span>
              </div>
              <div className="flex justify-between border-t pt-1.5 border-slate-200">
                <span className="text-slate-500">Còn nợ:</span>
                <strong className="text-rose-600 font-mono text-sm">
                  {selectedPayInvoice.outstandingAmount.toLocaleString('vi-VN')} đ
                </strong>
              </div>
            </div>

            {/* VietQR Code Preview */}
            <div className="p-3 bg-slate-100 rounded-xl flex items-center gap-3">
              <img 
                src={selectedPayInvoice.bankTransferQr || generateVietQrUrl('02839110001', 'TRUONG SONG NGU QUOC TE ROYAL', selectedPayInvoice.outstandingAmount, selectedPayInvoice.transferSyntax || selectedPayInvoice.invoiceCode)}
                alt="VietQR" 
                className="w-20 h-20 object-contain rounded-lg border border-slate-200 bg-white p-1 shrink-0"
              />
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <QrCode size={14} className="text-indigo-600" /> Quét mã VietQR MBBank
                </p>
                <p className="text-[11px] text-slate-500">STK: 02839110001 (MBBank)</p>
                <p className="text-[10px] font-mono text-indigo-600 font-semibold">Cú pháp: {selectedPayInvoice.transferSyntax || selectedPayInvoice.invoiceCode}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase">
                Số tiền thực thu lần này (VNĐ)
              </label>
              <input
                type="number"
                min={1000}
                step={10000}
                value={payAmountInput}
                onChange={(e) => setPayAmountInput(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelectedPayInvoice(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
              >
                Xác Nhận Thu Tiền
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TuitionReportTable;
