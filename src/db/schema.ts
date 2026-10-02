import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table (Firebase Auth user mapping)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  fullName: text('full_name'),
  role: text('role').default('parent').notNull(),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Branches (Cơ sở học)
export const branches = pgTable('branches', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  diaChi: text('dia_chi').notNull(),
  sdt: text('sdt').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Subjects (Môn học ngoại khóa)
export const subjects = pgTable('subjects', {
  id: text('id').primaryKey(),
  tenMon: text('ten_mon').notNull(),
  tenTiengAnh: text('ten_tieng_anh'),
  nhomMon: text('nhom_mon'),
  thoiLuong: text('thoi_luong'),
  siSo: text('si_so'),
  soBuoiHoc: integer('so_buoi_hoc').notNull(),
  hocPhiTheoBuoi: integer('hoc_phi_theo_buoi').notNull(),
  hocPhiTheoKhoa: integer('hoc_phi_theo_khoa').notNull(),
  moTa: text('mo_ta'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Classes (Lớp học)
export const classes = pgTable('classes', {
  id: text('id').primaryKey(),
  tenMon: text('ten_mon').notNull(),
  tenLop: text('ten_lop'),
  coSo: text('co_so'),
  phongHoc: text('phong_hoc').notNull(),
  siSoToiDa: integer('si_so_toi_da').default(15).notNull(),
  lichHocCoDinh: text('lich_hoc_co_dinh').notNull(),
  days: text('days').array(),
  time: text('time').notNull(),
  trangThai: text('trang_thai').default('Đang hoạt động').notNull(),
  soBuoiHoc: integer('so_buoi_hoc').default(16),
  ngayBatDau: text('ngay_bat_dau'),
  ngayKetThuc: text('ngay_ket_thuc'),
  hocPhiTronKhoa: integer('hoc_phi_tron_khoa'),
  donGiaBuoi: integer('don_gia_buoi'),
  teacherName: text('teacher_name'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Students (Học viên)
export const students = pgTable('students', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  sdtPhuHuynh: text('sdt_phu_huynh').notNull(),
  ngayBatDau: text('ngay_bat_dau'),
  ngayKetThuc: text('ngay_ket_thuc'),
  trangThai: text('trang_thai').default('Còn hạn').notNull(),
  soVeHocBu: integer('so_ve_hoc_bu').default(0).notNull(),
  hoTenPhuHuynh: text('ho_ten_phu_huynh'),
  lopChinhKhoa: text('lop_chinh_khoa'),
  ngaySinh: text('ngay_sinh'),
  gioiTinh: text('gioi_tinh'),
  soBuoiHoc: integer('so_buoi_hoc').default(24),
  coSo: text('co_so'),
  choXepLop: boolean('cho_xep_lop').default(false),
  danhSachMonHoc: text('danh_sach_mon_hoc').array(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Enrollments (Danh sách phân lớp)
export const enrollments = pgTable('enrollments', {
  id: text('id').primaryKey(),
  idLop: text('id_lop').notNull(),
  idHocVien: text('id_hoc_vien').notNull(),
  loaiHocVien: text('loai_hoc_vien').default('Chính thức').notNull(),
  status: text('status').default('active'), // 'active' | 'transferred_out' | 'completed'
  remainingSessions: integer('remaining_sessions').default(16),
  paymentStatus: text('payment_status').default('paid'), // 'paid' | 'unpaid'
  createdAt: timestamp('created_at').defaultNow(),
});

// Attendance (Điểm danh & Nhật ký)
export const attendance = pgTable('attendance', {
  id: text('id').primaryKey(),
  idLop: text('id_lop').notNull(),
  idHocVien: text('id_hoc_vien').notNull(),
  ngayHoc: text('ngay_hoc').notNull(),
  trangThai: text('trang_thai').notNull(),
  nhanXetRieng: text('nhan_xet_rieng'),
  hinhAnh: text('hinh_anh').array(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Teachers (Giáo viên)
export const teachers = pgTable('teachers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  sdt: text('sdt').notNull(),
  email: text('email').notNull(),
  monDay: text('mon_day').notNull(),
  trangThai: text('trang_thai').default('Đang dạy').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Class Transfers (Chuyển lớp & Bù trừ học phí)
export const classTransfers = pgTable('class_transfers', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull(),
  studentName: text('student_name').notNull(),
  transferType: text('transfer_type').notNull(),
  fromClassId: text('from_class_id').notNull(),
  fromClassName: text('from_class_name').notNull(),
  toClassId: text('to_class_id').notNull(),
  toClassName: text('to_class_name').notNull(),
  transferDate: text('transfer_date').notNull(),
  attendedSessionsOldClass: integer('attended_sessions_old_class').default(0).notNull(),
  remainingSessionsOldClass: integer('remaining_sessions_old_class').default(0).notNull(),
  remainingCreditOldClass: integer('remaining_credit_old_class').default(0).notNull(),
  newClassRemainingSessions: integer('new_class_remaining_sessions').default(0).notNull(),
  requiredFeeNewClass: integer('required_fee_new_class').default(0).notNull(),
  feeDifference: integer('fee_difference').default(0).notNull(),
  differenceStatus: text('difference_status').notNull(),
  batchId: text('batch_id'),
  transferMode: text('transfer_mode').default('single'),
  creditApplied: integer('credit_applied').default(0),
  surchargeAmount: integer('surcharge_amount').default(0),
  reason: text('reason'),
  createdBy: text('created_by'),
  createdAt: text('created_at').notNull(),
});

// Tuition Invoices (Hóa đơn & Báo phí)
export const tuitionInvoices = pgTable('tuition_invoices', {
  id: text('id').primaryKey(),
  invoiceCode: text('invoice_code').notNull().unique(),
  studentId: text('student_id').notNull(),
  studentName: text('student_name').notNull(),
  classId: text('class_id').notNull(),
  className: text('class_name').notNull(),
  billingType: text('billing_type').default('full_course').notNull(),
  startSessionIndex: integer('start_session_index').default(1).notNull(),
  sessionRate: integer('session_rate').notNull(),
  registeredSessions: integer('registered_sessions').notNull(),
  totalSessionsInCourse: integer('total_sessions_in_course').notNull(),
  subtotalAmount: integer('subtotal_amount').notNull(),
  paidAmount: integer('paid_amount').default(0).notNull(),
  outstandingAmount: integer('outstanding_amount').notNull(),
  paymentStatus: text('payment_status').default('unpaid').notNull(),
  dueDate: text('due_date').notNull(),
  bankTransferQr: text('bank_transfer_qr'),
  transferSyntax: text('transfer_syntax').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  paidAt: text('paid_at'),
});
