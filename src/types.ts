/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HocVien {
  id: string;
  name: string;
  sdtPhuHuynh: string;
  ngayBatDau: string; // YYYY-MM-DD
  ngayKetThuc: string; // YYYY-MM-DD
  trangThai: 'Còn hạn' | 'Hết hạn' | 'Chờ lớp';
  soVeHocBu: number; // Mặc định = 0
  hoTenPhuHuynh?: string; // Tên phụ huynh (bố/mẹ)
  lopChinhKhoa?: string; // Lớp chính khóa đang theo học
  ngaySinh?: string; // Ngày sinh YYYY-MM-DD
  gioiTinh?: 'Nam' | 'Nữ' | 'Khác';
  soBuoiHoc?: number; // Số buổi học đăng ký
  coSo?: string; // Cơ sở học
  choXepLop?: boolean; // Học sinh chờ lớp
  danhSachMonHoc?: string[]; // Danh sách các môn học đăng ký
  dangKyXeBus?: boolean; // Học sinh đăng ký dịch vụ đưa đón xe bus trường
  tuyenBus?: string; // Tên tuyến xe bus đưa đón
}

export interface CoSo {
  id: string; // Mã cơ sở, ví dụ: CS01, CS02
  name: string; // Tên cơ sở
  diaChi: string; // Địa chỉ
  sdt: string; // Số điện thoại
}

export const INITIAL_CO_SO: CoSo[] = [
  {
    id: 'CS01',
    name: 'Cơ sở Phú Mỹ Hưng - Royal South',
    diaChi: '08 Đặng Đại Độ, P. Tân Phong, Quận 7, TP.HCM',
    sdt: '028 7100 7878',
  },
  {
    id: 'CS02',
    name: 'Cơ sở Nam Sài Gòn - Royal Riverside',
    diaChi: '02 Đường 2D, KDC Nam Long, An Phú Tây, Bình Chánh, TP.HCM',
    sdt: '028 7100 7979',
  },
  {
    id: 'CS03',
    name: 'Cơ sở TP. Thủ Đức - Royal East',
    diaChi: '150 Võ Văn Ngân, P. Bình Thọ, TP. Thủ Đức, TP.HCM',
    sdt: '028 7101 2233',
  },
  {
    id: 'CS04',
    name: 'Cơ sở Bình Tân - Royal West',
    diaChi: 'Số 01 Đường 17A, P. Bình Trị Đông B, Q. Bình Tân, TP.HCM',
    sdt: '028 7101 8899',
  },
];

export interface MonHoc {
  id: string; // Mã môn học, ví dụ: MH01, MH02
  tenMon: string; // Tên môn học
  tenTiengAnh?: string; // Tên tiếng Anh (Basketball, Manga Creation, etc.)
  nhomMon?: 'Thể thao' | 'Nghệ thuật' | 'Học thuật' | 'Phát triển kỹ năng' | string;
  thoiLuong?: string; // 90 phút, 60 phút
  siSo?: string; // Sĩ số khuyến nghị: '7 - 15', '5 - 15', '10 - 15', 'Tư vấn 1:1'
  soBuoiHoc: number; // Số buổi học (16 buổi, 8 buổi, 1 buổi)
  hocPhiTheoBuoi: number; // Học phí tính theo buổi (VNĐ)
  hocPhiTheoKhoa: number; // Học phí tính theo khóa (VNĐ)
  moTa?: string; // Ghi chú / mô tả môn học
}

export const INITIAL_MON_HOC: MonHoc[] = [
  // I. NHÓM MÔN THỂ THAO / SPORTS CATEGORIES
  {
    id: 'MH01',
    tenMon: 'Bóng rổ (Basketball)',
    tenTiengAnh: 'Basketball',
    nhomMon: 'Thể thao',
    thoiLuong: '90 phút',
    siSo: '7 - 15',
    soBuoiHoc: 16,
    hocPhiTheoBuoi: 250000,
    hocPhiTheoKhoa: 4000000,
    moTa: 'Phát triển thể lực toàn diện, sức bật và tinh thần đồng đội chuẩn quốc tế (7 - 15 HS, 90 phút/buổi)',
  },
  {
    id: 'MH02',
    tenMon: 'Pickleball',
    tenTiengAnh: 'Pickleball',
    nhomMon: 'Thể thao',
    thoiLuong: '90 phút',
    siSo: '7 - 15',
    soBuoiHoc: 16,
    hocPhiTheoBuoi: 200000,
    hocPhiTheoKhoa: 3200000,
    moTa: 'Môn thể thao xu hướng quốc tế, tăng cường phản xạ, độ dẻo dai và phối hợp vận động (7 - 15 HS, 90 phút/buổi)',
  },
  {
    id: 'MH03',
    tenMon: 'Aerobic (Aerobics)',
    tenTiengAnh: 'Aerobics',
    nhomMon: 'Thể thao',
    thoiLuong: '90 phút',
    siSo: '7 - 15',
    soBuoiHoc: 16,
    hocPhiTheoBuoi: 150000,
    hocPhiTheoKhoa: 2400000,
    moTa: 'Rèn luyện nhịp điệu, giải phóng năng lượng và sự uyển chuyển dẻo dai (7 - 15 HS, 90 phút/buổi)',
  },
  {
    id: 'MH04',
    tenMon: 'Dance',
    tenTiengAnh: 'Dance',
    nhomMon: 'Thể thao',
    thoiLuong: '60 phút',
    siSo: '7 - 15',
    soBuoiHoc: 16,
    hocPhiTheoBuoi: 150000,
    hocPhiTheoKhoa: 2400000,
    moTa: 'Cảm thụ âm nhạc, vũ đạo hiện đại và giải phóng hình thể (7 - 15 HS, 60 phút/buổi)',
  },
  {
    id: 'MH05',
    tenMon: 'Karate',
    tenTiengAnh: 'Karate',
    nhomMon: 'Thể thao',
    thoiLuong: '90 phút',
    siSo: '7 - 15',
    soBuoiHoc: 16,
    hocPhiTheoBuoi: 150000,
    hocPhiTheoKhoa: 2400000,
    moTa: 'Võ đạo Nhật Bản, rèn luyện sự kiên định, kỷ luật và phản xạ tự vệ (7 - 15 HS, 90 phút/buổi)',
  },
  {
    id: 'MH06',
    tenMon: 'Bóng đá (Football)',
    tenTiengAnh: 'Football',
    nhomMon: 'Thể thao',
    thoiLuong: '90 phút',
    siSo: '7 - 15',
    soBuoiHoc: 16,
    hocPhiTheoBuoi: 250000,
    hocPhiTheoKhoa: 4000000,
    moTa: 'Kỹ thuật dẫn bóng, chuyền bóng, tư duy chiến thuật và thể lực sân cỏ (7 - 15 HS, 90 phút/buổi)',
  },
  {
    id: 'MH07',
    tenMon: 'Bơi lội (Khối 1 & 2)',
    tenTiengAnh: 'Swimming (Grade 1 & 2)',
    nhomMon: 'Thể thao',
    thoiLuong: '90 phút',
    siSo: '7 - 15',
    soBuoiHoc: 16,
    hocPhiTheoBuoi: 200000,
    hocPhiTheoKhoa: 3200000,
    moTa: 'Kỹ năng sinh tồn dưới nước, các kiểu bơi cơ bản trong hồ bơi tiêu chuẩn quốc tế (7 - 15 HS, 90 phút/buổi)',
  },
  {
    id: 'MH08',
    tenMon: 'Vovinam (Vivonam)',
    tenTiengAnh: 'Vovinam',
    nhomMon: 'Thể thao',
    thoiLuong: '90 phút',
    siSo: '7 - 15',
    soBuoiHoc: 16,
    hocPhiTheoBuoi: 150000,
    hocPhiTheoKhoa: 2400000,
    moTa: 'Việt Võ Đạo truyền thống, phát triển thể chất và tinh thần thượng võ (7 - 15 HS, 90 phút/buổi)',
  },
  {
    id: 'MH09',
    tenMon: 'Cờ vua nền tảng (Foundational Chess)',
    tenTiengAnh: 'Foundational Chess',
    nhomMon: 'Thể thao',
    thoiLuong: '90 phút',
    siSo: '7 - 15',
    soBuoiHoc: 16,
    hocPhiTheoBuoi: 150000,
    hocPhiTheoKhoa: 2400000,
    moTa: 'Làm quen quân cờ, luật chơi và các nước đi nhập môn trí tuệ (7 - 15 HS, 90 phút/buổi)',
  },
  {
    id: 'MH10',
    tenMon: 'Cờ vua cơ bản (Basic Chess)',
    tenTiengAnh: 'Basic Chess',
    nhomMon: 'Thể thao',
    thoiLuong: '90 phút',
    siSo: '7 - 15',
    soBuoiHoc: 16,
    hocPhiTheoBuoi: 175000,
    hocPhiTheoKhoa: 2800000,
    moTa: 'Tư duy khai cuộc, phối hợp quân cờ và các đòn phối hợp chiến thuật cơ bản (7 - 15 HS, 90 phút/buổi)',
  },
  {
    id: 'MH11',
    tenMon: 'Cờ vua nâng cao (Advanced Chess)',
    tenTiengAnh: 'Advanced Chess',
    nhomMon: 'Thể thao',
    thoiLuong: '90 phút',
    siSo: '7 - 15',
    soBuoiHoc: 16,
    hocPhiTheoBuoi: 200000,
    hocPhiTheoKhoa: 3200000,
    moTa: 'Chiến thuật trung cuộc - tàn cuộc chuyên sâu và thi đấu cọ xát chuẩn quốc tế (7 - 15 HS, 90 phút/buổi)',
  },

  // II. NHÓM MÔN NGHỆ THUẬT / ARTS CATEGORIES
  {
    id: 'MH12',
    tenMon: 'Vẽ tư duy sáng tạo (Creative Mind Map Drawing)',
    tenTiengAnh: 'Creative Mind Map Drawing',
    nhomMon: 'Nghệ thuật',
    thoiLuong: '60 phút',
    siSo: '7 - 15',
    soBuoiHoc: 16,
    hocPhiTheoBuoi: 230000,
    hocPhiTheoKhoa: 3680000,
    moTa: 'Kết hợp hình ảnh và tư duy sáng tạo, kích thích phát triển tiềm năng não bộ (7 - 15 HS, 60 phút/buổi)',
  },
  {
    id: 'MH13',
    tenMon: 'Sáng tác truyện tranh Manga (Manga Creation)',
    tenTiengAnh: 'Manga Creation',
    nhomMon: 'Nghệ thuật',
    thoiLuong: '60 phút',
    siSo: '7 - 15',
    soBuoiHoc: 16,
    hocPhiTheoBuoi: 250000,
    hocPhiTheoKhoa: 4000000,
    moTa: 'Phác thảo nhân vật hoạt hình, biểu cảm, phân khung và xây dựng cốt truyện tranh Nhật Bản (7 - 15 HS, 60 phút/buổi)',
  },
  {
    id: 'MH14',
    tenMon: 'Vẽ màu Gouache (Gouache painting)',
    tenTiengAnh: 'Gouache painting',
    nhomMon: 'Nghệ thuật',
    thoiLuong: '60 phút',
    siSo: '7 - 15',
    soBuoiHoc: 16,
    hocPhiTheoBuoi: 280000,
    hocPhiTheoKhoa: 4480000,
    moTa: 'Kỹ thuật pha màu bột Gouache mịn đục, vẽ tĩnh vật và phong cảnh chuyên sâu (7 - 15 HS, 60 phút/buổi)',
  },
  {
    id: 'MH15',
    tenMon: 'Vẽ Leningrad (Leningrad painting)',
    tenTiengAnh: 'Leningrad painting',
    nhomMon: 'Nghệ thuật',
    thoiLuong: '60 phút',
    siSo: '7 - 15',
    soBuoiHoc: 16,
    hocPhiTheoBuoi: 280000,
    hocPhiTheoKhoa: 4480000,
    moTa: 'Hội họa màu nước Leningrad cao cấp, hòa sắc trong trẻo và tả chất tinh tế (7 - 15 HS, 60 phút/buổi)',
  },
  {
    id: 'MH16',
    tenMon: 'Piano group (Group Piano)',
    tenTiengAnh: 'Group Piano',
    nhomMon: 'Nghệ thuật',
    thoiLuong: '60 phút',
    siSo: '5 - 15',
    soBuoiHoc: 16,
    hocPhiTheoBuoi: 250000,
    hocPhiTheoKhoa: 4000000,
    moTa: 'Luyện ngón, thị tấu nốt nhạc và hòa tấu piano nhóm vui nhộn theo giáo trình chuẩn (5 - 15 HS, 60 phút/buổi)',
  },

  // III. NHÓM CÁC MÔN HỌC THUẬT / ACADEMIC SUBJECTS CATEGORIES
  {
    id: 'MH17',
    tenMon: 'Robotics Foundation',
    tenTiengAnh: 'Robotics Foundation',
    nhomMon: 'Học thuật',
    thoiLuong: '90 phút',
    siSo: '10 - 15',
    soBuoiHoc: 8,
    hocPhiTheoBuoi: 300000,
    hocPhiTheoKhoa: 2400000,
    moTa: 'Nền tảng lắp ráp cơ khí & lập trình điều khiển robot thông minh cho học sinh (10 - 15 HS, 90 phút/buổi, khóa 8 buổi)',
  },
  {
    id: 'MH18',
    tenMon: 'Robotics Competition Test & Prep',
    tenTiengAnh: 'Robotics Competition Test & Prep',
    nhomMon: 'Học thuật',
    thoiLuong: '90 phút',
    siSo: '10 - 15',
    soBuoiHoc: 16,
    hocPhiTheoBuoi: 300000,
    hocPhiTheoKhoa: 4800000,
    moTa: 'Luyện đề, nâng cấp thuật toán và chuẩn bị thi đấu Robotics cấp trường & quốc tế (10 - 15 HS, 90 phút/buổi, khóa 16 buổi)',
  },

  // IV. NHÓM MÔN PHÁT TRIỂN KỸ NĂNG / SKILL DEVELOPMENT SUBJECT CATEGORIES
  {
    id: 'MH19',
    tenMon: 'Luyện chữ đẹp (Handwriting Practice)',
    tenTiengAnh: 'Handwriting Practice',
    nhomMon: 'Phát triển kỹ năng',
    thoiLuong: '90 phút',
    siSo: '5 - 15',
    soBuoiHoc: 16,
    hocPhiTheoBuoi: 150000,
    hocPhiTheoKhoa: 2400000,
    moTa: 'Tư thế ngồi, cách cầm bút chuẩn và kỹ thuật viết chữ nét thanh nét đậm chuẩn mực (5 - 15 HS, 90 phút/buổi)',
  },
  {
    id: 'MH20',
    tenMon: 'Hỗ trợ Quản lý cảm xúc cá nhân',
    tenTiengAnh: 'Personal Emotional Regulation Support',
    nhomMon: 'Phát triển kỹ năng',
    thoiLuong: '60 phút',
    siSo: 'Tư vấn 1:1',
    soBuoiHoc: 1,
    hocPhiTheoBuoi: 600000,
    hocPhiTheoKhoa: 600000,
    moTa: 'Chuyên gia tâm lý học đường đồng hành 1:1, giải tỏa căng thẳng và định hướng cảm xúc tích cực (Counseling 1:1, 60 phút/buổi)',
  },
  {
    id: 'MH21',
    tenMon: 'Hỗ trợ Quản lý cảm xúc tương tác xã hội',
    tenTiengAnh: 'Social-Emotional Regulation Support',
    nhomMon: 'Phát triển kỹ năng',
    thoiLuong: '60 phút',
    siSo: '5 - 8',
    soBuoiHoc: 8,
    hocPhiTheoBuoi: 400000,
    hocPhiTheoKhoa: 3200000,
    moTa: 'Kỹ năng giao tiếp, lắng nghe, kết bạn và xử lý tình huống xã hội nhóm nhỏ (5 - 8 HS, 60 phút/buổi, khóa 8 buổi)',
  },
];

export interface LopHoc {
  id: string;
  tenMon: string;
  tenLop?: string;
  coSo?: string;
  phongHoc: string;
  siSoToiDa: number;
  lichHocCoDinh: string;
  days: string[];
  time: string;
  trangThai?: 'Đang hoạt động' | 'Dự kiến' | 'Đã khóa';
  soBuoiHoc?: number;
  ngayBatDau?: string;
  ngayKetThuc?: string;
  hocPhiTronKhoa?: number;
  donGiaBuoi?: number;
  facilityId?: string;
  teacherName?: string;
}

export interface DanhSachLop {
  id: string;
  idLop: string;
  idHocVien: string;
  loaiHocVien: 'Chính thức' | 'Học bù';
  status?: 'active' | 'transferred_out' | 'completed';
  remainingSessions?: number;
  paymentStatus?: 'paid' | 'unpaid';
}

export interface DiemDanh {
  id: string;
  idLop: string;
  ngayHoc: string; // YYYY-MM-DD
  idHocVien: string;
  trangThai: 'Có mặt' | 'Vắng có phép' | 'Vắng không phép';
  nhanXetRieng: string;
  hinhAnh: string[];
}

export const INITIAL_HOC_VIEN: HocVien[] = [
  {
    id: 'HV001',
    name: 'Nguyễn Minh Khôi',
    sdtPhuHuynh: '0912345678',
    ngayBatDau: '2026-09-07',
    ngayKetThuc: '2026-10-28',
    trangThai: 'Còn hạn',
    soVeHocBu: 1,
    hoTenPhuHuynh: 'Nguyễn Minh Tuấn',
    lopChinhKhoa: '4A1',
    ngaySinh: '2017-05-12',
    gioiTinh: 'Nam',
    soBuoiHoc: 16,
    coSo: 'Cơ sở Phú Mỹ Hưng - Royal South',
    danhSachMonHoc: ['Bóng rổ Junior & Pro'],
    dangKyXeBus: true,
    tuyenBus: 'Tuyến Q7 - Phú Mỹ Hưng (Xe Royal 01 - 18h45)',
  },
  {
    id: 'HV002',
    name: 'Lê Quỳnh Chi',
    sdtPhuHuynh: '0987654321',
    ngayBatDau: '2026-09-08',
    ngayKetThuc: '2026-10-29',
    trangThai: 'Còn hạn',
    soVeHocBu: 2,
    hoTenPhuHuynh: 'Lê Hoàng Nam',
    lopChinhKhoa: '3A2',
    ngaySinh: '2018-09-20',
    gioiTinh: 'Nữ',
    soBuoiHoc: 16,
    coSo: 'Cơ sở Phú Mỹ Hưng - Royal South',
    danhSachMonHoc: ['Robotics & AI Thiếu nhi'],
    dangKyXeBus: true,
    tuyenBus: 'Tuyến Nhà Bè - Nam Sài Gòn (Xe Royal 03 - 18h30)',
  },
  {
    id: 'HV003',
    name: 'Trần Bảo Nam',
    sdtPhuHuynh: '0903112233',
    ngayBatDau: '2026-09-05',
    ngayKetThuc: '2026-10-25',
    trangThai: 'Còn hạn',
    soVeHocBu: 0,
    hoTenPhuHuynh: 'Trần Đình Trọng',
    lopChinhKhoa: '5A1',
    ngaySinh: '2016-11-04',
    gioiTinh: 'Nam',
    soBuoiHoc: 16,
    coSo: 'Cơ sở Phú Mỹ Hưng - Royal South',
    danhSachMonHoc: ['Bơi lội Sinh tồn & Bơi Bướm'],
  },
  {
    id: 'HV004',
    name: 'Phạm Hoàng Yến Nhi',
    sdtPhuHuynh: '0934556677',
    ngayBatDau: '2026-09-12',
    ngayKetThuc: '2026-11-28',
    trangThai: 'Còn hạn',
    soVeHocBu: 0,
    hoTenPhuHuynh: 'Hoàng Thu Hằng',
    lopChinhKhoa: '2A3',
    ngaySinh: '2019-02-14',
    gioiTinh: 'Nữ',
    soBuoiHoc: 12,
    coSo: 'Cơ sở Nam Sài Gòn - Royal Riverside',
    danhSachMonHoc: ['Vẽ sáng tạo & Mỹ thuật số'],
  },
  {
    id: 'HV005',
    name: 'Đặng Gia Huy',
    sdtPhuHuynh: '0978990011',
    ngayBatDau: '2026-09-11',
    ngayKetThuc: '2026-11-06',
    trangThai: 'Còn hạn',
    soVeHocBu: 1,
    hoTenPhuHuynh: 'Đặng Quốc Dũng',
    lopChinhKhoa: '4A3',
    ngaySinh: '2017-08-30',
    gioiTinh: 'Nam',
    soBuoiHoc: 16,
    coSo: 'Cơ sở Nam Sài Gòn - Royal Riverside',
    danhSachMonHoc: ['Piano Căn bản & Thính giác'],
    dangKyXeBus: true,
    tuyenBus: 'Tuyến Bình Chánh - KDC Nam Long (Xe Royal 04 - 18h15)',
  },
  {
    id: 'HV006',
    name: 'Huỳnh Ngọc Ánh Dương',
    sdtPhuHuynh: '0918223344',
    ngayBatDau: '2026-09-11',
    ngayKetThuc: '2026-11-06',
    trangThai: 'Còn hạn',
    soVeHocBu: 0,
    hoTenPhuHuynh: 'Huỳnh Thái Sơn',
    lopChinhKhoa: '3A1',
    ngaySinh: '2018-12-05',
    gioiTinh: 'Nữ',
    soBuoiHoc: 16,
    coSo: 'Cơ sở Nam Sài Gòn - Royal Riverside',
    danhSachMonHoc: ['Piano Căn bản & Thính giác'],
  },
  {
    id: 'HV007',
    name: 'Vũ Đức Duy Anh',
    sdtPhuHuynh: '0908334455',
    ngayBatDau: '2026-09-08',
    ngayKetThuc: '2026-12-01',
    trangThai: 'Còn hạn',
    soVeHocBu: 0,
    hoTenPhuHuynh: 'Vũ Đức Thành',
    lopChinhKhoa: '5A2',
    ngaySinh: '2016-04-18',
    gioiTinh: 'Nam',
    soBuoiHoc: 24,
    coSo: 'Cơ sở TP. Thủ Đức - Royal East',
    danhSachMonHoc: ['Võ thuật Taekwondo & Karatedo'],
    dangKyXeBus: true,
    tuyenBus: 'Tuyến TP. Thủ Đức - Linh Chiểu (Xe Royal 02 - 18h45)',
  },
  {
    id: 'HV008',
    name: 'Ngô Thanh Trúc',
    sdtPhuHuynh: '0945667788',
    ngayBatDau: '2026-09-08',
    ngayKetThuc: '2026-12-01',
    trangThai: 'Còn hạn',
    soVeHocBu: 1,
    hoTenPhuHuynh: 'Ngô Văn Toàn',
    lopChinhKhoa: '2A1',
    ngaySinh: '2019-07-22',
    gioiTinh: 'Nữ',
    soBuoiHoc: 24,
    coSo: 'Cơ sở TP. Thủ Đức - Royal East',
    danhSachMonHoc: ['Võ thuật Taekwondo & Karatedo'],
  },
  {
    id: 'HV009',
    name: 'Bùi Minh Đăng',
    sdtPhuHuynh: '0967889900',
    ngayBatDau: '2026-09-13',
    ngayKetThuc: '2026-12-27',
    trangThai: 'Còn hạn',
    soVeHocBu: 0,
    hoTenPhuHuynh: 'Bùi Xuân Hùng',
    lopChinhKhoa: '4A2',
    ngaySinh: '2017-03-10',
    gioiTinh: 'Nam',
    soBuoiHoc: 16,
    coSo: 'Cơ sở Bình Tân - Royal West',
    danhSachMonHoc: ['Cờ vua Tư duy Chiến thuật'],
  },
  {
    id: 'HV010',
    name: 'Trịnh Thùy Anh',
    sdtPhuHuynh: '0982113355',
    ngayBatDau: '2026-09-13',
    ngayKetThuc: '2026-12-27',
    trangThai: 'Còn hạn',
    soVeHocBu: 0,
    hoTenPhuHuynh: 'Trịnh Kim Ngân',
    lopChinhKhoa: '3A4',
    ngaySinh: '2018-10-15',
    gioiTinh: 'Nữ',
    soBuoiHoc: 16,
    coSo: 'Cơ sở Bình Tân - Royal West',
    danhSachMonHoc: ['Cờ vua Tư duy Chiến thuật'],
  },
  {
    id: 'HV011',
    name: 'Hoàng Tuấn Kiệt',
    sdtPhuHuynh: '0902445566',
    ngayBatDau: '2026-09-09',
    ngayKetThuc: '2026-10-30',
    trangThai: 'Còn hạn',
    soVeHocBu: 0,
    hoTenPhuHuynh: 'Hoàng Việt Dũng',
    lopChinhKhoa: '4A1',
    ngaySinh: '2017-01-25',
    gioiTinh: 'Nam',
    soBuoiHoc: 16,
    coSo: 'Cơ sở Phú Mỹ Hưng - Royal South',
    danhSachMonHoc: ['Tiếng Anh Kịch nghệ (Drama Club)'],
  },
  {
    id: 'HV012',
    name: 'Đỗ Bảo Trâm',
    sdtPhuHuynh: '0913778899',
    ngayBatDau: '2026-09-09',
    ngayKetThuc: '2026-10-30',
    trangThai: 'Còn hạn',
    soVeHocBu: 1,
    hoTenPhuHuynh: 'Đỗ Đăng Khoa',
    lopChinhKhoa: '2A2',
    ngaySinh: '2019-06-08',
    gioiTinh: 'Nữ',
    soBuoiHoc: 16,
    coSo: 'Cơ sở Phú Mỹ Hưng - Royal South',
    danhSachMonHoc: ['Tiếng Anh Kịch nghệ (Drama Club)'],
  },
  {
    id: 'HV013',
    name: 'Phan Khánh An',
    sdtPhuHuynh: '0938123789',
    ngayBatDau: '2026-09-07',
    ngayKetThuc: '2026-10-28',
    trangThai: 'Còn hạn',
    soVeHocBu: 0,
    hoTenPhuHuynh: 'Phan Văn Thanh',
    lopChinhKhoa: '3A3',
    ngaySinh: '2018-03-31',
    gioiTinh: 'Nữ',
    soBuoiHoc: 16,
    coSo: 'Cơ sở Phú Mỹ Hưng - Royal South',
    danhSachMonHoc: ['Bóng rổ Junior & Pro'],
  },
  {
    id: 'HV014',
    name: 'Lý Vĩnh Khang',
    sdtPhuHuynh: '0979556778',
    ngayBatDau: '2026-09-08',
    ngayKetThuc: '2026-10-29',
    trangThai: 'Còn hạn',
    soVeHocBu: 0,
    hoTenPhuHuynh: 'Lý Triệu Phát',
    lopChinhKhoa: '5A3',
    ngaySinh: '2016-09-17',
    gioiTinh: 'Nam',
    soBuoiHoc: 16,
    coSo: 'Cơ sở Phú Mỹ Hưng - Royal South',
    danhSachMonHoc: ['Robotics & AI Thiếu nhi'],
  },
  {
    id: 'HV015',
    name: 'Dương Cát Tường',
    sdtPhuHuynh: '0949332211',
    ngayBatDau: '2026-09-12',
    ngayKetThuc: '2026-11-28',
    trangThai: 'Còn hạn',
    soVeHocBu: 0,
    hoTenPhuHuynh: 'Dương Văn Phúc',
    lopChinhKhoa: '2A4',
    ngaySinh: '2019-11-20',
    gioiTinh: 'Nữ',
    soBuoiHoc: 12,
    coSo: 'Cơ sở Nam Sài Gòn - Royal Riverside',
    danhSachMonHoc: ['Vẽ sáng tạo & Mỹ thuật số'],
  },
  {
    id: 'HV016',
    name: 'Tạ Quang Hải',
    sdtPhuHuynh: '0983667711',
    ngayBatDau: '2026-09-08',
    ngayKetThuc: '2026-12-01',
    trangThai: 'Còn hạn',
    soVeHocBu: 2,
    hoTenPhuHuynh: 'Tạ Quang Dũng',
    lopChinhKhoa: '4A4',
    ngaySinh: '2017-12-12',
    gioiTinh: 'Nam',
    soBuoiHoc: 24,
    coSo: 'Cơ sở TP. Thủ Đức - Royal East',
    danhSachMonHoc: ['Võ thuật Taekwondo & Karatedo'],
  },
  {
    id: 'HV017',
    name: 'Lương Thảo My',
    sdtPhuHuynh: '0909554433',
    ngayBatDau: '2026-09-11',
    ngayKetThuc: '2026-11-06',
    trangThai: 'Còn hạn',
    soVeHocBu: 0,
    hoTenPhuHuynh: 'Lương Thị Vân',
    lopChinhKhoa: '3A1',
    ngaySinh: '2018-04-05',
    gioiTinh: 'Nữ',
    soBuoiHoc: 16,
    coSo: 'Cơ sở Nam Sài Gòn - Royal Riverside',
    danhSachMonHoc: ['Piano Căn bản & Thính giác'],
  },
  {
    id: 'HV018',
    name: 'Chu Đình Bách',
    sdtPhuHuynh: '0933778822',
    ngayBatDau: '2026-09-13',
    ngayKetThuc: '2026-12-27',
    trangThai: 'Còn hạn',
    soVeHocBu: 0,
    hoTenPhuHuynh: 'Chu Đình Khang',
    lopChinhKhoa: '5A1',
    ngaySinh: '2016-07-28',
    gioiTinh: 'Nam',
    soBuoiHoc: 16,
    coSo: 'Cơ sở Bình Tân - Royal West',
    danhSachMonHoc: ['Cờ vua Tư duy Chiến thuật'],
  },
  {
    id: 'HV019',
    name: 'Mai Uyên Thư',
    sdtPhuHuynh: '0914889933',
    ngayBatDau: '2026-09-05',
    ngayKetThuc: '2026-10-25',
    trangThai: 'Còn hạn',
    soVeHocBu: 1,
    hoTenPhuHuynh: 'Mai Thế Hùng',
    lopChinhKhoa: '2A1',
    ngaySinh: '2019-09-09',
    gioiTinh: 'Nữ',
    soBuoiHoc: 16,
    coSo: 'Cơ sở Phú Mỹ Hưng - Royal South',
    danhSachMonHoc: ['Bơi lội Sinh tồn & Bơi Bướm'],
  },
  {
    id: 'HV020',
    name: 'Võ Gia Phúc',
    sdtPhuHuynh: '0971223388',
    ngayBatDau: '2026-09-07',
    ngayKetThuc: '2026-10-28',
    trangThai: 'Còn hạn',
    soVeHocBu: 0,
    hoTenPhuHuynh: 'Võ Quốc Thịnh',
    lopChinhKhoa: '4A2',
    ngaySinh: '2017-10-02',
    gioiTinh: 'Nam',
    soBuoiHoc: 16,
    coSo: 'Cơ sở Phú Mỹ Hưng - Royal South',
    danhSachMonHoc: ['Bóng rổ Junior & Pro'],
  },
  {
    id: 'HV021',
    name: 'Lâm Thảo Vy',
    sdtPhuHuynh: '0988991122',
    ngayBatDau: '2026-10-01',
    ngayKetThuc: '2026-12-01',
    trangThai: 'Chờ lớp',
    soVeHocBu: 0,
    hoTenPhuHuynh: 'Lâm Thành Long',
    lopChinhKhoa: '3A2',
    ngaySinh: '2018-08-14',
    gioiTinh: 'Nữ',
    soBuoiHoc: 16,
    coSo: 'Cơ sở Phú Mỹ Hưng - Royal South',
    choXepLop: true,
    danhSachMonHoc: ['Nhảy Hiện đại & K-Pop Dance Kids'],
  },
  {
    id: 'HV022',
    name: 'Đoàn Minh Nhật',
    sdtPhuHuynh: '0907665544',
    ngayBatDau: '2026-10-05',
    ngayKetThuc: '2026-12-05',
    trangThai: 'Chờ lớp',
    soVeHocBu: 0,
    hoTenPhuHuynh: 'Đoàn Tuấn Anh',
    lopChinhKhoa: '4A3',
    ngaySinh: '2017-06-21',
    gioiTinh: 'Nam',
    soBuoiHoc: 16,
    coSo: 'Cơ sở Nam Sài Gòn - Royal Riverside',
    choXepLop: true,
    danhSachMonHoc: ['Robotics & AI Thiếu nhi'],
  },
  {
    id: 'HV023',
    name: 'Trương Gia Linh',
    sdtPhuHuynh: '0932119988',
    ngayBatDau: '2026-09-08',
    ngayKetThuc: '2026-12-01',
    trangThai: 'Còn hạn',
    soVeHocBu: 0,
    hoTenPhuHuynh: 'Trương Văn Hòa',
    lopChinhKhoa: '2A3',
    ngaySinh: '2019-01-19',
    gioiTinh: 'Nữ',
    soBuoiHoc: 24,
    coSo: 'Cơ sở TP. Thủ Đức - Royal East',
    danhSachMonHoc: ['Võ thuật Taekwondo & Karatedo'],
  },
  {
    id: 'HV024',
    name: 'Hà Quốc Thái',
    sdtPhuHuynh: '0947554466',
    ngayBatDau: '2026-09-07',
    ngayKetThuc: '2026-10-28',
    trangThai: 'Còn hạn',
    soVeHocBu: 0,
    hoTenPhuHuynh: 'Hà Văn Cường',
    lopChinhKhoa: '5A2',
    ngaySinh: '2016-10-30',
    gioiTinh: 'Nam',
    soBuoiHoc: 16,
    coSo: 'Cơ sở Phú Mỹ Hưng - Royal South',
    danhSachMonHoc: ['Bóng rổ Junior & Pro'],
  },
  {
    id: 'HV025',
    name: 'Tô Phương Linh',
    sdtPhuHuynh: '0919443322',
    ngayBatDau: '2026-06-01',
    ngayKetThuc: '2026-08-30',
    trangThai: 'Hết hạn',
    soVeHocBu: 0,
    hoTenPhuHuynh: 'Tô Vĩnh An',
    lopChinhKhoa: '3A3',
    ngaySinh: '2018-02-27',
    gioiTinh: 'Nữ',
    soBuoiHoc: 16,
    coSo: 'Cơ sở Bình Tân - Royal West',
    danhSachMonHoc: ['Cờ vua Tư duy Chiến thuật'],
  },
];

export const INITIAL_LOP_HOC: LopHoc[] = [
  {
    id: 'LH001',
    tenMon: 'Bóng rổ (Basketball)',
    tenLop: 'Bóng rổ U10 Chiều T2-T4',
    coSo: 'Cơ sở Phú Mỹ Hưng - Royal South',
    phongHoc: 'Sân bóng rổ Royal A (Ngoài trời)',
    siSoToiDa: 15,
    lichHocCoDinh: 'Thứ 2, Thứ 4 lúc 17:30',
    days: ['T2', 'T4'],
    time: '17:30',
    trangThai: 'Đang hoạt động',
    soBuoiHoc: 16,
    ngayBatDau: '2026-09-07',
    ngayKetThuc: '2026-10-28',
    hocPhiTronKhoa: 4000000,
    donGiaBuoi: 250000,
    facilityId: 'FAC01',
    teacherName: 'Trần Tuấn Anh',
  },
  {
    id: 'LH002',
    tenMon: 'Robotics Foundation',
    tenLop: 'Robotics SPIKE Foundation T3-T5',
    coSo: 'Cơ sở Phú Mỹ Hưng - Royal South',
    phongHoc: 'Phòng Lab STEM 01',
    siSoToiDa: 12,
    lichHocCoDinh: 'Thứ 3, Thứ 5 lúc 17:00',
    days: ['T3', 'T5'],
    time: '17:00',
    trangThai: 'Đang hoạt động',
    soBuoiHoc: 8,
    ngayBatDau: '2026-09-08',
    ngayKetThuc: '2026-10-29',
    hocPhiTronKhoa: 2400000,
    donGiaBuoi: 300000,
    facilityId: 'FAC04',
    teacherName: 'Đặng Hoàng Nam',
  },
  {
    id: 'LH003',
    tenMon: 'Bơi lội (Khối 1 & 2)',
    tenLop: 'Bơi lội Cơ bản Sáng T7-CN',
    coSo: 'Cơ sở Phú Mỹ Hưng - Royal South',
    phongHoc: 'Hồ bơi 4 mùa Aquatics',
    siSoToiDa: 10,
    lichHocCoDinh: 'Thứ 7, Chủ Nhật lúc 08:30',
    days: ['T7', 'CN'],
    time: '08:30',
    trangThai: 'Đang hoạt động',
    soBuoiHoc: 16,
    ngayBatDau: '2026-09-05',
    ngayKetThuc: '2026-10-25',
    hocPhiTronKhoa: 3200000,
    donGiaBuoi: 200000,
    facilityId: 'FAC03',
    teacherName: 'Phạm Quốc Bảo',
  },
  {
    id: 'LH004',
    tenMon: 'Vẽ tư duy sáng tạo (Creative Mind Map Drawing)',
    tenLop: 'Vẽ Sáng Tạo Trẻ Em Chiều T7',
    coSo: 'Cơ sở Nam Sài Gòn - Royal Riverside',
    phongHoc: 'Xưởng Vẽ Art Studio 2',
    siSoToiDa: 14,
    lichHocCoDinh: 'Thứ 7 lúc 14:30',
    days: ['T7'],
    time: '14:30',
    trangThai: 'Đang hoạt động',
    soBuoiHoc: 16,
    ngayBatDau: '2026-09-12',
    ngayKetThuc: '2026-11-28',
    hocPhiTronKhoa: 3680000,
    donGiaBuoi: 230000,
    facilityId: 'FAC04',
    teacherName: 'Nguyễn Mai Phương',
  },
  {
    id: 'LH005',
    tenMon: 'Piano group (Group Piano)',
    tenLop: 'Piano Group Khóa T2-T6',
    coSo: 'Cơ sở Nam Sài Gòn - Royal Riverside',
    phongHoc: 'Phòng Âm nhạc Piano 1',
    siSoToiDa: 8,
    lichHocCoDinh: 'Thứ 2, Thứ 6 lúc 17:15',
    days: ['T2', 'T6'],
    time: '17:15',
    trangThai: 'Đang hoạt động',
    soBuoiHoc: 16,
    ngayBatDau: '2026-09-11',
    ngayKetThuc: '2026-11-06',
    hocPhiTronKhoa: 4000000,
    donGiaBuoi: 250000,
    facilityId: 'FAC04',
    teacherName: 'Lê Thị Mỹ Linh',
  },
  {
    id: 'LH006',
    tenMon: 'Karate',
    tenLop: 'Karate Thiếu nhi T3-T5',
    coSo: 'Cơ sở TP. Thủ Đức - Royal East',
    phongHoc: 'Nhà thi đấu Đa năng Gym',
    siSoToiDa: 20,
    lichHocCoDinh: 'Thứ 3, Thứ 5 lúc 17:30',
    days: ['T3', 'T5'],
    time: '17:30',
    trangThai: 'Đang hoạt động',
    soBuoiHoc: 16,
    ngayBatDau: '2026-09-08',
    ngayKetThuc: '2026-12-01',
    hocPhiTronKhoa: 2400000,
    donGiaBuoi: 150000,
    facilityId: 'FAC06',
    teacherName: 'Vũ Đức Thắng',
  },
  {
    id: 'LH007',
    tenMon: 'Cờ vua cơ bản (Basic Chess)',
    tenLop: 'Cờ vua Cơ bản & Thi đấu Sáng CN',
    coSo: 'Cơ sở Bình Tân - Royal West',
    phongHoc: 'Phòng Hoạt động Trí tuệ 302',
    siSoToiDa: 16,
    lichHocCoDinh: 'Chủ Nhật lúc 09:00',
    days: ['CN'],
    time: '09:00',
    trangThai: 'Đang hoạt động',
    soBuoiHoc: 16,
    ngayBatDau: '2026-09-13',
    ngayKetThuc: '2026-12-27',
    hocPhiTronKhoa: 2800000,
    donGiaBuoi: 175000,
    facilityId: 'FAC04',
    teacherName: 'Bùi Minh Trí',
  },
  {
    id: 'LH008',
    tenMon: 'Pickleball',
    tenLop: 'Pickleball Khởi Động T4-T6',
    coSo: 'Cơ sở Phú Mỹ Hưng - Royal South',
    phongHoc: 'Sân Pickleball Royal Court',
    siSoToiDa: 12,
    lichHocCoDinh: 'Thứ 4, Thứ 6 lúc 17:30',
    days: ['T4', 'T6'],
    time: '17:30',
    trangThai: 'Đang hoạt động',
    soBuoiHoc: 16,
    ngayBatDau: '2026-09-09',
    ngayKetThuc: '2026-10-30',
    hocPhiTronKhoa: 3200000,
    donGiaBuoi: 200000,
    facilityId: 'FAC05',
    teacherName: 'Trần Tuấn Anh',
  },
];

export const INITIAL_DANH_SACH_LOP: DanhSachLop[] = [
  // LH001 - Bóng rổ
  { id: 'DSL001', idLop: 'LH001', idHocVien: 'HV001', loaiHocVien: 'Chính thức' },
  { id: 'DSL002', idLop: 'LH001', idHocVien: 'HV013', loaiHocVien: 'Chính thức' },
  { id: 'DSL003', idLop: 'LH001', idHocVien: 'HV020', loaiHocVien: 'Chính thức' },
  { id: 'DSL004', idLop: 'LH001', idHocVien: 'HV024', loaiHocVien: 'Chính thức' },
  { id: 'DSL005', idLop: 'LH001', idHocVien: 'HV003', loaiHocVien: 'Học bù' },

  // LH002 - Robotics
  { id: 'DSL006', idLop: 'LH002', idHocVien: 'HV002', loaiHocVien: 'Chính thức' },
  { id: 'DSL007', idLop: 'LH002', idHocVien: 'HV014', loaiHocVien: 'Chính thức' },

  // LH003 - Bơi lội
  { id: 'DSL008', idLop: 'LH003', idHocVien: 'HV003', loaiHocVien: 'Chính thức' },
  { id: 'DSL009', idLop: 'LH003', idHocVien: 'HV019', loaiHocVien: 'Chính thức' },

  // LH004 - Mỹ thuật
  { id: 'DSL010', idLop: 'LH004', idHocVien: 'HV004', loaiHocVien: 'Chính thức' },
  { id: 'DSL011', idLop: 'LH004', idHocVien: 'HV015', loaiHocVien: 'Chính thức' },

  // LH005 - Piano
  { id: 'DSL012', idLop: 'LH005', idHocVien: 'HV005', loaiHocVien: 'Chính thức' },
  { id: 'DSL013', idLop: 'LH005', idHocVien: 'HV006', loaiHocVien: 'Chính thức' },
  { id: 'DSL014', idLop: 'LH005', idHocVien: 'HV017', loaiHocVien: 'Chính thức' },

  // LH006 - Taekwondo
  { id: 'DSL015', idLop: 'LH006', idHocVien: 'HV007', loaiHocVien: 'Chính thức' },
  { id: 'DSL016', idLop: 'LH006', idHocVien: 'HV008', loaiHocVien: 'Chính thức' },
  { id: 'DSL017', idLop: 'LH006', idHocVien: 'HV016', loaiHocVien: 'Chính thức' },
  { id: 'DSL018', idLop: 'LH006', idHocVien: 'HV023', loaiHocVien: 'Chính thức' },

  // LH007 - Cờ vua
  { id: 'DSL019', idLop: 'LH007', idHocVien: 'HV009', loaiHocVien: 'Chính thức' },
  { id: 'DSL020', idLop: 'LH007', idHocVien: 'HV010', loaiHocVien: 'Chính thức' },
  { id: 'DSL021', idLop: 'LH007', idHocVien: 'HV018', loaiHocVien: 'Chính thức' },

  // LH008 - Drama Club
  { id: 'DSL022', idLop: 'LH008', idHocVien: 'HV011', loaiHocVien: 'Chính thức' },
  { id: 'DSL023', idLop: 'LH008', idHocVien: 'HV012', loaiHocVien: 'Chính thức' },
];

export const INITIAL_DIEM_DANH: DiemDanh[] = [
  // Buổi 1 - LH001 (2026-09-07)
  {
    id: 'DD001',
    idLop: 'LH001',
    ngayHoc: '2026-09-07',
    idHocVien: 'HV001',
    trangThai: 'Có mặt',
    nhanXetRieng: 'Bé Khôi tập luyện rất hăng hái, ném rổ chính xác và bắt bóng tốt.',
    hinhAnh: ['https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&auto=format&fit=crop&q=60'],
  },
  {
    id: 'DD002',
    idLop: 'LH001',
    ngayHoc: '2026-09-07',
    idHocVien: 'HV013',
    trangThai: 'Có mặt',
    nhanXetRieng: 'Khánh An rê bóng linh hoạt, tích cực phối hợp cùng bạn.',
    hinhAnh: [],
  },
  {
    id: 'DD003',
    idLop: 'LH001',
    ngayHoc: '2026-09-07',
    idHocVien: 'HV020',
    trangThai: 'Có mặt',
    nhanXetRieng: 'Gia Phúc có thể lực dồi dào, chạy chỗ tốt.',
    hinhAnh: [],
  },
  {
    id: 'DD004',
    idLop: 'LH001',
    ngayHoc: '2026-09-07',
    idHocVien: 'HV024',
    trangThai: 'Có mặt',
    nhanXetRieng: 'Quốc Thái phát bóng cự ly gần chính xác.',
    hinhAnh: [],
  },
  // Buổi 2 - LH001 (2026-09-09)
  {
    id: 'DD005',
    idLop: 'LH001',
    ngayHoc: '2026-09-09',
    idHocVien: 'HV001',
    trangThai: 'Có mặt',
    nhanXetRieng: 'Thực hiện động tác lay-up mượt mà.',
    hinhAnh: [],
  },
  {
    id: 'DD006',
    idLop: 'LH001',
    ngayHoc: '2026-09-09',
    idHocVien: 'HV013',
    trangThai: 'Vắng có phép',
    nhanXetRieng: 'Phụ huynh báo bé bị sốt siêu vi, đã cấp 1 vé học bù.',
    hinhAnh: [],
  },
  {
    id: 'DD007',
    idLop: 'LH001',
    ngayHoc: '2026-09-09',
    idHocVien: 'HV020',
    trangThai: 'Có mặt',
    nhanXetRieng: 'Chuyền bóng 2 tay trước ngực chuẩn xác.',
    hinhAnh: [],
  },
  {
    id: 'DD008',
    idLop: 'LH001',
    ngayHoc: '2026-09-09',
    idHocVien: 'HV024',
    trangThai: 'Có mặt',
    nhanXetRieng: 'Tiếp thu kỹ thuật phòng thủ 1-1 nhanh.',
    hinhAnh: [],
  },
  // Buổi 1 - LH002 Robotics (2026-09-08)
  {
    id: 'DD009',
    idLop: 'LH002',
    ngayHoc: '2026-09-08',
    idHocVien: 'HV002',
    trangThai: 'Có mặt',
    nhanXetRieng: 'Bé Quỳnh Chi lắp ráp bộ truyền động bánh răng rất khéo léo.',
    hinhAnh: ['https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&auto=format&fit=crop&q=60'],
  },
  {
    id: 'DD010',
    idLop: 'LH002',
    ngayHoc: '2026-09-08',
    idHocVien: 'HV014',
    trangThai: 'Có mặt',
    nhanXetRieng: 'Vĩnh Khang hiểu thuật toán lặp và cảm biến khoảng cách siêu âm.',
    hinhAnh: [],
  },
  // Buổi 1 - LH003 Bơi lội (2026-09-05)
  {
    id: 'DD011',
    idLop: 'LH003',
    ngayHoc: '2026-09-05',
    idHocVien: 'HV003',
    trangThai: 'Có mặt',
    nhanXetRieng: 'Bảo Nam bơi sải 25m không nghỉ, nhịp thở đúng kỹ thuật.',
    hinhAnh: [],
  },
  {
    id: 'DD012',
    idLop: 'LH003',
    ngayHoc: '2026-09-05',
    idHocVien: 'HV019',
    trangThai: 'Có mặt',
    nhanXetRieng: 'Uyên Thư tự tin thở nước, đã làm quen tốt với độ sâu.',
    hinhAnh: [],
  },
  // Buổi 1 - LH005 Piano (2026-09-11)
  {
    id: 'DD013',
    idLop: 'LH005',
    ngayHoc: '2026-09-11',
    idHocVien: 'HV005',
    trangThai: 'Có mặt',
    nhanXetRieng: 'Gia Huy giữ cổ tay cong tròn đúng chuẩn, đọc nốt khóa Sol tự tin.',
    hinhAnh: [],
  },
  {
    id: 'DD014',
    idLop: 'LH005',
    ngayHoc: '2026-09-11',
    idHocVien: 'HV006',
    trangThai: 'Có mặt',
    nhanXetRieng: 'Ánh Dương có khả năng cảm thụ nhịp phách rất nhạy.',
    hinhAnh: [],
  },
  {
    id: 'DD015',
    idLop: 'LH005',
    ngayHoc: '2026-09-11',
    idHocVien: 'HV017',
    trangThai: 'Có mặt',
    nhanXetRieng: 'Thảo My chơi bài nốt tròn và nốt trắng rất đều tay.',
    hinhAnh: [],
  },
  // Buổi 1 - LH008 Drama (2026-09-09)
  {
    id: 'DD016',
    idLop: 'LH008',
    ngayHoc: '2026-09-09',
    idHocVien: 'HV011',
    trangThai: 'Có mặt',
    nhanXetRieng: 'Tuấn Kiệt phát âm tiếng Anh to, rõ và diễn xuất đầy năng lượng.',
    hinhAnh: [],
  },
  {
    id: 'DD017',
    idLop: 'LH008',
    ngayHoc: '2026-09-09',
    idHocVien: 'HV012',
    trangThai: 'Có mặt',
    nhanXetRieng: 'Bảo Trâm thể hiện cảm xúc nhân vật dễ thương, thuộc thoại nhanh.',
    hinhAnh: [],
  },
];

export function formatToVNDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  if (dateStr.includes('/')) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function calculateEndDate(startDateStr: string, classDays: string[], soBuoiHoc: number): string {
  if (!startDateStr) return '';
  if (!classDays || classDays.length === 0 || !soBuoiHoc) {
    const d = new Date(startDateStr);
    d.setMonth(d.getMonth() + 3);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  }
  
  const dayMap: Record<string, number> = {
    'T2': 1, 'T3': 2, 'T4': 3, 'T5': 4, 'T6': 5, 'T7': 6, 'CN': 0
  };
  const targetDays = classDays.map(day => dayMap[day]).filter(val => val !== undefined);
  
  if (targetDays.length === 0) {
    const d = new Date(startDateStr);
    d.setMonth(d.getMonth() + 3);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  }
  
  let currentDate = new Date(startDateStr);
  if (isNaN(currentDate.getTime())) return '';
  let sessionsCount = 0;
  let safetyLoop = 0;
  
  while (sessionsCount < soBuoiHoc && safetyLoop < 1000) {
    safetyLoop++;
    const dayOfWeek = currentDate.getDay();
    if (targetDays.includes(dayOfWeek)) {
      sessionsCount++;
      if (sessionsCount === soBuoiHoc) {
        break;
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return currentDate.toISOString().split('T')[0];
}

export function calculateSessionsBetween(
  studentStartDateStr: string,
  classStartDateStr?: string,
  classEndDateStr?: string,
  classDays?: string[],
  fallbackTotalSessions?: number
): number {
  if (!studentStartDateStr) return fallbackTotalSessions || 16;

  let effectiveClassEndDate = classEndDateStr;
  if (!effectiveClassEndDate && classStartDateStr && classDays && classDays.length > 0 && fallbackTotalSessions) {
    effectiveClassEndDate = calculateEndDate(classStartDateStr, classDays, fallbackTotalSessions);
  }

  if (!effectiveClassEndDate || !classDays || classDays.length === 0) {
    return fallbackTotalSessions || 16;
  }

  const studentStart = new Date(studentStartDateStr);
  const classEnd = new Date(effectiveClassEndDate);

  if (isNaN(studentStart.getTime()) || isNaN(classEnd.getTime())) {
    return fallbackTotalSessions || 16;
  }

  let start = studentStart;
  if (classStartDateStr) {
    const classStart = new Date(classStartDateStr);
    if (!isNaN(classStart.getTime()) && start < classStart) {
      start = classStart;
    }
  }

  if (start > classEnd) {
    return 0;
  }

  const dayMap: Record<string, number> = {
    'T2': 1, 'T3': 2, 'T4': 3, 'T5': 4, 'T6': 5, 'T7': 6, 'CN': 0
  };
  const targetDays = classDays.map((d) => dayMap[d]).filter((val) => val !== undefined);
  if (targetDays.length === 0) {
    return fallbackTotalSessions || 16;
  }

  let count = 0;
  let curr = new Date(start);
  let safetyLoop = 0;

  while (curr <= classEnd && safetyLoop < 1000) {
    safetyLoop++;
    if (targetDays.includes(curr.getDay())) {
      count++;
    }
    curr.setDate(curr.getDate() + 1);
  }

  return count;
}

export interface GiaoVien {
  id: string;
  name: string;
  sdt: string;
  email: string;
  monDay: string;
  trangThai: 'Đang dạy' | 'Nghỉ phép' | 'Đã nghỉ';
}

export const INITIAL_GIAO_VIEN: GiaoVien[] = [
  {
    id: 'GV001',
    name: 'Thầy Trần Tuấn Anh',
    sdt: '0988123456',
    email: 'tuananh.tran@royal.edu.vn',
    monDay: 'Bóng rổ Junior & Pro',
    trangThai: 'Đang dạy',
  },
  {
    id: 'GV002',
    name: 'Cô Nguyễn Mai Phương',
    sdt: '0977234567',
    email: 'maiphuong.nguyen@royal.edu.vn',
    monDay: 'Vẽ sáng tạo & Mỹ thuật số',
    trangThai: 'Đang dạy',
  },
  {
    id: 'GV003',
    name: 'Thầy Đặng Hoàng Nam',
    sdt: '0912345678',
    email: 'hoangnam.dang@royal.edu.vn',
    monDay: 'Robotics & AI Thiếu nhi',
    trangThai: 'Đang dạy',
  },
  {
    id: 'GV004',
    name: 'Cô Lê Thị Mỹ Linh',
    sdt: '0903456789',
    email: 'mylinh.le@royal.edu.vn',
    monDay: 'Piano Căn bản & Thính giác',
    trangThai: 'Đang dạy',
  },
  {
    id: 'GV005',
    name: 'Thầy Phạm Quốc Bảo',
    sdt: '0938567890',
    email: 'quocbao.pham@royal.edu.vn',
    monDay: 'Bơi lội Sinh tồn & Bơi Bướm',
    trangThai: 'Đang dạy',
  },
  {
    id: 'GV006',
    name: 'Thầy Vũ Đức Thắng',
    sdt: '0945678901',
    email: 'ducthang.vu@royal.edu.vn',
    monDay: 'Võ thuật Taekwondo & Karatedo',
    trangThai: 'Đang dạy',
  },
  {
    id: 'GV007',
    name: 'Thầy Bùi Minh Trí',
    sdt: '0968789012',
    email: 'minhtri.bui@royal.edu.vn',
    monDay: 'Cờ vua Tư duy Chiến thuật',
    trangThai: 'Đang dạy',
  },
  {
    id: 'GV008',
    name: 'Cô Jessica Taylor',
    sdt: '0909890123',
    email: 'jessica.taylor@royal.edu.vn',
    monDay: 'Tiếng Anh Kịch nghệ (Drama Club)',
    trangThai: 'Đang dạy',
  },
];

export function capitalizeWords(str: string): string {
  if (!str) return '';
  return str.replace(/(^|[\s\-])\S/g, (char) => char.toUpperCase());
}

export type TransferType = 'course_progression' | 'subject_or_shift_change' | 'course_exit';
export type DifferenceStatus = 'settled' | 'student_must_pay' | 'retained_credit';

export interface ClassTransferRecord {
  id: string;
  studentId: string;
  studentName: string;
  transferType: TransferType;
  fromClassId: string;
  fromClassName: string;
  toClassId: string | null;
  toClassName: string;
  transferDate: string; // YYYY-MM-DD
  attendedSessionsOldClass: number;
  remainingSessionsOldClass: number;
  remainingCreditOldClass: number;
  newClassRemainingSessions: number;
  requiredFeeNewClass: number;
  feeDifference: number; // requiredFeeNewClass - remainingCreditOldClass
  differenceStatus: DifferenceStatus;
  batchId?: string;
  transferMode?: 'single' | 'bulk';
  creditApplied?: number;
  surchargeAmount?: number;
  reason?: string;
  createdBy?: string;
  createdAt: string;
}

export interface FacilityItem {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  category: 'indoor' | 'outdoor' | 'pool' | 'lab';
}

export const INITIAL_FACILITIES: FacilityItem[] = [
  { id: 'FAC01', name: 'Sân bóng rổ Royal A (Ngoài trời)', location: 'Tòa nhà A - Sân thể thao ngoài trời', isActive: true, category: 'outdoor' },
  { id: 'FAC02', name: 'Sân bóng đá cỏ nhân tạo FIFA', location: 'Khu thể thao phức hợp Royal', isActive: true, category: 'outdoor' },
  { id: 'FAC03', name: 'Hồ bơi 4 mùa Aquatics', location: 'Tầng 1 - Khu thể thao Dưới nước', isActive: true, category: 'pool' },
  { id: 'FAC04', name: 'Phòng Lab STEM 01 & Mỹ thuật', location: 'Tòa B - Phòng Công nghệ cao 302', isActive: true, category: 'lab' },
  { id: 'FAC05', name: 'Khán phòng Royal Theatre & Âm nhạc', location: 'Tòa C - Hội trường biểu diễn', isActive: true, category: 'indoor' },
  { id: 'FAC06', name: 'Nhà thi đấu Đa năng Gym', location: 'Tòa A - Tầng 2 Thể chất', isActive: true, category: 'indoor' },
];

export const INITIAL_TRANSFERS: ClassTransferRecord[] = [
  {
    id: 'TRF001',
    studentId: 'HV001',
    studentName: 'Nguyễn Minh Khôi',
    transferType: 'subject_or_shift_change',
    fromClassId: 'LH003',
    fromClassName: 'Bơi lội Cơ bản Sáng T7-CN',
    toClassId: 'LH001',
    toClassName: 'Bóng rổ U10 Chiều T2-T4',
    transferDate: '2026-09-15',
    attendedSessionsOldClass: 4,
    remainingSessionsOldClass: 12,
    remainingCreditOldClass: 2400000,
    newClassRemainingSessions: 14,
    requiredFeeNewClass: 2520000,
    feeDifference: 120000,
    differenceStatus: 'student_must_pay',
    reason: 'Chuyển môn do phụ huynh đổi ca làm việc, học viên đam mê môn bóng rổ hơn',
    createdBy: 'Ban Giáo vụ Royal School',
    createdAt: '2026-09-15 10:30:00',
  },
  {
    id: 'TRF002',
    studentId: 'HV002',
    studentName: 'Lê Quỳnh Chi',
    transferType: 'course_progression',
    fromClassId: 'LH004',
    fromClassName: 'Vẽ Mỹ thuật Số Chiều T7',
    toClassId: 'LH002',
    toClassName: 'Robotics SPIKE Prime T3-T5',
    transferDate: '2026-09-18',
    attendedSessionsOldClass: 2,
    remainingSessionsOldClass: 10,
    remainingCreditOldClass: 1500000,
    newClassRemainingSessions: 14,
    requiredFeeNewClass: 3500000,
    feeDifference: 2000000,
    differenceStatus: 'student_must_pay',
    reason: 'Đăng ký nâng bậc sang chương trình STEM Robotics & AI',
    createdBy: 'Ban Giáo vụ Royal School',
    createdAt: '2026-09-18 14:15:00',
  },
  {
    id: 'TRF003',
    studentId: 'HV007',
    studentName: 'Vũ Đức Duy Anh',
    transferType: 'subject_or_shift_change',
    fromClassId: 'LH001',
    fromClassName: 'Bóng rổ U10 Chiều T2-T4',
    toClassId: 'LH006',
    toClassName: 'Taekwondo Nhí Khối Tiểu học',
    transferDate: '2026-09-20',
    attendedSessionsOldClass: 4,
    remainingSessionsOldClass: 12,
    remainingCreditOldClass: 2160000,
    newClassRemainingSessions: 18,
    requiredFeeNewClass: 2520000,
    feeDifference: 360000,
    differenceStatus: 'student_must_pay',
    reason: 'Chuyển về cơ sở Thủ Đức gần nhà mới chuyển đến',
    createdBy: 'Ban Giáo vụ Royal School',
    createdAt: '2026-09-20 16:45:00',
  },
];

export type BillingType = 'full_course' | 'prorated_sessions';
export type InvoicePaymentStatus = 'unpaid' | 'partially_paid' | 'paid';

export interface TuitionInvoice {
  id: string;
  invoiceCode: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  enrollmentId?: string;
  billingType: BillingType;
  startSessionIndex: number;
  sessionRate: number;
  registeredSessions: number;
  totalSessionsInCourse: number;
  subtotalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  paymentStatus: InvoicePaymentStatus;
  dueDate: string; // YYYY-MM-DD
  bankTransferQr?: string;
  transferSyntax: string;
  notes?: string;
  createdAt: string;
  paidAt?: string;
}

export function calculateTuitionFee(
  startSessionIndex: number,
  totalSessions: number,
  fullCourseFee: number,
  pricePerSession: number
): {
  billingType: BillingType;
  registeredSessions: number;
  subtotalAmount: number;
} {
  const safeStart = Math.max(1, startSessionIndex || 1);
  if (safeStart === 1) {
    return {
      billingType: 'full_course',
      registeredSessions: totalSessions,
      subtotalAmount: fullCourseFee || (totalSessions * pricePerSession),
    };
  } else {
    const registeredSessions = Math.max(0, totalSessions - (safeStart - 1));
    return {
      billingType: 'prorated_sessions',
      registeredSessions,
      subtotalAmount: registeredSessions * pricePerSession,
    };
  }
}

export function generateVietQrUrl(
  accountNo: string = '02839110001',
  accountName: string = 'TRUONG SONG NGU QUOC TE ROYAL',
  amount: number = 0,
  content: string = ''
): string {
  const encodedName = encodeURIComponent(accountName);
  const encodedContent = encodeURIComponent(content);
  return `https://img.vietqr.io/image/MB-${accountNo}-compact2.png?amount=${Math.max(0, amount)}&addInfo=${encodedContent}&accountName=${encodedName}`;
}

export const INITIAL_INVOICES: TuitionInvoice[] = [
  {
    id: 'INV001',
    invoiceCode: 'INV-202609-001',
    studentId: 'HV001',
    studentName: 'Nguyễn Minh Khôi',
    classId: 'LH001',
    className: 'Bóng rổ U10 Chiều T2-T4',
    billingType: 'full_course',
    startSessionIndex: 1,
    sessionRate: 180000,
    registeredSessions: 16,
    totalSessionsInCourse: 16,
    subtotalAmount: 2880000,
    paidAmount: 2880000,
    outstandingAmount: 0,
    paymentStatus: 'paid',
    dueDate: '2026-09-10',
    transferSyntax: 'HV001 LH001 INV001',
    bankTransferQr: generateVietQrUrl('02839110001', 'TRUONG SONG NGU QUOC TE ROYAL', 2880000, 'HV001 LH001 INV001'),
    notes: 'Đăng ký trọn khóa Học kỳ 1 (16 buổi)',
    createdAt: '2026-09-01 08:30:00',
    paidAt: '2026-09-03 14:20:00',
  },
  {
    id: 'INV002',
    invoiceCode: 'INV-202609-002',
    studentId: 'HV002',
    studentName: 'Lê Quỳnh Chi',
    classId: 'LH002',
    className: 'Robotics SPIKE Prime T3-T5',
    billingType: 'full_course',
    startSessionIndex: 1,
    sessionRate: 250000,
    registeredSessions: 16,
    totalSessionsInCourse: 16,
    subtotalAmount: 4000000,
    paidAmount: 4000000,
    outstandingAmount: 0,
    paymentStatus: 'paid',
    dueDate: '2026-09-10',
    transferSyntax: 'HV002 LH002 INV002',
    bankTransferQr: generateVietQrUrl('02839110001', 'TRUONG SONG NGU QUOC TE ROYAL', 4000000, 'HV002 LH002 INV002'),
    notes: 'Học phí trọn khóa kèm bộ tài liệu SPIKE Prime',
    createdAt: '2026-09-02 09:15:00',
    paidAt: '2026-09-04 11:30:00',
  },
  {
    id: 'INV003',
    invoiceCode: 'INV-202609-003',
    studentId: 'HV003',
    studentName: 'Trần Bảo Nam',
    classId: 'LH003',
    className: 'Bơi lội Cơ bản Sáng T7-CN',
    billingType: 'full_course',
    startSessionIndex: 1,
    sessionRate: 200000,
    registeredSessions: 16,
    totalSessionsInCourse: 16,
    subtotalAmount: 3200000,
    paidAmount: 3200000,
    outstandingAmount: 0,
    paymentStatus: 'paid',
    dueDate: '2026-09-12',
    transferSyntax: 'HV003 LH003 INV003',
    bankTransferQr: generateVietQrUrl('02839110001', 'TRUONG SONG NGU QUOC TE ROYAL', 3200000, 'HV003 LH003 INV003'),
    notes: 'Bơi hồ 4 mùa ấm áp',
    createdAt: '2026-09-02 10:00:00',
    paidAt: '2026-09-05 08:10:00',
  },
  {
    id: 'INV004',
    invoiceCode: 'INV-202609-004',
    studentId: 'HV004',
    studentName: 'Phạm Hoàng Yến Nhi',
    classId: 'LH004',
    className: 'Vẽ Mỹ thuật Số Chiều T7',
    billingType: 'full_course',
    startSessionIndex: 1,
    sessionRate: 150000,
    registeredSessions: 12,
    totalSessionsInCourse: 12,
    subtotalAmount: 1800000,
    paidAmount: 1800000,
    outstandingAmount: 0,
    paymentStatus: 'paid',
    dueDate: '2026-09-15',
    transferSyntax: 'HV004 LH004 INV004',
    bankTransferQr: generateVietQrUrl('02839110001', 'TRUONG SONG NGU QUOC TE ROYAL', 1800000, 'HV004 LH004 INV004'),
    notes: 'Học phí trọn khóa mỹ thuật',
    createdAt: '2026-09-03 15:00:00',
    paidAt: '2026-09-06 16:45:00',
  },
  {
    id: 'INV005',
    invoiceCode: 'INV-202609-005',
    studentId: 'HV005',
    studentName: 'Đặng Gia Huy',
    classId: 'LH005',
    className: 'Piano Căn bản T2-T6',
    billingType: 'full_course',
    startSessionIndex: 1,
    sessionRate: 220000,
    registeredSessions: 16,
    totalSessionsInCourse: 16,
    subtotalAmount: 3520000,
    paidAmount: 0,
    outstandingAmount: 3520000,
    paymentStatus: 'unpaid',
    dueDate: '2026-10-10',
    transferSyntax: 'HV005 LH005 INV005',
    bankTransferQr: generateVietQrUrl('02839110001', 'TRUONG SONG NGU QUOC TE ROYAL', 3520000, 'HV005 LH005 INV005'),
    notes: 'Phiếu báo phí Học kỳ 1 - Hạn nộp 10/10/2026',
    createdAt: '2026-09-08 08:00:00',
  },
  {
    id: 'INV006',
    invoiceCode: 'INV-202609-006',
    studentId: 'HV006',
    studentName: 'Huỳnh Ngọc Ánh Dương',
    classId: 'LH005',
    className: 'Piano Căn bản T2-T6',
    billingType: 'prorated_sessions',
    startSessionIndex: 1,
    sessionRate: 220000,
    registeredSessions: 8,
    totalSessionsInCourse: 16,
    subtotalAmount: 1760000,
    paidAmount: 1760000,
    outstandingAmount: 0,
    paymentStatus: 'paid',
    dueDate: '2026-09-15',
    transferSyntax: 'HV006 LH005 INV006',
    bankTransferQr: generateVietQrUrl('02839110001', 'TRUONG SONG NGU QUOC TE ROYAL', 1760000, 'HV006 LH005 INV006'),
    notes: 'Đăng ký nửa khóa học kỳ 1 (8 buổi trải nghiệm)',
    createdAt: '2026-09-09 11:20:00',
    paidAt: '2026-09-10 09:30:00',
  },
  {
    id: 'INV007',
    invoiceCode: 'INV-202609-007',
    studentId: 'HV007',
    studentName: 'Vũ Đức Duy Anh',
    classId: 'LH006',
    className: 'Taekwondo Nhí Khối Tiểu học',
    billingType: 'full_course',
    startSessionIndex: 1,
    sessionRate: 140000,
    registeredSessions: 24,
    totalSessionsInCourse: 24,
    subtotalAmount: 3360000,
    paidAmount: 1500000,
    outstandingAmount: 1860000,
    paymentStatus: 'partially_paid',
    dueDate: '2026-10-15',
    transferSyntax: 'HV007 LH006 INV007',
    bankTransferQr: generateVietQrUrl('02839110001', 'TRUONG SONG NGU QUOC TE ROYAL', 1860000, 'HV007 LH006 INV007'),
    notes: 'Phụ huynh đã đóng đợt 1: 1.500.000đ, còn lại đợt 2 hẹn trước 15/10',
    createdAt: '2026-09-05 14:00:00',
    paidAt: '2026-09-05 14:05:00',
  },
  {
    id: 'INV008',
    invoiceCode: 'INV-202609-008',
    studentId: 'HV011',
    studentName: 'Hoàng Tuấn Kiệt',
    classId: 'LH008',
    className: 'Tiếng Anh Kịch nghệ T4-T6',
    billingType: 'full_course',
    startSessionIndex: 1,
    sessionRate: 200000,
    registeredSessions: 16,
    totalSessionsInCourse: 16,
    subtotalAmount: 3200000,
    paidAmount: 3200000,
    outstandingAmount: 0,
    paymentStatus: 'paid',
    dueDate: '2026-09-12',
    transferSyntax: 'HV011 LH008 INV008',
    bankTransferQr: generateVietQrUrl('02839110001', 'TRUONG SONG NGU QUOC TE ROYAL', 3200000, 'HV011 LH008 INV008'),
    notes: 'Trọn khóa Drama Club kèm trang phục biểu diễn',
    createdAt: '2026-09-06 10:45:00',
    paidAt: '2026-09-08 15:10:00',
  },
  {
    id: 'INV009',
    invoiceCode: 'INV-202609-009',
    studentId: 'HV012',
    studentName: 'Đỗ Bảo Trâm',
    classId: 'LH008',
    className: 'Tiếng Anh Kịch nghệ T4-T6',
    billingType: 'full_course',
    startSessionIndex: 1,
    sessionRate: 200000,
    registeredSessions: 16,
    totalSessionsInCourse: 16,
    subtotalAmount: 3200000,
    paidAmount: 0,
    outstandingAmount: 3200000,
    paymentStatus: 'unpaid',
    dueDate: '2026-10-12',
    transferSyntax: 'HV012 LH008 INV009',
    bankTransferQr: generateVietQrUrl('02839110001', 'TRUONG SONG NGU QUOC TE ROYAL', 3200000, 'HV012 LH008 INV009'),
    notes: 'Chờ phụ huynh xác nhận thanh toán chuyển khoản',
    createdAt: '2026-09-07 09:30:00',
  },
  {
    id: 'INV010',
    invoiceCode: 'INV-202609-010',
    studentId: 'HV009',
    studentName: 'Bùi Minh Đăng',
    classId: 'LH007',
    className: 'Cờ vua Tư duy & Thi đấu Sáng CN',
    billingType: 'full_course',
    startSessionIndex: 1,
    sessionRate: 150000,
    registeredSessions: 16,
    totalSessionsInCourse: 16,
    subtotalAmount: 2400000,
    paidAmount: 2400000,
    outstandingAmount: 0,
    paymentStatus: 'paid',
    dueDate: '2026-09-18',
    transferSyntax: 'HV009 LH007 INV010',
    bankTransferQr: generateVietQrUrl('02839110001', 'TRUONG SONG NGU QUOC TE ROYAL', 2400000, 'HV009 LH007 INV010'),
    notes: 'Đã hoàn tất thanh toán tiền mặt tại phòng kế toán cơ sở',
    createdAt: '2026-09-10 16:00:00',
    paidAt: '2026-09-12 09:00:00',
  },
];
