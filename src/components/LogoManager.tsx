import React, { useState, useEffect } from 'react';
import RoyalLogo from './RoyalLogo';
import { Image as ImageIcon, Upload, RefreshCw, CheckCircle2, AlertCircle, Info, Sparkles, Trash2, Eye, Sun, Moon } from 'lucide-react';

interface LogoManagerProps {
  onClose?: () => void;
}

export default function LogoManager({ onClose }: LogoManagerProps) {
  const [currentLogo, setCurrentLogo] = useState<string | null>(() => {
    try {
      return localStorage.getItem('royal_custom_logo');
    } catch {
      return null;
    }
  });

  const [previewImage, setPreviewImage] = useState<string | null>(currentLogo);
  const [previewBg, setPreviewBg] = useState<'dark' | 'light' | 'grid'>('dark');
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string } | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerLogoUpdate = (logoData: string | null) => {
    if (logoData) {
      localStorage.setItem('royal_custom_logo', logoData);
    } else {
      localStorage.removeItem('royal_custom_logo');
    }
    window.dispatchEvent(new Event('royal_logo_updated'));
    setCurrentLogo(logoData);
    setPreviewImage(logoData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('❌ Vui lòng chọn tệp định dạng hình ảnh hợp lệ (PNG, JPG, SVG, WebP)!');
      return;
    }

    const sizeKb = (file.size / 1024).toFixed(1);
    setFileDetails({
      name: file.name,
      size: `${sizeKb} KB`,
    });

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setPreviewImage(urlInput.trim());
    setFileDetails({
      name: 'Hình ảnh từ liên kết URL',
      size: 'Remote URL',
    });
  };

  const handleApplyLogo = () => {
    if (!previewImage) {
      alert('Vui lòng chọn hoặc tải lên một hình ảnh trước khi lưu!');
      return;
    }
    triggerLogoUpdate(previewImage);
    setToastMessage('🎉 Đã cập nhật logo mới cho toàn bộ hệ thống!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục lại logo huy hiệu mặc định của Royal School?')) {
      triggerLogoUpdate(null);
      setFileDetails(null);
      setUrlInput('');
      setToastMessage('✅ Đã khôi phục logo huy hiệu mặc định của trường!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="logo-manager-section">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl shadow-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl shadow-inner">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <span>Quản Lý Hình Logo Trường</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-sans font-bold border border-amber-500/30">
                  Global Brand
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Tải lên và thay đổi hình ảnh logo của trường. Logo mới sẽ tự động đồng bộ trên toàn bộ hệ thống (Header, Mobile App, Login, Manager...).
              </p>
            </div>
          </div>
        </div>

        {currentLogo && (
          <button
            onClick={handleResetToDefault}
            className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition active:scale-95 flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Khôi phục logo mặc định
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Preview Card (5 columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-sky-400" />
                Xem trước logo trực quan
              </span>

              {/* Background preview switcher */}
              <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-lg border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewBg('dark')}
                  title="Nền tối"
                  className={`p-1.5 rounded transition ${previewBg === 'dark' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg('light')}
                  title="Nền sáng"
                  className={`p-1.5 rounded transition ${previewBg === 'light' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg('grid')}
                  title="Nền trong suốt"
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition ${previewBg === 'grid' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                >
                  PNG
                </button>
              </div>
            </div>

            {/* Display Box */}
            <div
              className={`w-full aspect-square rounded-2xl flex items-center justify-center p-8 transition-colors duration-200 border border-white/10 relative overflow-hidden ${
                previewBg === 'dark'
                  ? 'bg-slate-950 text-white'
                  : previewBg === 'light'
                  ? 'bg-slate-100 text-slate-900 shadow-inner'
                  : 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] bg-slate-800'
              }`}
            >
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview Logo"
                  className="max-h-full max-w-full object-contain drop-shadow-md transition-all duration-300 hover:scale-105"
                />
              ) : (
                <div className="max-h-full max-w-full flex items-center justify-center">
                  <RoyalLogo className="w-48 h-48 drop-shadow-xl" forceDefault={true} />
                </div>
              )}

              {/* Status pill in corner */}
              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-[10px]">
                <span className={`px-2.5 py-1 rounded-full font-bold shadow ${
                  previewImage
                    ? 'bg-sky-500 text-slate-950'
                    : 'bg-emerald-500 text-slate-950'
                }`}>
                  {previewImage ? 'Ảnh mới được chọn' : 'Logo mặc định'}
                </span>

                {fileDetails && (
                  <span className="bg-slate-900/80 text-slate-300 px-2 py-0.5 rounded font-mono border border-white/10">
                    {fileDetails.size}
                  </span>
                )}
              </div>
            </div>

            {/* Application Mini Header Preview */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Mô phỏng hiển thị trên thanh điều hướng (Header):
              </span>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-white/10 flex items-center gap-3">
                {previewImage ? (
                  <img src={previewImage} alt="header-preview" className="w-10 h-10 object-contain shrink-0" />
                ) : (
                  <RoyalLogo className="w-10 h-10 shrink-0" forceDefault={true} />
                )}
                <div className="leading-tight">
                  <span className="text-xs font-extrabold text-white uppercase block">
                    Royal Extracurricular Class
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block">
                    Royal International School
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Upload and Configure Controls (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5 shadow-xl">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-400" />
                Tải lên hình ảnh logo mới
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Hỗ trợ định dạng PNG (khuyên dùng nền trong suốt), JPG, SVG, WebP. Kích thước tối ưu vuông hoặc tỷ lệ 1:1.
              </p>
            </div>

            {/* Drag & Drop File Zone */}
            <label className="border-2 border-dashed border-white/20 hover:border-sky-500/50 hover:bg-sky-500/5 transition duration-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer text-center group">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-110 transition duration-200 shadow-inner">
                <Upload className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-white group-hover:text-sky-300 transition">
                  Nhấp vào đây để chọn tệp hình ảnh từ máy tính
                </p>
                <p className="text-[11px] text-slate-400">
                  Hoặc kéo thả file ảnh logo của trường vào khu vực này
                </p>
              </div>
              {fileDetails && (
                <div className="bg-sky-500/10 text-sky-300 text-[11px] font-mono px-3 py-1 rounded-lg border border-sky-500/20 flex items-center gap-2 mt-1">
                  <span>📄 {fileDetails.name}</span>
                  <span>({fileDetails.size})</span>
                </div>
              )}
            </label>

            {/* Alternative: Enter URL */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
                Hoặc nhập liên kết hình ảnh trực tiếp (Image URL):
              </span>
              <form onSubmit={handleUrlSubmit} className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/logo-royal-school.png"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 glass-input rounded-xl px-3.5 py-2 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  Nạp ảnh
                </button>
              </form>
            </div>

            {/* Instruction Guide Card */}
            <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-4 flex items-start gap-3 text-xs text-sky-300">
              <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-white">Cơ chế đồng bộ logo toàn diện:</p>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Khi nhấn nút <strong>[Lưu và Áp Dụng Logo Toàn Hệ Thống]</strong>, ảnh logo sẽ được lưu trữ an toàn trong bộ nhớ trình duyệt và cập nhật ngay lập tức cho toàn bộ các thanh điều hướng, màn hình đăng nhập, màn hình mobile của giáo viên mà không làm mất dữ liệu học viên hay lịch học hiện có.
                </p>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-white/10">
              {previewImage && (
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(currentLogo);
                    setFileDetails(null);
                    setUrlInput('');
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Hủy thay đổi
                </button>
              )}

              <button
                type="button"
                onClick={handleApplyLogo}
                disabled={!previewImage}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-sky-500 to-amber-500 hover:from-sky-400 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-extrabold transition active:scale-95 shadow-[0_0_20px_rgba(56,189,248,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                LƯU VÀ ÁP DỤNG LOGO TOÀN HỆ THỐNG
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Success Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold py-3 px-5 rounded-2xl shadow-2xl flex items-center gap-2.5 z-50 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
