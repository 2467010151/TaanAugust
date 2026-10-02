import {
  HocVien,
  LopHoc,
  DanhSachLop,
  DiemDanh,
  GiaoVien,
  CoSo,
  MonHoc,
  ClassTransferRecord,
  TuitionInvoice,
} from '../types.ts';

// Bootstrap all data from PostgreSQL in 1 fast query
export async function fetchBootstrapData() {
  const res = await fetch('/api/bootstrap');
  if (!res.ok) {
    throw new Error('Failed to bootstrap data');
  }
  return res.json();
}

// Students
export async function apiSaveStudent(student: HocVien): Promise<HocVien> {
  const res = await fetch('/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  });
  if (!res.ok) throw new Error('Failed to save student');
  return res.json();
}

export async function apiDeleteStudent(id: string): Promise<void> {
  const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete student');
}

// Classes
export async function apiSaveClass(cls: LopHoc): Promise<LopHoc> {
  const res = await fetch('/api/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cls),
  });
  if (!res.ok) throw new Error('Failed to save class');
  return res.json();
}

export async function apiDeleteClass(id: string): Promise<void> {
  const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete class');
}

// Branches
export async function apiSaveBranch(branch: CoSo): Promise<CoSo> {
  const res = await fetch('/api/branches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(branch),
  });
  if (!res.ok) throw new Error('Failed to save branch');
  return res.json();
}

export async function apiDeleteBranch(id: string): Promise<void> {
  const res = await fetch(`/api/branches/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete branch');
}

// Subjects
export async function apiSaveSubject(subject: MonHoc): Promise<MonHoc> {
  const res = await fetch('/api/subjects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subject),
  });
  if (!res.ok) throw new Error('Failed to save subject');
  return res.json();
}

export async function apiDeleteSubject(id: string): Promise<void> {
  const res = await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete subject');
}

// Teachers
export async function apiSaveTeacher(teacher: GiaoVien): Promise<GiaoVien> {
  const res = await fetch('/api/teachers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(teacher),
  });
  if (!res.ok) throw new Error('Failed to save teacher');
  return res.json();
}

export async function apiDeleteTeacher(id: string): Promise<void> {
  const res = await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete teacher');
}

// Enrollments
export async function apiSaveEnrollment(enrollment: DanhSachLop): Promise<DanhSachLop> {
  const res = await fetch('/api/enrollments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(enrollment),
  });
  if (!res.ok) throw new Error('Failed to save enrollment');
  return res.json();
}

// Attendance
export async function apiSaveAttendance(records: DiemDanh[]): Promise<void> {
  const res = await fetch('/api/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(records),
  });
  if (!res.ok) throw new Error('Failed to save attendance');
}

// Transfers
export async function apiSaveTransfer(transfer: ClassTransferRecord): Promise<ClassTransferRecord> {
  const res = await fetch('/api/transfers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transfer),
  });
  if (!res.ok) throw new Error('Failed to save transfer');
  return res.json();
}

export async function apiExecuteIndividualTransfer(data: {
  studentId: string;
  fromClassId: string;
  toClassId: string;
  transferDate?: string;
  reason?: string;
  createdBy?: string;
}): Promise<{
  success: boolean;
  transferRecord: ClassTransferRecord;
  invoice: TuitionInvoice | null;
  retainedCredit: number;
  additionalAmount: number;
  message: string;
}> {
  const res = await fetch('/api/transfers/individual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Lỗi khi thực hiện chuyển lớp' }));
    throw new Error(err.error || 'Lỗi khi thực hiện chuyển lớp');
  }
  return res.json();
}

export async function apiExecuteBulkTransfer(data: {
  fromClassId: string;
  toClassId: string;
  studentIds: string[];
  transferDate?: string;
  reason?: string;
  createdBy?: string;
}): Promise<{
  success: boolean;
  batchId: string;
  transfers: ClassTransferRecord[];
  invoices: TuitionInvoice[];
  transferredCount: number;
  message: string;
}> {
  const res = await fetch('/api/transfers/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Lỗi khi thực hiện chuyển lớp hàng loạt' }));
    throw new Error(err.error || 'Lỗi khi thực hiện chuyển lớp hàng loạt');
  }
  return res.json();
}

// Invoices
export async function apiSaveInvoice(invoice: TuitionInvoice): Promise<TuitionInvoice> {
  const res = await fetch('/api/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoice),
  });
  if (!res.ok) throw new Error('Failed to save invoice');
  return res.json();
}

export async function apiRecordPayment(invoiceId: string, amount: number): Promise<TuitionInvoice> {
  const res = await fetch(`/api/invoices/${invoiceId}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });
  if (!res.ok) throw new Error('Failed to record payment');
  return res.json();
}

// Reset Demo Data
export async function apiResetDemoData(): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/reset-demo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to reset demo data');
  return res.json();
}
