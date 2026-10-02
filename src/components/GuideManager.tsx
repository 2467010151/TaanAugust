import React from 'react';
import { 
  Info, 
  Smartphone, 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Calendar, 
  Database, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  UserCheck, 
  Clock, 
  Lock, 
  RotateCcw,
  ShieldCheck,
  Ticket
} from 'lucide-react';

interface GuideManagerProps {
  type: 'experience' | 'software';
  onNavigateTab: (tab: 'admin' | 'teacher' | 'schedule' | 'classes' | 'teachers' | 'students') => void;
}

export default function GuideManager({ type, onNavigateTab }: GuideManagerProps) {
  if (type === 'experience') {
    return (
      <div className="space-y-6 animate-fade-in" id="guide-experience-section">
        <div className="bg-slate-900/40 backdrop-blur-md p-6 border border-white/10 rounded-2xl space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-display font-bold text-white uppercase tracking-wide">
              Hướng dẫn trải nghiệm liên thông hệ thống
            </h1>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
            Chào mừng bạn đến với luồng trải nghiệm liên thông dữ liệu thời gian thực giữa <strong>Giao diện Quản trị (Admin Web)</strong>, <strong>Ứng dụng Giáo viên (Teacher Mobile)</strong> và <strong>Cơ sở dữ liệu PostgreSQL (Cloud SQL)</strong>. Dưới đây là các bước chi tiết để bạn tự tay thử nghiệm tính năng đặc sắc này.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-5 border border-white/10 rounded-2xl space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400 block">
              Mô hình Co-Working Stream &amp; PostgreSQL
            </span>
            <h3 className="text-sm font-bold text-white">Lớp ngoại khóa liên thông cuốn chiếu là gì?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Các lớp học ngoại khóa (vẽ, nhạc, võ, kỹ năng sống) thường có tính chất học phí tính theo số buổi thực tế. Khi học sinh nghỉ học có phép, giáo viên tích điểm danh trên điện thoại, hệ thống lập tức cập nhật vé bù tự động bên Admin để xếp lớp bù sang lớp khác có cùng trình độ mà không làm gián đoạn lịch học.
            </p>
          </div>

          <div className="glass-panel p-5 border border-white/10 rounded-2xl space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block">
                Trạng thái đồng bộ
              </span>
              <h3 className="text-sm font-bold text-white">Live Sync 100% thời gian thực vào PostgreSQL</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mọi hành động điểm danh của giáo viên hoặc xếp lớp của Admin đều được lưu trực tiếp vào cơ sở dữ liệu PostgreSQL Cloud SQL qua Drizzle ORM, tự động cập nhật lập tức ở cả hai phân hệ mà không cần tải lại trang.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-2 bg-slate-950/40 p-2 rounded-lg border border-white/5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>PostgreSQL Cloud SQL đang hoạt động đồng bộ</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 border border-white/10 rounded-2xl space-y-6">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
              Kịch bản trải nghiệm đề xuất (3 bước hoàn hảo)
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-950/40 border border-white/5 p-5 rounded-xl space-y-3 relative overflow-hidden group hover:border-sky-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-16 h-16 bg-sky-500/5 rounded-bl-full flex items-center justify-center font-display font-black text-2xl text-sky-500/20">
                1
              </div>
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold font-mono text-xs border border-sky-500/20">
                01
              </div>
              <h4 className="font-bold text-white text-xs">Giáo viên điểm danh (Mobile App)</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Hãy mở phân hệ <strong>Mobile App</strong> của giáo viên, chọn ngày học hiện tại và chuyển điểm danh của bé <strong>Lê Quỳnh Chi (HV002)</strong> thành <span className="text-amber-400 font-semibold">"Có phép"</span>, sau đó nhấn nút <strong className="text-white bg-slate-800 px-1 py-0.5 rounded text-[10px]">[LƯU NHẬT KÝ]</strong>.
              </p>
            </div>

            <div className="bg-slate-950/40 border border-white/5 p-5 rounded-xl space-y-3 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full flex items-center justify-center font-display font-black text-2xl text-emerald-500/20">
                2
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold font-mono text-xs border border-emerald-500/20">
                02
              </div>
              <h4 className="font-bold text-white text-xs">Phát sinh vé học bù tự động</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Ngay lập tức, nhìn sang màn hình <strong>Admin Portal</strong> tại mục <strong>"Học viên có vé học bù"</strong>. Bạn sẽ thấy bé <strong>Lê Quỳnh Chi</strong> xuất hiện ngay với số lượng vé bù tự động tăng lên <strong className="text-emerald-400 font-bold">1 vé</strong> được lưu trữ an toàn trong PostgreSQL!
              </p>
            </div>

            <div className="bg-slate-950/40 border border-white/5 p-5 rounded-xl space-y-3 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full flex items-center justify-center font-display font-black text-2xl text-amber-500/20">
                3
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold font-mono text-xs border border-amber-500/20">
                03
              </div>
              <h4 className="font-bold text-white text-xs">Admin xếp lớp bù cuốn chiếu</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Bên Admin, hãy bấm vào nút <strong className="text-sky-400 font-semibold">[Sắp lịch học bù]</strong> của bé Quỳnh Chi. Chọn một lớp học khác (ví dụ: <strong>Cầu lông - LH003</strong>) để ghép bù. Vé bù sẽ lập tức bị trừ 1, đồng thời bé Quỳnh Chi sẽ xuất hiện ngay bên danh sách lớp mới của Teacher Mobile với nhãn <span className="bg-rose-500/20 text-rose-300 px-1 py-0.2 rounded text-[9px] font-bold">Học bù</span>!
              </p>
            </div>
          </div>

          <div className="bg-sky-500/5 border border-sky-500/10 p-5 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="space-y-1 text-center md:text-left">
              <div className="font-bold text-white text-xs flex items-center justify-center md:justify-start gap-1.5">
                <Smartphone className="w-4 h-4 text-sky-400" /> Sẵn sàng trải nghiệm liên thông?
              </div>
              <p className="text-[10px] text-slate-400">
                Dữ liệu đã được nạp đầy đủ trong cơ sở dữ liệu PostgreSQL để bạn có thể kiểm thử luồng đồng bộ thời gian thực một cách tối ưu nhất.
              </p>
            </div>
            
            <button
              onClick={() => onNavigateTab('admin')}
              className="px-5 py-3 bg-sky-500 text-slate-950 hover:bg-sky-400 font-extrabold text-xs rounded-xl shadow-lg hover:shadow-sky-500/20 transition active:scale-95 flex items-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              Mở Phân Hệ Quản Trị Ngay
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" id="guide-software-section">
      <div className="bg-slate-900/40 backdrop-blur-md p-6 border border-white/10 rounded-2xl space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-display font-bold text-white uppercase tracking-wide">
            Hướng dẫn sử dụng phần mềm quản lý lớp ngoại khóa
          </h1>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
          Tài liệu hướng dẫn chi tiết cách vận hành từng phân hệ, chức năng nghiệp vụ, quy trình điểm danh liên thông và cấu hình hệ thống Royal School kết nối PostgreSQL.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-panel p-4 border border-white/10 rounded-2xl space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
              Mục lục hướng dẫn
            </span>
            <nav className="flex flex-col gap-1 font-sans">
              <a href="#section-admin" className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition flex items-center gap-2">
                <LayoutDashboard className="w-3.5 h-3.5 text-sky-400" />
                1. Phân hệ Quản trị Admin
              </a>
              <a href="#section-mobile" className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                2. Phân hệ Giáo viên Mobile
              </a>
              <a href="#section-schedule" className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                3. Bảng lịch học tháng
              </a>
              <a href="#section-database" className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-rose-400" />
                4. Quản lý Dữ liệu &amp; Backup
              </a>
            </nav>

            <div className="bg-sky-500/5 border border-sky-500/10 p-3 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-sky-400 block uppercase">Phím tắt nhanh</span>
              <p className="text-[10px] text-slate-400 leading-normal">
                Nhấp chuột vào bất cứ nút chức năng nào trên menu để chuyển vùng làm việc tương ứng ngay lập tức.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-9 space-y-6">
          <div id="section-admin" className="glass-panel p-6 border border-white/10 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <div className="p-1.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-lg">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                1. Phân hệ Quản trị viên (Admin Portal)
              </h2>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <p>
                Phân hệ Admin là trung tâm điều hành chính của nhà trường, có quyền cấu hình, chỉnh sửa toàn bộ dữ liệu học sinh, giáo viên, lớp học và điều phối lịch học bù.
              </p>

              <div className="bg-slate-950/60 border border-amber-500/30 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-white font-bold flex items-center gap-1.5 text-xs">
                    <span className="text-amber-400">🔑</span> Thông tin đăng nhập hệ thống (Đã cập nhật):
                  </div>
                  <div className="flex flex-wrap gap-4 text-[11px]">
                    <span className="text-slate-300">Tên đăng nhập: <strong className="text-sky-400 font-mono bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">Admin</strong></span>
                    <span className="text-slate-300">Mật khẩu: <strong className="text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">123456</strong></span>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider shrink-0 border border-amber-500/30 self-start sm:self-center">
                  Toàn quyền Admin
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/3 p-4 rounded-xl space-y-1.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-sky-400" /> Quản lý Học viên
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Admin có thể <strong>Thêm học viên mới</strong>, cập nhật thông tin cá nhân, xem chi tiết lịch sử học tập. Tại tab <em>Quản lý học viên</em>, có thể xóa học viên hoặc xem danh sách lớp thực tế của học viên đó.
                  </p>
                </div>

                <div className="bg-white/3 p-4 rounded-xl space-y-1.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-400" /> Sắp lớp &amp; Ghi danh
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Tính năng <strong>Ghi danh học viên vào lớp</strong> cho phép chỉ định học sinh vào một hoặc nhiều lớp ngoại khóa cố định. Sĩ số lớp thực tế sẽ tự động tính toán dựa trên danh sách ghi danh này.
                  </p>
                </div>

                <div className="bg-white/3 p-4 rounded-xl space-y-1.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-rose-400" /> Quản lý Trạng thái Lớp học
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Lớp học có 3 trạng thái: 🟢 <strong>Đang hoạt động</strong>, 🟡 <strong>Dự kiến</strong>, và 🔴 <strong>Đã khóa</strong>. Đặc biệt, khi kết thúc học kỳ, Admin có thể mở hộp thoại chỉnh sửa lớp và bấm nút <strong className="text-rose-400 font-bold">[Khóa lớp]</strong> ở cuối để chuyển lớp sang trạng thái <strong>Đã khóa</strong>, ngăn ghi danh hay sửa đổi không mong muốn.
                  </p>
                </div>

                <div className="bg-white/3 p-4 rounded-xl space-y-1.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-amber-400" /> Vé học bù &amp; Xếp bù
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Khi học viên có vé bù, Admin nhấn <strong>[Sắp lịch học bù]</strong> trực tiếp tại cột trạng thái của học viên đó, chọn lớp muốn bù, hệ thống sẽ tự động trừ vé bù và ghi nhận trạng thái học viên bù sang lớp mới.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={() => onNavigateTab('classes')}
                  className="px-3.5 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 rounded-xl font-bold text-[11px] flex items-center gap-1 transition"
                >
                  Đến quản lý lớp học <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div id="section-mobile" className="glass-panel p-6 border border-white/10 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <div className="p-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
                <Smartphone className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                2. Phân hệ Giáo viên Mobile (Teacher Mobile App)
              </h2>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <p>
                Giả lập giao diện điện thoại thông minh dành riêng cho giáo viên đứng lớp. Ứng dụng tập trung tối ưu trải nghiệm nhanh, thao tác một chạm khi giảng dạy trên lớp.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-white/3 p-3.5 rounded-xl">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Chọn Ca dạy &amp; Lịch dạy</span>
                    <p className="text-slate-400 text-[11px] mt-1">
                      Giáo viên lựa chọn lớp học đang phụ trách từ danh sách thả xuống. Hệ thống hiển thị lịch dạy cố định và ngày học hiện tại.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/3 p-3.5 rounded-xl">
                  <UserCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Thao tác Điểm danh một chạm</span>
                    <p className="text-slate-400 text-[11px] mt-1">
                      Danh sách học sinh của lớp được tải ra tức thì, phân loại rõ ràng học viên chính thức hoặc học viên đang học bù (<span className="text-rose-400 font-bold bg-rose-500/10 px-1 py-0.2 rounded">Bù</span>). Giáo viên có thể nhanh chóng tích chọn: <strong>Có mặt</strong>, <strong>Có phép</strong> (nghỉ học có xin phép), hoặc <strong>Vắng mặt</strong> (không phép).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/3 p-3.5 rounded-xl">
                  <RotateCcw className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Cơ chế phát sinh vé học bù tự động</span>
                    <p className="text-slate-400 text-[11px] mt-1">
                      Khi giáo viên điểm danh học viên chính thức là <strong>"Có phép"</strong> và ấn nút <strong>[Lưu nhật ký]</strong>, hệ thống tự động ghi nhận nhật ký lớp học và tăng số lượng vé học bù của bé đó lên 1 trong cơ sở dữ liệu chung.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={() => onNavigateTab('teacher')}
                  className="px-3.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl font-bold text-[11px] flex items-center gap-1 transition"
                >
                  Đến giả lập mobile <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div id="section-schedule" className="glass-panel p-6 border border-white/10 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                3. Bảng Lịch học Tổng quan theo Tháng (Schedule Calendar)
              </h2>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <p>
                Công cụ đắc lực giúp Quản trị viên và phụ huynh dễ dàng kiểm tra lịch dạy và học của toàn bộ các lớp ngoại khóa dưới dạng lưới lịch tháng trực quan.
              </p>

              <div className="bg-white/3 p-4 rounded-xl space-y-2">
                <span className="font-bold text-white block">Các tính năng nổi bật của Bảng Lịch học:</span>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-400 text-[11px]">
                  <li><strong>Lọc theo trạng thái:</strong> Lọc danh sách lớp học theo các trạng thái <em>Đang hoạt động</em>, <em>Dự kiến mở</em>, <em>Đã khóa</em> để dễ dàng quản lý.</li>
                  <li><strong>Tìm kiếm thông minh:</strong> Nhập từ khóa tìm kiếm nhanh tên môn học hoặc phòng học cụ thể.</li>
                  <li><strong>Tích chọn hiển thị:</strong> Người dùng có thể tích chọn/bỏ tích chọn từng lớp học ở danh sách bên trái để quyết định lớp nào sẽ xuất hiện trên lưới lịch biểu bên phải.</li>
                  <li><strong>Ghi chú phân biệt rõ ràng:</strong> Lớp hoạt động hiển thị màu xanh dương, lớp dự kiến có màu cam, và lớp đã khóa hiển thị màu hồng gạch có đường gạch ngang (line-through) dễ dàng nhận biết.</li>
                </ul>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={() => onNavigateTab('schedule')}
                  className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold text-[11px] flex items-center gap-1 transition"
                >
                  Đến bảng lịch học <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div id="section-database" className="glass-panel p-6 border border-white/10 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <div className="p-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg">
                <Database className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                4. Quản lý Dữ liệu &amp; Sao lưu (PostgreSQL &amp; Backup)
              </h2>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <p>
                Royal School hỗ trợ các công cụ quản lý toàn vẹn dữ liệu trên PostgreSQL để đảm bảo an toàn thông tin trong suốt quá trình vận hành hệ thống.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/3 p-4 rounded-xl space-y-1.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-sky-400" /> Sơ đồ cơ sở dữ liệu (PostgreSQL)
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Tab <strong>Cơ sở dữ liệu</strong> trong menu <strong>Dữ liệu</strong> hiển thị chi tiết sơ đồ quan hệ (ERD), cấu trúc bảng PostgreSQL được quản lý bởi Drizzle ORM.
                  </p>
                </div>

                <div className="bg-white/3 p-4 rounded-xl space-y-1.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Backup &amp; Phục hồi dữ liệu
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Nút <strong>Backup</strong> trong menu Dữ liệu cho phép bạn tải tệp JSON lưu trữ toàn bộ trạng thái hiện tại của cơ sở dữ liệu về máy cá nhân làm điểm khôi phục dự phòng an toàn.
                  </p>
                </div>
              </div>

              <div className="bg-rose-500/5 border border-rose-500/10 p-3.5 rounded-xl flex gap-2">
                <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 leading-normal">
                  Nút <strong>Reset data</strong> sẽ xóa toàn bộ các thay đổi cục bộ hiện tại của bạn và tải lại cơ sở dữ liệu ban đầu gồm các học viên, giáo viên và lớp học mẫu có sẵn của hệ thống. Hãy cân nhắc kỹ trước khi thực hiện.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
