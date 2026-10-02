import React, { useState } from 'react';
import RoyalLogo from './RoyalLogo';
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, Sparkles, CheckCircle2, ArrowRight, Database } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: { username: string; role: string }) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState('Admin');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFillCredentials = () => {
    setUsername('Admin');
    setPassword('123456');
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setErrorMsg('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    // Xác thực tài khoản Admin / 123456
    if (cleanUsername.toLowerCase() === 'admin' && cleanPassword === '123456') {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsSuccess(true);
        if (rememberMe) {
          localStorage.setItem('is_logged_in', 'true');
          localStorage.setItem('auth_username', 'Admin');
        } else {
          sessionStorage.setItem('is_logged_in', 'true');
          sessionStorage.setItem('auth_username', 'Admin');
        }
        setTimeout(() => {
          onLoginSuccess({ username: 'Admin', role: 'Quản trị viên' });
        }, 500);
      }, 400);
    } else {
      setErrorMsg('Tên đăng nhập hoặc mật khẩu không đúng! Vui lòng thử lại với: Admin / 123456');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative font-sans text-slate-100 selection:bg-sky-500/30 selection:text-white">
      {/* Background Ambience */}
      <div className="mesh-bg fixed inset-0 pointer-events-none"></div>

      {/* Decorative Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Main Card */}
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.5)] space-y-6">
          
          {/* Logo & School Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex p-3 rounded-2xl bg-slate-950/60 border border-white/10 shadow-inner drop-shadow-[0_0_20px_rgba(243,181,26,0.3)]">
              <RoyalLogo className="w-16 h-16" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight text-white uppercase">
                Royal Extracurricular Class
              </h1>
              <p className="text-xs font-bold text-amber-400 tracking-wider uppercase mt-0.5">
                Royal International School
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  <Database className="w-3 h-3 text-sky-400" />
                  PostgreSQL (Cloud SQL) Connected
                </span>
              </div>
            </div>
          </div>

          {/* Prompt Highlight / Information Box: Displayed credentials */}
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 px-2 py-0.5 bg-amber-500/20 text-amber-300 font-bold text-[10px] rounded-bl-lg border-l border-b border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Đã cập nhật
            </div>

            <div className="flex items-center gap-2 mb-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-bold text-white uppercase tracking-wide">
                Thông tin đăng nhập hệ thống
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5 flex flex-col justify-center">
                <span className="text-[11px] text-slate-400 font-medium">Tên đăng nhập:</span>
                <span className="font-mono font-bold text-sky-400 text-sm mt-0.5">Admin</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5 flex flex-col justify-center">
                <span className="text-[11px] text-slate-400 font-medium">Mật khẩu:</span>
                <span className="font-mono font-bold text-amber-400 text-sm mt-0.5">123456</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFillCredentials}
              className="mt-2.5 w-full py-1.5 px-3 bg-white/5 hover:bg-white/10 active:bg-white/15 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-white/10 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Tự động điền tài khoản Admin
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Success Notification */}
          {isSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Đăng nhập thành công! Đang chuyển hướng vào hệ thống...</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tên đăng nhập */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập (Admin)"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-white/10 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Mật khẩu
                </label>
                <button
                  type="button"
                  onClick={() => setPassword('123456')}
                  className="text-[11px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                >
                  Mật khẩu mặc định: 123456
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu (123456)"
                  required
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-950/60 border border-white/10 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500"
                />
                <span>Ghi nhớ phiên đăng nhập</span>
              </label>
              <span className="text-slate-500 text-[11px]">Bảo mật SSL 256-bit</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-sky-500 to-amber-500 hover:from-sky-400 hover:to-amber-400 active:from-sky-600 active:to-amber-600 text-slate-950 shadow-[0_0_25px_rgba(56,189,248,0.35)] transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  Đăng nhập thành công
                </>
              ) : (
                <>
                  <span>ĐĂNG NHẬP HỆ THỐNG</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="pt-2 text-center text-[11px] text-slate-500">
            Royal International School • Hệ thống dành riêng cho Ban Quản Trị &amp; Giáo Viên
          </div>
        </div>
      </div>
    </div>
  );
}
