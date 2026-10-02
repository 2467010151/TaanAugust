import { db } from './index.ts';
import { 
  users, 
  branches, 
  subjects, 
  classes, 
  students, 
  enrollments, 
  attendance, 
  teachers, 
  classTransfers, 
  tuitionInvoices 
} from './schema.ts';
import { eq, desc, and } from 'drizzle-orm';
import {
  INITIAL_CO_SO,
  INITIAL_MON_HOC,
  INITIAL_LOP_HOC,
  INITIAL_HOC_VIEN,
  INITIAL_DANH_SACH_LOP,
  INITIAL_DIEM_DANH,
  INITIAL_GIAO_VIEN,
  INITIAL_TRANSFERS,
  INITIAL_INVOICES,
  HocVien,
  LopHoc,
  DanhSachLop,
  DiemDanh,
  GiaoVien,
  CoSo,
  MonHoc,
  ClassTransferRecord,
  TuitionInvoice
} from '../types.ts';

// ----------------- SEEDING -----------------
export async function resetAndSeedNewDemoData() {
  try {
    console.log('Resetting and seeding new Royal School demo data into PostgreSQL...');

    // Clear existing data
    await db.delete(attendance);
    await db.delete(enrollments);
    await db.delete(classTransfers);
    await db.delete(tuitionInvoices);
    await db.delete(students);
    await db.delete(classes);
    await db.delete(teachers);
    await db.delete(subjects);
    await db.delete(branches);

    // 1. Branches
    for (const item of INITIAL_CO_SO) {
      await db.insert(branches).values({
        id: item.id,
        name: item.name,
        diaChi: item.diaChi,
        sdt: item.sdt,
      }).onConflictDoNothing();
    }

    // 2. Subjects
    for (const item of INITIAL_MON_HOC) {
      await db.insert(subjects).values({
        id: item.id,
        tenMon: item.tenMon,
        tenTiengAnh: item.tenTiengAnh || null,
        nhomMon: item.nhomMon || null,
        thoiLuong: item.thoiLuong || null,
        siSo: item.siSo || null,
        soBuoiHoc: item.soBuoiHoc,
        hocPhiTheoBuoi: item.hocPhiTheoBuoi,
        hocPhiTheoKhoa: item.hocPhiTheoKhoa,
        moTa: item.moTa || null,
      }).onConflictDoNothing();
    }

    // 3. Classes
    for (const item of INITIAL_LOP_HOC) {
      await db.insert(classes).values({
        id: item.id,
        tenMon: item.tenMon,
        tenLop: item.tenLop || null,
        coSo: item.coSo || null,
        phongHoc: item.phongHoc,
        siSoToiDa: item.siSoToiDa,
        lichHocCoDinh: item.lichHocCoDinh,
        days: item.days,
        time: item.time,
        trangThai: item.trangThai || 'Đang hoạt động',
        soBuoiHoc: item.soBuoiHoc || 16,
        ngayBatDau: item.ngayBatDau || null,
        ngayKetThuc: item.ngayKetThuc || null,
        hocPhiTronKhoa: item.hocPhiTronKhoa || null,
        donGiaBuoi: item.donGiaBuoi || null,
        teacherName: item.teacherName || null,
      }).onConflictDoNothing();
    }

    // 4. Teachers
    for (const item of INITIAL_GIAO_VIEN) {
      await db.insert(teachers).values({
        id: item.id,
        name: item.name,
        sdt: item.sdt,
        email: item.email,
        monDay: item.monDay,
        trangThai: item.trangThai,
      }).onConflictDoNothing();
    }

    // 5. Students
    for (const item of INITIAL_HOC_VIEN) {
      await db.insert(students).values({
        id: item.id,
        name: item.name,
        sdtPhuHuynh: item.sdtPhuHuynh,
        ngayBatDau: item.ngayBatDau || null,
        ngayKetThuc: item.ngayKetThuc || null,
        trangThai: item.trangThai,
        soVeHocBu: item.soVeHocBu || 0,
        hoTenPhuHuynh: item.hoTenPhuHuynh || null,
        lopChinhKhoa: item.lopChinhKhoa || null,
        ngaySinh: item.ngaySinh || null,
        gioiTinh: item.gioiTinh || 'Nam',
        soBuoiHoc: item.soBuoiHoc || 16,
        coSo: item.coSo || null,
        choXepLop: item.choXepLop || false,
        danhSachMonHoc: item.danhSachMonHoc || [],
      }).onConflictDoNothing();
    }

    // 6. Enrollments
    for (const item of INITIAL_DANH_SACH_LOP) {
      await db.insert(enrollments).values({
        id: item.id,
        idLop: item.idLop,
        idHocVien: item.idHocVien,
        loaiHocVien: item.loaiHocVien,
      }).onConflictDoNothing();
    }

    // 7. Attendance
    for (const item of INITIAL_DIEM_DANH) {
      await db.insert(attendance).values({
        id: item.id,
        idLop: item.idLop,
        idHocVien: item.idHocVien,
        ngayHoc: item.ngayHoc,
        trangThai: item.trangThai,
        nhanXetRieng: item.nhanXetRieng || null,
        hinhAnh: item.hinhAnh || [],
      }).onConflictDoNothing();
    }

    // 8. Transfers
    for (const item of INITIAL_TRANSFERS) {
      await db.insert(classTransfers).values({
        id: item.id,
        studentId: item.studentId,
        studentName: item.studentName,
        transferType: item.transferType,
        fromClassId: item.fromClassId,
        fromClassName: item.fromClassName,
        toClassId: item.toClassId,
        toClassName: item.toClassName,
        transferDate: item.transferDate,
        attendedSessionsOldClass: item.attendedSessionsOldClass,
        remainingSessionsOldClass: item.remainingSessionsOldClass,
        remainingCreditOldClass: item.remainingCreditOldClass,
        newClassRemainingSessions: item.newClassRemainingSessions,
        requiredFeeNewClass: item.requiredFeeNewClass,
        feeDifference: item.feeDifference,
        differenceStatus: item.differenceStatus,
        reason: item.reason || null,
        createdBy: item.createdBy || null,
        createdAt: item.createdAt,
      }).onConflictDoNothing();
    }

    // 9. Invoices
    for (const item of INITIAL_INVOICES) {
      await db.insert(tuitionInvoices).values({
        id: item.id,
        invoiceCode: item.invoiceCode,
        studentId: item.studentId,
        studentName: item.studentName,
        classId: item.classId,
        className: item.className,
        billingType: item.billingType,
        startSessionIndex: item.startSessionIndex,
        sessionRate: item.sessionRate,
        registeredSessions: item.registeredSessions,
        totalSessionsInCourse: item.totalSessionsInCourse,
        subtotalAmount: item.subtotalAmount,
        paidAmount: item.paidAmount,
        outstandingAmount: item.outstandingAmount,
        paymentStatus: item.paymentStatus,
        dueDate: item.dueDate,
        bankTransferQr: item.bankTransferQr || null,
        transferSyntax: item.transferSyntax,
        notes: item.notes || null,
        createdAt: item.createdAt,
        paidAt: item.paidAt || null,
      }).onConflictDoNothing();
    }

    return { success: true, message: 'Đã thiết lập thành công bộ dữ liệu Demo mới vào Cloud SQL PostgreSQL!' };
  } catch (error) {
    console.error('Error resetting demo data:', error);
    throw error;
  }
}

export async function seedInitialDataIfEmpty() {
  try {
    const existingStudents = await db.select().from(students).limit(1);
    if (existingStudents.length > 0) {
      return { seeded: false, message: 'Database already contains data' };
    }

    console.log('Seeding initial Royal School data into PostgreSQL...');

    // 1. Branches
    for (const item of INITIAL_CO_SO) {
      await db.insert(branches).values({
        id: item.id,
        name: item.name,
        diaChi: item.diaChi,
        sdt: item.sdt,
      }).onConflictDoNothing();
    }

    // 2. Subjects
    for (const item of INITIAL_MON_HOC) {
      await db.insert(subjects).values({
        id: item.id,
        tenMon: item.tenMon,
        tenTiengAnh: item.tenTiengAnh || null,
        nhomMon: item.nhomMon || null,
        thoiLuong: item.thoiLuong || null,
        siSo: item.siSo || null,
        soBuoiHoc: item.soBuoiHoc,
        hocPhiTheoBuoi: item.hocPhiTheoBuoi,
        hocPhiTheoKhoa: item.hocPhiTheoKhoa,
        moTa: item.moTa || null,
      }).onConflictDoNothing();
    }

    // 3. Classes
    for (const item of INITIAL_LOP_HOC) {
      await db.insert(classes).values({
        id: item.id,
        tenMon: item.tenMon,
        tenLop: item.tenLop || null,
        coSo: item.coSo || null,
        phongHoc: item.phongHoc,
        siSoToiDa: item.siSoToiDa,
        lichHocCoDinh: item.lichHocCoDinh,
        days: item.days,
        time: item.time,
        trangThai: item.trangThai || 'Đang hoạt động',
        soBuoiHoc: item.soBuoiHoc || 16,
        ngayBatDau: item.ngayBatDau || null,
        ngayKetThuc: item.ngayKetThuc || null,
        hocPhiTronKhoa: item.hocPhiTronKhoa || null,
        donGiaBuoi: item.donGiaBuoi || null,
        teacherName: item.teacherName || null,
      }).onConflictDoNothing();
    }

    // 4. Teachers
    for (const item of INITIAL_GIAO_VIEN) {
      await db.insert(teachers).values({
        id: item.id,
        name: item.name,
        sdt: item.sdt,
        email: item.email,
        monDay: item.monDay,
        trangThai: item.trangThai,
      }).onConflictDoNothing();
    }

    // 5. Students
    for (const item of INITIAL_HOC_VIEN) {
      await db.insert(students).values({
        id: item.id,
        name: item.name,
        sdtPhuHuynh: item.sdtPhuHuynh,
        ngayBatDau: item.ngayBatDau || null,
        ngayKetThuc: item.ngayKetThuc || null,
        trangThai: item.trangThai,
        soVeHocBu: item.soVeHocBu || 0,
        hoTenPhuHuynh: item.hoTenPhuHuynh || null,
        lopChinhKhoa: item.lopChinhKhoa || null,
        ngaySinh: item.ngaySinh || null,
        gioiTinh: item.gioiTinh || 'Nam',
        soBuoiHoc: item.soBuoiHoc || 24,
        coSo: item.coSo || null,
        choXepLop: item.choXepLop || false,
        danhSachMonHoc: item.danhSachMonHoc || [],
      }).onConflictDoNothing();
    }

    // 6. Enrollments
    for (const item of INITIAL_DANH_SACH_LOP) {
      await db.insert(enrollments).values({
        id: item.id,
        idLop: item.idLop,
        idHocVien: item.idHocVien,
        loaiHocVien: item.loaiHocVien,
      }).onConflictDoNothing();
    }

    // 7. Attendance
    for (const item of INITIAL_DIEM_DANH) {
      await db.insert(attendance).values({
        id: item.id,
        idLop: item.idLop,
        idHocVien: item.idHocVien,
        ngayHoc: item.ngayHoc,
        trangThai: item.trangThai,
        nhanXetRieng: item.nhanXetRieng || null,
        hinhAnh: item.hinhAnh || [],
      }).onConflictDoNothing();
    }

    // 8. Transfers
    for (const item of INITIAL_TRANSFERS) {
      await db.insert(classTransfers).values({
        id: item.id,
        studentId: item.studentId,
        studentName: item.studentName,
        transferType: item.transferType,
        fromClassId: item.fromClassId,
        fromClassName: item.fromClassName,
        toClassId: item.toClassId,
        toClassName: item.toClassName,
        transferDate: item.transferDate,
        attendedSessionsOldClass: item.attendedSessionsOldClass,
        remainingSessionsOldClass: item.remainingSessionsOldClass,
        remainingCreditOldClass: item.remainingCreditOldClass,
        newClassRemainingSessions: item.newClassRemainingSessions,
        requiredFeeNewClass: item.requiredFeeNewClass,
        feeDifference: item.feeDifference,
        differenceStatus: item.differenceStatus,
        reason: item.reason || null,
        createdBy: item.createdBy || null,
        createdAt: item.createdAt,
      }).onConflictDoNothing();
    }

    // 9. Invoices
    for (const item of INITIAL_INVOICES) {
      await db.insert(tuitionInvoices).values({
        id: item.id,
        invoiceCode: item.invoiceCode,
        studentId: item.studentId,
        studentName: item.studentName,
        classId: item.classId,
        className: item.className,
        billingType: item.billingType,
        startSessionIndex: item.startSessionIndex,
        sessionRate: item.sessionRate,
        registeredSessions: item.registeredSessions,
        totalSessionsInCourse: item.totalSessionsInCourse,
        subtotalAmount: item.subtotalAmount,
        paidAmount: item.paidAmount,
        outstandingAmount: item.outstandingAmount,
        paymentStatus: item.paymentStatus,
        dueDate: item.dueDate,
        bankTransferQr: item.bankTransferQr || null,
        transferSyntax: item.transferSyntax,
        notes: item.notes || null,
        createdAt: item.createdAt,
        paidAt: item.paidAt || null,
      }).onConflictDoNothing();
    }

    console.log('Seeding completed successfully.');
    return { seeded: true, message: 'Seeded initial data' };
  } catch (error) {
    console.error('Failed to seed initial data:', error);
    throw new Error('Database seeding failed', { cause: error });
  }
}

// ----------------- STUDENTS -----------------
export async function getStudents(): Promise<HocVien[]> {
  try {
    const rows = await db.select().from(students).orderBy(desc(students.createdAt));
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      sdtPhuHuynh: r.sdtPhuHuynh,
      ngayBatDau: r.ngayBatDau || '',
      ngayKetThuc: r.ngayKetThuc || '',
      trangThai: r.trangThai as any,
      soVeHocBu: r.soVeHocBu,
      hoTenPhuHuynh: r.hoTenPhuHuynh || undefined,
      lopChinhKhoa: r.lopChinhKhoa || undefined,
      ngaySinh: r.ngaySinh || undefined,
      gioiTinh: (r.gioiTinh as any) || undefined,
      soBuoiHoc: r.soBuoiHoc || undefined,
      coSo: r.coSo || undefined,
      choXepLop: r.choXepLop || false,
      danhSachMonHoc: r.danhSachMonHoc || undefined,
    }));
  } catch (error) {
    console.error('Error fetching students:', error);
    throw new Error('Failed to retrieve students', { cause: error });
  }
}

export async function upsertStudent(data: HocVien): Promise<HocVien> {
  try {
    const values = {
      id: data.id,
      name: data.name,
      sdtPhuHuynh: data.sdtPhuHuynh,
      ngayBatDau: data.ngayBatDau || null,
      ngayKetThuc: data.ngayKetThuc || null,
      trangThai: data.trangThai,
      soVeHocBu: data.soVeHocBu ?? 0,
      hoTenPhuHuynh: data.hoTenPhuHuynh || null,
      lopChinhKhoa: data.lopChinhKhoa || null,
      ngaySinh: data.ngaySinh || null,
      gioiTinh: data.gioiTinh || 'Nam',
      soBuoiHoc: data.soBuoiHoc ?? 24,
      coSo: data.coSo || null,
      choXepLop: data.choXepLop || false,
      danhSachMonHoc: data.danhSachMonHoc || [],
    };

    await db.insert(students)
      .values(values)
      .onConflictDoUpdate({
        target: students.id,
        set: {
          name: values.name,
          sdtPhuHuynh: values.sdtPhuHuynh,
          ngayBatDau: values.ngayBatDau,
          ngayKetThuc: values.ngayKetThuc,
          trangThai: values.trangThai,
          soVeHocBu: values.soVeHocBu,
          hoTenPhuHuynh: values.hoTenPhuHuynh,
          lopChinhKhoa: values.lopChinhKhoa,
          ngaySinh: values.ngaySinh,
          gioiTinh: values.gioiTinh,
          soBuoiHoc: values.soBuoiHoc,
          coSo: values.coSo,
          choXepLop: values.choXepLop,
          danhSachMonHoc: values.danhSachMonHoc,
        },
      });

    return data;
  } catch (error) {
    console.error('Error upserting student:', error);
    throw new Error('Failed to save student', { cause: error });
  }
}

export async function deleteStudent(id: string): Promise<boolean> {
  try {
    await db.delete(attendance).where(eq(attendance.idHocVien, id));
    await db.delete(enrollments).where(eq(enrollments.idHocVien, id));
    await db.delete(students).where(eq(students.id, id));
    return true;
  } catch (error) {
    console.error('Error deleting student:', error);
    throw new Error('Failed to delete student', { cause: error });
  }
}

// ----------------- CLASSES -----------------
export async function getClasses(): Promise<LopHoc[]> {
  try {
    const rows = await db.select().from(classes).orderBy(classes.id);
    return rows.map((r) => ({
      id: r.id,
      tenMon: r.tenMon,
      tenLop: r.tenLop || undefined,
      coSo: r.coSo || undefined,
      phongHoc: r.phongHoc,
      siSoToiDa: r.siSoToiDa,
      lichHocCoDinh: r.lichHocCoDinh,
      days: r.days || [],
      time: r.time,
      trangThai: (r.trangThai as any) || undefined,
      soBuoiHoc: r.soBuoiHoc || undefined,
      ngayBatDau: r.ngayBatDau || undefined,
      ngayKetThuc: r.ngayKetThuc || undefined,
      hocPhiTronKhoa: r.hocPhiTronKhoa || undefined,
      donGiaBuoi: r.donGiaBuoi || undefined,
      teacherName: r.teacherName || undefined,
    }));
  } catch (error) {
    console.error('Error fetching classes:', error);
    throw new Error('Failed to retrieve classes', { cause: error });
  }
}

export async function upsertClass(data: LopHoc): Promise<LopHoc> {
  try {
    const values = {
      id: data.id,
      tenMon: data.tenMon,
      tenLop: data.tenLop || null,
      coSo: data.coSo || null,
      phongHoc: data.phongHoc,
      siSoToiDa: data.siSoToiDa,
      lichHocCoDinh: data.lichHocCoDinh,
      days: data.days || [],
      time: data.time,
      trangThai: data.trangThai || 'Đang hoạt động',
      soBuoiHoc: data.soBuoiHoc || 16,
      ngayBatDau: data.ngayBatDau || null,
      ngayKetThuc: data.ngayKetThuc || null,
      hocPhiTronKhoa: data.hocPhiTronKhoa || null,
      donGiaBuoi: data.donGiaBuoi || null,
      teacherName: data.teacherName || null,
    };

    await db.insert(classes)
      .values(values)
      .onConflictDoUpdate({
        target: classes.id,
        set: {
          tenMon: values.tenMon,
          tenLop: values.tenLop,
          coSo: values.coSo,
          phongHoc: values.phongHoc,
          siSoToiDa: values.siSoToiDa,
          lichHocCoDinh: values.lichHocCoDinh,
          days: values.days,
          time: values.time,
          trangThai: values.trangThai,
          soBuoiHoc: values.soBuoiHoc,
          ngayBatDau: values.ngayBatDau,
          ngayKetThuc: values.ngayKetThuc,
          hocPhiTronKhoa: values.hocPhiTronKhoa,
          donGiaBuoi: values.donGiaBuoi,
          teacherName: values.teacherName,
        },
      });

    return data;
  } catch (error) {
    console.error('Error upserting class:', error);
    throw new Error('Failed to save class', { cause: error });
  }
}

export async function deleteClass(id: string): Promise<boolean> {
  try {
    await db.delete(attendance).where(eq(attendance.idLop, id));
    await db.delete(enrollments).where(eq(enrollments.idLop, id));
    await db.delete(classes).where(eq(classes.id, id));
    return true;
  } catch (error) {
    console.error('Error deleting class:', error);
    throw new Error('Failed to delete class', { cause: error });
  }
}

// ----------------- BRANCHES -----------------
export async function getBranches(): Promise<CoSo[]> {
  try {
    const rows = await db.select().from(branches).orderBy(branches.id);
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      diaChi: r.diaChi,
      sdt: r.sdt,
    }));
  } catch (error) {
    console.error('Error fetching branches:', error);
    throw new Error('Failed to retrieve branches', { cause: error });
  }
}

export async function upsertBranch(data: CoSo): Promise<CoSo> {
  try {
    await db.insert(branches)
      .values(data)
      .onConflictDoUpdate({
        target: branches.id,
        set: {
          name: data.name,
          diaChi: data.diaChi,
          sdt: data.sdt,
        },
      });
    return data;
  } catch (error) {
    console.error('Error upserting branch:', error);
    throw new Error('Failed to save branch', { cause: error });
  }
}

export async function deleteBranch(id: string): Promise<boolean> {
  try {
    await db.delete(branches).where(eq(branches.id, id));
    return true;
  } catch (error) {
    console.error('Error deleting branch:', error);
    throw new Error('Failed to delete branch', { cause: error });
  }
}

// ----------------- SUBJECTS -----------------
export async function getSubjects(): Promise<MonHoc[]> {
  try {
    const rows = await db.select().from(subjects).orderBy(subjects.id);
    return rows.map((r) => ({
      id: r.id,
      tenMon: r.tenMon,
      soBuoiHoc: r.soBuoiHoc,
      hocPhiTheoBuoi: r.hocPhiTheoBuoi,
      hocPhiTheoKhoa: r.hocPhiTheoKhoa,
      moTa: r.moTa || undefined,
    }));
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw new Error('Failed to retrieve subjects', { cause: error });
  }
}

export async function upsertSubject(data: MonHoc): Promise<MonHoc> {
  try {
    await db.insert(subjects)
      .values(data)
      .onConflictDoUpdate({
        target: subjects.id,
        set: {
          tenMon: data.tenMon,
          soBuoiHoc: data.soBuoiHoc,
          hocPhiTheoBuoi: data.hocPhiTheoBuoi,
          hocPhiTheoKhoa: data.hocPhiTheoKhoa,
          moTa: data.moTa || null,
        },
      });
    return data;
  } catch (error) {
    console.error('Error upserting subject:', error);
    throw new Error('Failed to save subject', { cause: error });
  }
}

export async function deleteSubject(id: string): Promise<boolean> {
  try {
    await db.delete(subjects).where(eq(subjects.id, id));
    return true;
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw new Error('Failed to delete subject', { cause: error });
  }
}

// ----------------- TEACHERS -----------------
export async function getTeachers(): Promise<GiaoVien[]> {
  try {
    const rows = await db.select().from(teachers).orderBy(teachers.id);
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      sdt: r.sdt,
      email: r.email,
      monDay: r.monDay,
      trangThai: r.trangThai as any,
    }));
  } catch (error) {
    console.error('Error fetching teachers:', error);
    throw new Error('Failed to retrieve teachers', { cause: error });
  }
}

export async function upsertTeacher(data: GiaoVien): Promise<GiaoVien> {
  try {
    await db.insert(teachers)
      .values(data)
      .onConflictDoUpdate({
        target: teachers.id,
        set: {
          name: data.name,
          sdt: data.sdt,
          email: data.email,
          monDay: data.monDay,
          trangThai: data.trangThai,
        },
      });
    return data;
  } catch (error) {
    console.error('Error upserting teacher:', error);
    throw new Error('Failed to save teacher', { cause: error });
  }
}

export async function deleteTeacher(id: string): Promise<boolean> {
  try {
    await db.delete(teachers).where(eq(teachers.id, id));
    return true;
  } catch (error) {
    console.error('Error deleting teacher:', error);
    throw new Error('Failed to delete teacher', { cause: error });
  }
}

// ----------------- ENROLLMENTS -----------------
export async function getEnrollments(): Promise<DanhSachLop[]> {
  try {
    const rows = await db.select().from(enrollments);
    return rows.map((r) => ({
      id: r.id,
      idLop: r.idLop,
      idHocVien: r.idHocVien,
      loaiHocVien: r.loaiHocVien as any,
    }));
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    throw new Error('Failed to retrieve enrollments', { cause: error });
  }
}

export async function addEnrollment(data: DanhSachLop): Promise<DanhSachLop> {
  try {
    await db.insert(enrollments).values(data).onConflictDoNothing();
    return data;
  } catch (error) {
    console.error('Error adding enrollment:', error);
    throw new Error('Failed to add enrollment', { cause: error });
  }
}

// ----------------- ATTENDANCE -----------------
export async function getAttendance(): Promise<DiemDanh[]> {
  try {
    const rows = await db.select().from(attendance);
    return rows.map((r) => ({
      id: r.id,
      idLop: r.idLop,
      ngayHoc: r.ngayHoc,
      idHocVien: r.idHocVien,
      trangThai: r.trangThai as any,
      nhanXetRieng: r.nhanXetRieng || '',
      hinhAnh: r.hinhAnh || [],
    }));
  } catch (error) {
    console.error('Error fetching attendance:', error);
    throw new Error('Failed to retrieve attendance', { cause: error });
  }
}

export async function saveAttendanceRecords(records: DiemDanh[]): Promise<boolean> {
  try {
    for (const r of records) {
      await db.insert(attendance)
        .values({
          id: r.id,
          idLop: r.idLop,
          idHocVien: r.idHocVien,
          ngayHoc: r.ngayHoc,
          trangThai: r.trangThai,
          nhanXetRieng: r.nhanXetRieng || null,
          hinhAnh: r.hinhAnh || [],
        })
        .onConflictDoUpdate({
          target: attendance.id,
          set: {
            trangThai: r.trangThai,
            nhanXetRieng: r.nhanXetRieng || null,
            hinhAnh: r.hinhAnh || [],
          },
        });
    }
    return true;
  } catch (error) {
    console.error('Error saving attendance records:', error);
    throw new Error('Failed to save attendance records', { cause: error });
  }
}

// ----------------- TRANSFERS -----------------
export async function getTransfers(): Promise<ClassTransferRecord[]> {
  try {
    const rows = await db.select().from(classTransfers).orderBy(desc(classTransfers.createdAt));
    return rows.map((r) => ({
      id: r.id,
      studentId: r.studentId,
      studentName: r.studentName,
      transferType: r.transferType as any,
      fromClassId: r.fromClassId,
      fromClassName: r.fromClassName,
      toClassId: r.toClassId,
      toClassName: r.toClassName,
      transferDate: r.transferDate,
      attendedSessionsOldClass: r.attendedSessionsOldClass,
      remainingSessionsOldClass: r.remainingSessionsOldClass,
      remainingCreditOldClass: r.remainingCreditOldClass,
      newClassRemainingSessions: r.newClassRemainingSessions,
      requiredFeeNewClass: r.requiredFeeNewClass,
      feeDifference: r.feeDifference,
      differenceStatus: r.differenceStatus as any,
      batchId: r.batchId || undefined,
      transferMode: (r.transferMode as any) || 'single',
      creditApplied: r.creditApplied ? Number(r.creditApplied) : 0,
      surchargeAmount: r.surchargeAmount ? Number(r.surchargeAmount) : 0,
      reason: r.reason || undefined,
      createdBy: r.createdBy || undefined,
      createdAt: r.createdAt,
    }));
  } catch (error) {
    console.error('Error fetching transfers:', error);
    throw new Error('Failed to retrieve class transfers', { cause: error });
  }
}

export async function addTransfer(data: ClassTransferRecord): Promise<ClassTransferRecord> {
  try {
    await db.insert(classTransfers).values({
      id: data.id,
      studentId: data.studentId,
      studentName: data.studentName,
      transferType: data.transferType,
      fromClassId: data.fromClassId,
      fromClassName: data.fromClassName,
      toClassId: data.toClassId,
      toClassName: data.toClassName,
      transferDate: data.transferDate,
      attendedSessionsOldClass: data.attendedSessionsOldClass,
      remainingSessionsOldClass: data.remainingSessionsOldClass,
      remainingCreditOldClass: data.remainingCreditOldClass,
      newClassRemainingSessions: data.newClassRemainingSessions,
      requiredFeeNewClass: data.requiredFeeNewClass,
      feeDifference: data.feeDifference,
      differenceStatus: data.differenceStatus,
      batchId: data.batchId || null,
      transferMode: data.transferMode || 'single',
      creditApplied: data.creditApplied || 0,
      surchargeAmount: data.surchargeAmount || 0,
      reason: data.reason || null,
      createdBy: data.createdBy || null,
      createdAt: data.createdAt,
    });
    return data;
  } catch (error) {
    console.error('Error adding transfer record:', error);
    throw new Error('Failed to record class transfer', { cause: error });
  }
}

// ----------------- METHOD 1: INDIVIDUAL PRORATED TRANSFER -----------------
export async function executeIndividualTransfer(params: {
  studentId: string;
  fromClassId: string;
  toClassId: string;
  transferDate?: string;
  reason?: string;
  createdBy?: string;
}) {
  try {
    const { studentId, fromClassId, toClassId, reason, createdBy } = params;
    const transferDate = params.transferDate || new Date().toISOString().split('T')[0];

    // 1. Validation: check target class capacity
    const [toClass] = await db.select().from(classes).where(eq(classes.id, toClassId)).limit(1);
    if (!toClass) throw new Error('Không tìm thấy lớp học mục tiêu');

    const toClassCurrentEnrollments = await db.select().from(enrollments).where(eq(enrollments.idLop, toClassId));
    const activeCurrentCount = toClassCurrentEnrollments.filter(e => e.status !== 'transferred_out').length;

    if (activeCurrentCount >= toClass.siSoToiDa) {
      throw new Error(`Lớp mục tiêu "${toClass.tenLop || toClass.tenMon}" đã đủ sĩ số tối đa (${toClass.siSoToiDa} HS). Không thể chuyển vào!`);
    }

    const [fromClass] = await db.select().from(classes).where(eq(classes.id, fromClassId)).limit(1);
    const [student] = await db.select().from(students).where(eq(students.id, studentId)).limit(1);
    if (!student) throw new Error('Không tìm thấy thông tin học sinh');

    // 2. Count attended sessions in old class
    const attendances = await db.select().from(attendance)
      .where(eq(attendance.idHocVien, studentId));
    const attendedSessions = attendances.filter(a => a.idLop === fromClassId && (a.trangThai === 'Có mặt' || a.trangThai === 'Vắng có phép')).length;

    // 3. Financial calculations
    const fromTotalSessions = fromClass?.soBuoiHoc || 16;
    const fromSessionRate = fromClass?.donGiaBuoi || 150000;
    const remainingSessionsOld = Math.max(0, fromTotalSessions - attendedSessions);
    const oldBalance = remainingSessionsOld * fromSessionRate;

    const toTotalSessions = toClass.soBuoiHoc || 16;
    const toSessionRate = toClass.donGiaBuoi || 180000;
    const newClassRemainingSessions = toTotalSessions;
    const newClassCost = newClassRemainingSessions * toSessionRate;
    const feeDiff = newClassCost - oldBalance;

    let differenceStatus: 'settled' | 'student_must_pay' | 'retained_credit' = 'settled';
    let additionalAmount = 0;
    let retainedCredit = 0;
    let newEnrollmentPaymentStatus: 'paid' | 'unpaid' = 'paid';

    if (feeDiff > 0) {
      differenceStatus = 'student_must_pay';
      additionalAmount = feeDiff;
      newEnrollmentPaymentStatus = 'unpaid';
    } else if (feeDiff < 0) {
      differenceStatus = 'retained_credit';
      retainedCredit = Math.abs(feeDiff);
      newEnrollmentPaymentStatus = 'paid';
    }

    // 4. Update old enrollment status = 'transferred_out'
    await db.update(enrollments)
      .set({ status: 'transferred_out' })
      .where(eq(enrollments.idHocVien, studentId));

    // 5. Create new enrollment
    const newEnrollmentId = `ENR_${Date.now()}_${studentId}`;
    await db.insert(enrollments).values({
      id: newEnrollmentId,
      idLop: toClassId,
      idHocVien: studentId,
      loaiHocVien: 'Chính thức',
      status: 'active',
      remainingSessions: newClassRemainingSessions,
      paymentStatus: newEnrollmentPaymentStatus,
    });

    // 6. If surcharge needed, generate tuition invoice
    let generatedInvoice: TuitionInvoice | null = null;
    if (additionalAmount > 0) {
      const invoiceId = `INV_TRF_${Date.now()}`;
      const invoiceCode = `INV-TRF-${Date.now().toString().slice(-6)}`;
      generatedInvoice = {
        id: invoiceId,
        invoiceCode,
        studentId,
        studentName: student.name,
        classId: toClassId,
        className: toClass.tenLop || toClass.tenMon,
        enrollmentId: newEnrollmentId,
        billingType: 'prorated_sessions',
        startSessionIndex: 1,
        sessionRate: toSessionRate,
        registeredSessions: newClassRemainingSessions,
        totalSessionsInCourse: toTotalSessions,
        subtotalAmount: additionalAmount,
        paidAmount: 0,
        outstandingAmount: additionalAmount,
        paymentStatus: 'unpaid',
        dueDate: transferDate,
        transferSyntax: `${studentId} ${toClassId.slice(-4)} ${invoiceCode}`,
        notes: `Thu bù chuyển lớp: ${fromClass?.tenLop || fromClass?.tenMon || fromClassId} -> ${toClass.tenLop || toClass.tenMon}`,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };
      await db.insert(tuitionInvoices).values(generatedInvoice);
    }

    // 7. Update student main class record
    await db.update(students)
      .set({
        lopChinhKhoa: toClass.tenLop || toClass.tenMon,
        coSo: toClass.coSo || student.coSo,
        soBuoiHoc: newClassRemainingSessions,
      })
      .where(eq(students.id, studentId));

    // 8. Insert class_transfers record
    const transferRecordId = `TRF_${Date.now()}`;
    const transferRecord: ClassTransferRecord = {
      id: transferRecordId,
      studentId,
      studentName: student.name,
      transferType: 'subject_or_shift_change',
      fromClassId,
      fromClassName: fromClass?.tenLop || fromClass?.tenMon || fromClassId,
      toClassId,
      toClassName: toClass.tenLop || toClass.tenMon,
      transferDate,
      attendedSessionsOldClass: attendedSessions,
      remainingSessionsOldClass: remainingSessionsOld,
      remainingCreditOldClass: oldBalance,
      newClassRemainingSessions,
      requiredFeeNewClass: newClassCost,
      feeDifference: feeDiff,
      differenceStatus,
      batchId: undefined,
      transferMode: 'single',
      creditApplied: oldBalance,
      surchargeAmount: additionalAmount,
      reason: reason || 'Chuyển môn / đổi ca học theo nguyện vọng',
      createdBy: createdBy || 'Ban Giáo vụ Royal School',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    await addTransfer(transferRecord);

    return {
      success: true,
      transferRecord,
      invoice: generatedInvoice,
      retainedCredit,
      additionalAmount,
      message: `Chuyển lớp thành công cho em ${student.name}! ${additionalAmount > 0 ? `Cần nộp thêm ${additionalAmount.toLocaleString('vi-VN')} đ.` : retainedCredit > 0 ? `Được bảo lưu ${retainedCredit.toLocaleString('vi-VN')} đ vào ví.` : 'Tất toán ngang (0 đ).'}`
    };
  } catch (error) {
    console.error('Error executing individual transfer:', error);
    throw error;
  }
}

// ----------------- METHOD 2: COURSE PROGRESSION & BULK TRANSFER -----------------
export async function executeBulkTransfer(params: {
  fromClassId: string;
  toClassId: string;
  studentIds: string[];
  transferDate?: string;
  reason?: string;
  createdBy?: string;
}) {
  try {
    const { fromClassId, toClassId, studentIds, reason, createdBy } = params;
    const transferDate = params.transferDate || new Date().toISOString().split('T')[0];

    const [toClass] = await db.select().from(classes).where(eq(classes.id, toClassId)).limit(1);
    if (!toClass) throw new Error('Không tìm thấy lớp học mục tiêu');

    const [fromClass] = await db.select().from(classes).where(eq(classes.id, fromClassId)).limit(1);

    // Check available slots
    const toClassCurrentEnrollments = await db.select().from(enrollments).where(eq(enrollments.idLop, toClassId));
    const activeCurrentCount = toClassCurrentEnrollments.filter(e => e.status !== 'transferred_out').length;
    const availableSlots = Math.max(0, toClass.siSoToiDa - activeCurrentCount);

    if (studentIds.length > availableSlots) {
      throw new Error(`Lớp mục tiêu "${toClass.tenLop || toClass.tenMon}" chỉ còn ${availableSlots} chỗ trống, nhưng bạn đã chọn ${studentIds.length} học sinh. Vui lòng giảm bớt số lượng hoặc chọn lớp khác!`);
    }

    const batchId = `BATCH_${Date.now()}`;
    const generatedTransfers: ClassTransferRecord[] = [];
    const generatedInvoices: TuitionInvoice[] = [];

    const fullFee = toClass.hocPhiTronKhoa || (toClass.soBuoiHoc || 16) * (toClass.donGiaBuoi || 180000);

    for (const studentId of studentIds) {
      const [student] = await db.select().from(students).where(eq(students.id, studentId)).limit(1);
      if (!student) continue;

      // 1. Update old enrollment
      await db.update(enrollments)
        .set({ status: 'transferred_out' })
        .where(eq(enrollments.idHocVien, studentId));

      // 2. Create new enrollment
      const newEnrollmentId = `ENR_${Date.now()}_${studentId}`;
      await db.insert(enrollments).values({
        id: newEnrollmentId,
        idLop: toClassId,
        idHocVien: studentId,
        loaiHocVien: 'Chính thức',
        status: 'active',
        remainingSessions: toClass.soBuoiHoc || 16,
        paymentStatus: 'unpaid',
      });

      // 3. Create invoice for course progression
      const invoiceId = `INV_PRG_${Date.now()}_${studentId}`;
      const invoiceCode = `INV-PRG-${Date.now().toString().slice(-5)}${studentId.slice(-3)}`;
      const invoice: TuitionInvoice = {
        id: invoiceId,
        invoiceCode,
        studentId,
        studentName: student.name,
        classId: toClassId,
        className: toClass.tenLop || toClass.tenMon,
        enrollmentId: newEnrollmentId,
        billingType: 'full_course',
        startSessionIndex: 1,
        sessionRate: toClass.donGiaBuoi || 180000,
        registeredSessions: toClass.soBuoiHoc || 16,
        totalSessionsInCourse: toClass.soBuoiHoc || 16,
        subtotalAmount: fullFee,
        paidAmount: 0,
        outstandingAmount: fullFee,
        paymentStatus: 'unpaid',
        dueDate: transferDate,
        transferSyntax: `${studentId} ${toClassId.slice(-4)} ${invoiceCode}`,
        notes: `Học phí hết khóa / Lên cấp độ mới [${fromClass?.tenLop || fromClass?.tenMon}] -> [${toClass.tenLop || toClass.tenMon}]`,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };
      await db.insert(tuitionInvoices).values(invoice);
      generatedInvoices.push(invoice);

      // 4. Update student main class
      await db.update(students)
        .set({
          lopChinhKhoa: toClass.tenLop || toClass.tenMon,
          coSo: toClass.coSo || student.coSo,
          soBuoiHoc: toClass.soBuoiHoc || 16,
        })
        .where(eq(students.id, studentId));

      // 5. Transfer record
      const transferRecord: ClassTransferRecord = {
        id: `TRF_${Date.now()}_${studentId}`,
        studentId,
        studentName: student.name,
        transferType: 'course_progression',
        fromClassId,
        fromClassName: fromClass?.tenLop || fromClass?.tenMon || fromClassId,
        toClassId,
        toClassName: toClass.tenLop || toClass.tenMon,
        transferDate,
        attendedSessionsOldClass: fromClass?.soBuoiHoc || 16,
        remainingSessionsOldClass: 0,
        remainingCreditOldClass: 0,
        newClassRemainingSessions: toClass.soBuoiHoc || 16,
        requiredFeeNewClass: fullFee,
        feeDifference: fullFee,
        differenceStatus: 'student_must_pay',
        batchId,
        transferMode: 'bulk',
        creditApplied: 0,
        surchargeAmount: fullFee,
        reason: reason || 'Hoàn thành khóa học và thăng hạng lên cấp độ tiếp theo',
        createdBy: createdBy || 'Ban Giáo vụ Royal School',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };
      await addTransfer(transferRecord);
      generatedTransfers.push(transferRecord);
    }

    // 6. Check if old class is now emptied, mark as completed
    const remainingInFromClass = await db.select().from(enrollments)
      .where(eq(enrollments.idLop, fromClassId));
    const stillActiveInFrom = remainingInFromClass.filter(e => e.status !== 'transferred_out').length;
    if (stillActiveInFrom === 0) {
      await db.update(classes)
        .set({ trangThai: 'Đã hoàn thành' })
        .where(eq(classes.id, fromClassId));
    }

    return {
      success: true,
      batchId,
      transfers: generatedTransfers,
      invoices: generatedInvoices,
      transferredCount: studentIds.length,
      message: `Đã hoàn tất chuyển hàng loạt ${studentIds.length} học sinh sang lớp "${toClass.tenLop || toClass.tenMon}" theo batch ID ${batchId}!`
    };
  } catch (error) {
    console.error('Error executing bulk transfer:', error);
    throw error;
  }
}

// ----------------- INVOICES -----------------
export async function getInvoices(): Promise<TuitionInvoice[]> {
  try {
    const rows = await db.select().from(tuitionInvoices).orderBy(desc(tuitionInvoices.createdAt));
    return rows.map((r) => ({
      id: r.id,
      invoiceCode: r.invoiceCode,
      studentId: r.studentId,
      studentName: r.studentName,
      classId: r.classId,
      className: r.className,
      billingType: r.billingType as any,
      startSessionIndex: r.startSessionIndex,
      sessionRate: r.sessionRate,
      registeredSessions: r.registeredSessions,
      totalSessionsInCourse: r.totalSessionsInCourse,
      subtotalAmount: r.subtotalAmount,
      paidAmount: r.paidAmount,
      outstandingAmount: r.outstandingAmount,
      paymentStatus: r.paymentStatus as any,
      dueDate: r.dueDate,
      bankTransferQr: r.bankTransferQr || undefined,
      transferSyntax: r.transferSyntax,
      notes: r.notes || undefined,
      createdAt: r.createdAt,
      paidAt: r.paidAt || undefined,
    }));
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw new Error('Failed to retrieve tuition invoices', { cause: error });
  }
}

export async function addInvoice(data: TuitionInvoice): Promise<TuitionInvoice> {
  try {
    await db.insert(tuitionInvoices).values(data);
    return data;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw new Error('Failed to create invoice', { cause: error });
  }
}

export async function recordPayment(invoiceId: string, paidAmount: number): Promise<TuitionInvoice | null> {
  try {
    const rows = await db.select().from(tuitionInvoices).where(eq(tuitionInvoices.id, invoiceId));
    if (rows.length === 0) return null;

    const current = rows[0];
    const newPaid = current.paidAmount + paidAmount;
    const newOutstanding = Math.max(0, current.subtotalAmount - newPaid);
    const newStatus = newOutstanding === 0 ? 'paid' : 'partially_paid';
    const paidAt = newStatus === 'paid' ? new Date().toLocaleString('vi-VN') : current.paidAt;

    await db.update(tuitionInvoices)
      .set({
        paidAmount: newPaid,
        outstandingAmount: newOutstanding,
        paymentStatus: newStatus,
        paidAt,
      })
      .where(eq(tuitionInvoices.id, invoiceId));

    return {
      id: current.id,
      invoiceCode: current.invoiceCode,
      studentId: current.studentId,
      studentName: current.studentName,
      classId: current.classId,
      className: current.className,
      billingType: current.billingType as any,
      startSessionIndex: current.startSessionIndex,
      sessionRate: current.sessionRate,
      registeredSessions: current.registeredSessions,
      totalSessionsInCourse: current.totalSessionsInCourse,
      subtotalAmount: current.subtotalAmount,
      paidAmount: newPaid,
      outstandingAmount: newOutstanding,
      paymentStatus: newStatus as any,
      dueDate: current.dueDate,
      bankTransferQr: current.bankTransferQr || undefined,
      transferSyntax: current.transferSyntax,
      notes: current.notes || undefined,
      createdAt: current.createdAt,
      paidAt: paidAt || undefined,
    };
  } catch (error) {
    console.error('Error recording payment:', error);
    throw new Error('Failed to record payment', { cause: error });
  }
}
