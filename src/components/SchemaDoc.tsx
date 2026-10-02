import React, { useState } from 'react';
import { Database, FileText, TableProperties, ShieldAlert, Image as ImageIcon, Code2, Copy, Check, Terminal, Server } from 'lucide-react';
import LogoManager from './LogoManager';

interface SchemaDocProps {
  initialSubTab?: 'schema' | 'logo' | 'migration';
}

export default function SchemaDoc({ initialSubTab = 'schema' }: SchemaDocProps) {
  const [activeSubTab, setActiveSubTab] = useState<'schema' | 'logo' | 'migration'>(initialSubTab);
  const [isCopied, setIsCopied] = useState(false);

  const sqlMigrationCode = `-- ==============================================================================
-- ROYAL SCHOOL ACADEMIC MANAGEMENT MIGRATION (SUPABASE / POSTGRESQL)
-- Version: 20260930_academic_management_schema.sql
-- Modules: Profiles, Students, Subjects, Facilities, Classes, Shifts, Sessions, 
--          Enrollments, Attendance, Class Transfers (Reconciliation & Balances)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'parent');
CREATE TYPE subject_category AS ENUM ('sports', 'arts', 'academic_skills');
CREATE TYPE class_status AS ENUM ('draft', 'open_registration', 'ongoing', 'completed');
CREATE TYPE session_status AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('unpaid', 'partially_paid', 'paid');
CREATE TYPE enrollment_status AS ENUM ('active', 'transferred_out', 'completed', 'dropped');
CREATE TYPE attendance_status AS ENUM ('present', 'absent_with_permission', 'absent_without_permission');
CREATE TYPE transfer_type AS ENUM ('course_progression', 'subject_or_shift_change');
CREATE TYPE difference_status AS ENUM ('settled', 'student_must_pay', 'retained_credit');

-- 2. TABLES
-- profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'parent',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- students
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    dob DATE,
    parent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    parent_phone TEXT NOT NULL,
    main_school_student_id TEXT,
    main_school_class TEXT,
    bus_route TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- subjects
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category subject_category NOT NULL DEFAULT 'sports',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- facilities
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- classes
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
    teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
    min_students INT NOT NULL DEFAULT 5,
    max_students INT NOT NULL DEFAULT 20,
    total_sessions INT NOT NULL,
    full_course_fee NUMERIC(12,2) NOT NULL,
    price_per_session NUMERIC(12,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status class_status NOT NULL DEFAULT 'open_registration',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- class_shifts
CREATE TABLE class_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

-- class_sessions
CREATE TABLE class_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    session_index INT NOT NULL CHECK (session_index >= 1),
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status session_status NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- enrollments
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
    enrolled_date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_from_session_index INT NOT NULL DEFAULT 1,
    remaining_sessions INT NOT NULL CHECK (remaining_sessions >= 0),
    calculated_tuition NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_status payment_status NOT NULL DEFAULT 'unpaid',
    status enrollment_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- attendance
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status attendance_status NOT NULL DEFAULT 'present',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- class_transfers
CREATE TABLE class_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    transfer_type transfer_type NOT NULL,
    from_class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
    to_class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
    transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
    attended_sessions_old_class INT NOT NULL DEFAULT 0,
    remaining_credit_old_class NUMERIC(12,2) NOT NULL DEFAULT 0,
    required_fee_new_class NUMERIC(12,2) NOT NULL DEFAULT 0,
    fee_difference NUMERIC(12,2) NOT NULL DEFAULT 0,
    difference_status difference_status NOT NULL,
    reason TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- tuition_invoices (Hóa đơn / Phiếu báo phí)
CREATE TABLE tuition_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_code TEXT NOT NULL UNIQUE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE SET NULL,
    billing_type billing_type NOT NULL DEFAULT 'full_course',
    session_rate NUMERIC(12,2) NOT NULL,
    registered_sessions INT NOT NULL,
    total_sessions_in_course INT NOT NULL,
    subtotal_amount NUMERIC(12,2) NOT NULL,
    paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    outstanding_amount NUMERIC(12,2) NOT NULL,
    payment_status payment_status NOT NULL DEFAULT 'unpaid',
    due_date DATE NOT NULL,
    bank_transfer_qr TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. BUSINESS LOGIC TRIGGER: Sân bãi trùng lịch (Facility Conflict)
CREATE OR REPLACE FUNCTION check_facility_schedule_conflict()
RETURNS TRIGGER AS $$
DECLARE
    v_facility_id UUID;
    v_conflict_count INT;
    v_conflict_class_name TEXT;
BEGIN
    SELECT facility_id INTO v_facility_id FROM classes WHERE id = NEW.class_id;

    SELECT COUNT(*), MAX(c.name)
    INTO v_conflict_count, v_conflict_class_name
    FROM class_shifts cs
    JOIN classes c ON c.id = cs.class_id
    WHERE c.facility_id = v_facility_id
      AND c.id <> NEW.class_id
      AND c.status IN ('ongoing', 'open_registration', 'draft')
      AND cs.day_of_week = NEW.day_of_week
      AND (NEW.start_time < cs.end_time AND NEW.end_time > cs.start_time);

    IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'Xung đột lịch sân bãi! Trùng với lớp "%"', v_conflict_class_name;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_facility_schedule_conflict
    BEFORE INSERT OR UPDATE ON class_shifts
    FOR EACH ROW EXECUTE FUNCTION check_facility_schedule_conflict();

-- 4. BUSINESS LOGIC TRIGGER: Kiểm tra sĩ số tối đa (Capacity check)
CREATE OR REPLACE FUNCTION check_class_capacity()
RETURNS TRIGGER AS $$
DECLARE
    v_max_students INT;
    v_current_active_students INT;
    v_class_name TEXT;
BEGIN
    IF NEW.status = 'active' THEN
        SELECT max_students, name INTO v_max_students, v_class_name FROM classes WHERE id = NEW.class_id;
        SELECT COUNT(*) INTO v_current_active_students FROM enrollments
        WHERE class_id = NEW.class_id AND status = 'active' AND (TG_OP = 'INSERT' OR id <> NEW.id);

        IF v_current_active_students >= v_max_students THEN
            RAISE EXCEPTION 'Lớp "%" đã đạt sĩ số tối đa (%/% học sinh).', v_class_name, v_current_active_students, v_max_students;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_class_capacity
    BEFORE INSERT OR UPDATE ON enrollments
    FOR EACH ROW EXECUTE FUNCTION check_class_capacity();`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlMigrationCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="schema-doc-section">
      {/* Sub-tab Navigation Header inside Data Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight flex items-center gap-2.5">
            <Database className="w-5 h-5 text-sky-400" />
            <span>Trung Tâm Dữ Liệu PostgreSQL &amp; Kiến Trúc Hệ Thống</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Hệ thống cơ sở dữ liệu quan hệ PostgreSQL (Cloud SQL) kết nối qua Drizzle ORM và Firebase Authentication.
          </p>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('schema')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'schema'
                ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <TableProperties className="w-4 h-4" />
            <span>Mô hình ERD &amp; Schema</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('migration')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'migration'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>SQL Migration</span>
            <span className="text-[9px] bg-emerald-400/30 text-emerald-950 px-1.5 py-0.2 rounded font-mono font-bold">10 Bảng</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('logo')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'logo'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Quản lý logo</span>
          </button>
        </div>
      </div>

      {/* Subtab 0: SQL Migration Script */}
      {activeSubTab === 'migration' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-400" />
                <span>Kịch Bản SQL Migration Hoàn Chỉnh (PostgreSQL / Cloud SQL)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Bao gồm 10 bảng dữ liệu học vụ, Trigger tránh trùng lịch sân bãi, Trigger kiểm tra sĩ số, hàm xử lý chuyển lớp và các chính sách bảo mật Row-Level Security (RLS).
              </p>
            </div>

            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
            >
              {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'Đã sao chép SQL!' : 'Sao chép toàn bộ SQL'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="bg-slate-900/60 border border-white/10 p-3 rounded-xl">
              <div className="text-[10px] text-slate-400 font-bold uppercase">10 Bảng Dữ Liệu</div>
              <div className="text-xs text-white font-mono font-bold mt-1">students, classes, branches...</div>
            </div>
            <div className="bg-slate-900/60 border border-white/10 p-3 rounded-xl">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Chống Trùng Sân</div>
              <div className="text-xs text-amber-400 font-mono font-bold mt-1">Trigger Facility Conflict</div>
            </div>
            <div className="bg-slate-900/60 border border-white/10 p-3 rounded-xl">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Kiểm Soát Sĩ Số</div>
              <div className="text-xs text-rose-400 font-mono font-bold mt-1">Trigger Class Capacity</div>
            </div>
            <div className="bg-slate-900/60 border border-white/10 p-3 rounded-xl">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Quyết Toán Chuyển Lớp</div>
              <div className="text-xs text-sky-400 font-mono font-bold mt-1">process_class_transfer()</div>
            </div>
            <div className="bg-slate-900/60 border border-white/10 p-3 rounded-xl">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Kết Nối Thực Tế</div>
              <div className="text-xs text-emerald-400 font-mono font-bold mt-1">Cloud SQL Live Active</div>
            </div>
          </div>

          {/* Code Window */}
          <div className="bg-slate-950 border border-white/15 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                <span className="text-xs font-mono text-slate-400 ml-2">supabase/migrations/20260930_academic_management_schema.sql</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                PostgreSQL 15+ / Cloud SQL
              </span>
            </div>
            <pre className="p-4 sm:p-6 text-[12px] font-mono text-slate-200 overflow-x-auto max-h-[600px] scrollbar-thin leading-relaxed">
              <code>{sqlMigrationCode}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Subtab 1: Logo Manager */}
      {activeSubTab === 'logo' && (
        <div className="animate-fade-in">
          <LogoManager />
        </div>
      )}

      {/* Subtab 2: Database Architecture Schema */}
      {activeSubTab === 'schema' && (
        <div className="space-y-8 animate-fade-in">
          {/* Header Card */}
          <div className="glass-panel border border-white/20 rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
                <Database className="w-6 h-6 text-sky-400" id="db-icon" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-white">
                  Kiến Trúc Cơ Sở Dữ Liệu Quan Hệ (PostgreSQL - Cloud SQL)
                </h3>
                <p className="text-xs text-slate-400">
                  Hệ thống được vận hành trên PostgreSQL và Drizzle ORM với kết nối connection pool và Firebase Authentication.
                </p>
              </div>
            </div>
          </div>

          {/* SQL Relationship Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Core Tables */}
            <div className="glass-panel text-slate-100 rounded-2xl p-6 border border-white/20 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <TableProperties className="w-5 h-5 text-sky-400" />
                  <span className="font-display font-semibold text-white">Bảng Học Vụ Cốt Lõi (PostgreSQL)</span>
                </div>
                <span className="text-xs bg-sky-500/10 text-sky-400 px-2.5 py-1 rounded-full font-mono border border-sky-500/20">Drizzle Schema</span>
              </div>

              <div className="space-y-4 font-mono text-xs">
                {/* Table students */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-white/10 hover:border-sky-500/40 transition">
                  <div className="flex justify-between text-sky-400 border-b border-white/10 pb-1 mb-2 font-bold">
                    <span>📍 Table: students (Học viên)</span>
                    <span>PK: id</span>
                  </div>
                  <ul className="space-y-1 text-slate-300">
                    <li><strong className="text-slate-400">id:</strong> TEXT <span className="text-amber-400 font-bold">[PK]</span></li>
                    <li><strong className="text-slate-400">name:</strong> TEXT NOT NULL</li>
                    <li><strong className="text-slate-400">sdt_phu_huynh:</strong> TEXT NOT NULL</li>
                    <li><strong className="text-slate-400">ho_ten_phu_huynh:</strong> TEXT</li>
                    <li><strong className="text-slate-400">ngay_bat_dau:</strong> TEXT</li>
                    <li><strong className="text-slate-400">ngay_ket_thuc:</strong> TEXT</li>
                    <li><strong className="text-slate-400">trang_thai:</strong> TEXT DEFAULT 'Còn hạn'</li>
                    <li><strong className="text-slate-400">so_ve_hoc_bu:</strong> INTEGER DEFAULT 0</li>
                    <li><strong className="text-slate-400">cho_xep_lop:</strong> BOOLEAN DEFAULT false</li>
                    <li><strong className="text-slate-400">danh_sach_mon_hoc:</strong> TEXT[]</li>
                  </ul>
                </div>

                {/* Table classes */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-white/10 hover:border-emerald-500/40 transition">
                  <div className="flex justify-between text-emerald-400 border-b border-white/10 pb-1 mb-2 font-bold">
                    <span>📍 Table: classes (Lớp học)</span>
                    <span>PK: id</span>
                  </div>
                  <ul className="space-y-1 text-slate-300">
                    <li><strong className="text-slate-400">id:</strong> TEXT <span className="text-amber-400 font-bold">[PK]</span></li>
                    <li><strong className="text-slate-400">ten_mon:</strong> TEXT NOT NULL</li>
                    <li><strong className="text-slate-400">phong_hoc:</strong> TEXT NOT NULL</li>
                    <li><strong className="text-slate-400">si_so_toi_da:</strong> INTEGER DEFAULT 15</li>
                    <li><strong className="text-slate-400">days:</strong> TEXT[]</li>
                    <li><strong className="text-slate-400">time:</strong> TEXT NOT NULL</li>
                    <li><strong className="text-slate-400">so_buoi_hoc:</strong> INTEGER DEFAULT 16</li>
                    <li><strong className="text-slate-400">trang_thai:</strong> TEXT DEFAULT 'Đang hoạt động'</li>
                  </ul>
                </div>

                {/* Table enrollments */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-white/10 hover:border-violet-500/40 transition">
                  <div className="flex justify-between text-violet-400 border-b border-white/10 pb-1 mb-2 font-bold">
                    <span>📍 Table: enrollments (Ghi danh)</span>
                    <span>PK: id</span>
                  </div>
                  <ul className="space-y-1 text-slate-300">
                    <li><strong className="text-slate-400">id:</strong> TEXT <span className="text-amber-400 font-bold">[PK]</span></li>
                    <li><strong className="text-slate-400">id_lop:</strong> TEXT NOT NULL</li>
                    <li><strong className="text-slate-400">id_hoc_vien:</strong> TEXT NOT NULL</li>
                    <li><strong className="text-slate-400">loai_hoc_vien:</strong> TEXT DEFAULT 'Chính thức'</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Financial and Attendance Tables */}
            <div className="glass-panel text-slate-100 rounded-2xl p-6 border border-white/20 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span className="font-display font-semibold text-white">Điểm Danh &amp; Tài Chính (PostgreSQL)</span>
                </div>
                <span className="text-xs bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full font-mono border border-amber-500/20">Transactions</span>
              </div>

              <div className="space-y-4 font-mono text-xs">
                {/* Table attendance */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-white/10">
                  <div className="flex justify-between text-rose-400 border-b border-white/10 pb-1 mb-2 font-bold">
                    <span>📍 Table: attendance (Điểm danh &amp; Nhật ký)</span>
                    <span>PK: id</span>
                  </div>
                  <ul className="space-y-1 text-slate-300">
                    <li><strong className="text-slate-400">id:</strong> TEXT <span className="text-amber-400 font-bold">[PK]</span></li>
                    <li><strong className="text-slate-400">id_lop:</strong> TEXT NOT NULL</li>
                    <li><strong className="text-slate-400">id_hoc_vien:</strong> TEXT NOT NULL</li>
                    <li><strong className="text-slate-400">ngay_hoc:</strong> TEXT NOT NULL</li>
                    <li><strong className="text-slate-400">trang_thai:</strong> TEXT NOT NULL</li>
                    <li><strong className="text-slate-400">nhan_xet_rieng:</strong> TEXT</li>
                  </ul>
                </div>

                {/* Table tuition_invoices */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-white/10">
                  <div className="flex justify-between text-emerald-400 border-b border-white/10 pb-1 mb-2 font-bold">
                    <span>📍 Table: tuition_invoices (Báo phí &amp; VietQR)</span>
                    <span>PK: id</span>
                  </div>
                  <ul className="space-y-1 text-slate-300">
                    <li><strong className="text-slate-400">invoice_code:</strong> TEXT UNIQUE</li>
                    <li><strong className="text-slate-400">student_id:</strong> TEXT NOT NULL</li>
                    <li><strong className="text-slate-400">subtotal_amount:</strong> INTEGER NOT NULL</li>
                    <li><strong className="text-slate-400">paid_amount:</strong> INTEGER DEFAULT 0</li>
                    <li><strong className="text-slate-400">payment_status:</strong> TEXT DEFAULT 'unpaid'</li>
                    <li><strong className="text-slate-400">transfer_syntax:</strong> TEXT NOT NULL</li>
                  </ul>
                </div>

                {/* Table class_transfers */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-white/10">
                  <div className="flex justify-between text-cyan-400 border-b border-white/10 pb-1 mb-2 font-bold">
                    <span>📍 Table: class_transfers (Quyết toán chuyển lớp)</span>
                    <span>PK: id</span>
                  </div>
                  <ul className="space-y-1 text-slate-300">
                    <li><strong className="text-slate-400">from_class_id &rarr; to_class_id:</strong> TEXT NOT NULL</li>
                    <li><strong className="text-slate-400">remaining_credit_old_class:</strong> INTEGER</li>
                    <li><strong className="text-slate-400">fee_difference:</strong> INTEGER</li>
                    <li><strong className="text-slate-400">difference_status:</strong> TEXT NOT NULL</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Relational Rules */}
          <div className="glass-panel border border-white/20 rounded-2xl p-6">
            <h3 className="text-base font-display font-semibold text-white flex items-center gap-2 mb-3">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Quy Tắc Toàn Vẹn &amp; Tối Ưu Hiệu Năng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-300">
              <div className="bg-slate-950/30 p-4 rounded-xl border border-white/10 space-y-1">
                <span className="font-bold text-sky-400 text-xs uppercase block">Connection Pooling</span>
                <p className="text-xs">
                  Sử dụng `pg.Pool` kết hợp Drizzle ORM với lazy connection, tự động quản lý tái sử dụng kết nối an toàn trong môi trường container.
                </p>
              </div>
              <div className="bg-slate-950/30 p-4 rounded-xl border border-white/10 space-y-1">
                <span className="font-bold text-emerald-400 text-xs uppercase block">Bảo Mật Hai Lớp</span>
                <p className="text-xs">
                  Lớp Query Layer đóng gói sanitization lỗi cơ sở dữ liệu; lớp API Layer quản lý xác thực Bearer token Firebase Auth và cô lập lỗi HTTP.
                </p>
              </div>
              <div className="bg-slate-950/30 p-4 rounded-xl border border-white/10 space-y-1">
                <span className="font-bold text-violet-400 text-xs uppercase block">Bảo Toàn Quyết Toán</span>
                <p className="text-xs">
                  Các giao dịch chuyển lớp và ghi nhận thu học phí tự động đồng bộ số dư vào PostgreSQL và phản ánh thời gian thực trên toàn giao diện.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
