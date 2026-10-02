import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  seedInitialDataIfEmpty,
  resetAndSeedNewDemoData,
  getStudents,
  upsertStudent,
  deleteStudent,
  getClasses,
  upsertClass,
  deleteClass,
  getBranches,
  upsertBranch,
  deleteBranch,
  getSubjects,
  upsertSubject,
  deleteSubject,
  getTeachers,
  upsertTeacher,
  deleteTeacher,
  getEnrollments,
  addEnrollment,
  getAttendance,
  saveAttendanceRecords,
  getTransfers,
  addTransfer,
  executeIndividualTransfer,
  executeBulkTransfer,
  getInvoices,
  addInvoice,
  recordPayment,
} from './src/db/operations.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Initial database seeding on boot
seedInitialDataIfEmpty()
  .then((res) => console.log('Database init:', res.message))
  .catch((err) => console.error('Database init warning:', err));

// ----------------- API ROUTES -----------------

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    database: 'PostgreSQL (Cloud SQL)',
    timestamp: new Date().toISOString(),
  });
});

// Reset and populate fresh demo data
app.post('/api/reset-demo', async (req: Request, res: Response) => {
  try {
    const result = await resetAndSeedNewDemoData();
    res.json(result);
  } catch (error) {
    console.error('Failed to reset demo data:', error);
    res.status(500).json({ error: 'Failed to reset and seed demo data' });
  }
});

// Bulk bootstrap initial state for fastest client loading
app.get('/api/bootstrap', async (req: Request, res: Response) => {
  try {
    const [
      studentsList,
      classesList,
      branchesList,
      subjectsList,
      teachersList,
      enrollmentsList,
      attendanceList,
      transfersList,
      invoicesList,
    ] = await Promise.all([
      getStudents(),
      getClasses(),
      getBranches(),
      getSubjects(),
      getTeachers(),
      getEnrollments(),
      getAttendance(),
      getTransfers(),
      getInvoices(),
    ]);

    res.json({
      students: studentsList,
      classes: classesList,
      branches: branchesList,
      subjects: subjectsList,
      teachers: teachersList,
      enrollments: enrollmentsList,
      attendance: attendanceList,
      transfers: transfersList,
      invoices: invoicesList,
    });
  } catch (error: any) {
    console.error('Bootstrap API error:', error);
    res.status(500).json({ error: error.message || 'Failed to bootstrap data' });
  }
});

// Students
app.get('/api/students', async (req: Request, res: Response) => {
  try {
    const data = await getStudents();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/students', async (req: Request, res: Response) => {
  try {
    const saved = await upsertStudent(req.body);
    res.json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/students/:id', async (req: Request, res: Response) => {
  try {
    await deleteStudent(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Classes
app.get('/api/classes', async (req: Request, res: Response) => {
  try {
    const data = await getClasses();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/classes', async (req: Request, res: Response) => {
  try {
    const saved = await upsertClass(req.body);
    res.json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/classes/:id', async (req: Request, res: Response) => {
  try {
    await deleteClass(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Branches
app.get('/api/branches', async (req: Request, res: Response) => {
  try {
    const data = await getBranches();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/branches', async (req: Request, res: Response) => {
  try {
    const saved = await upsertBranch(req.body);
    res.json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/branches/:id', async (req: Request, res: Response) => {
  try {
    await deleteBranch(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Subjects
app.get('/api/subjects', async (req: Request, res: Response) => {
  try {
    const data = await getSubjects();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/subjects', async (req: Request, res: Response) => {
  try {
    const saved = await upsertSubject(req.body);
    res.json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/subjects/:id', async (req: Request, res: Response) => {
  try {
    await deleteSubject(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Teachers
app.get('/api/teachers', async (req: Request, res: Response) => {
  try {
    const data = await getTeachers();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/teachers', async (req: Request, res: Response) => {
  try {
    const saved = await upsertTeacher(req.body);
    res.json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/teachers/:id', async (req: Request, res: Response) => {
  try {
    await deleteTeacher(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Enrollments
app.get('/api/enrollments', async (req: Request, res: Response) => {
  try {
    const data = await getEnrollments();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/enrollments', async (req: Request, res: Response) => {
  try {
    const saved = await addEnrollment(req.body);
    res.json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Attendance
app.get('/api/attendance', async (req: Request, res: Response) => {
  try {
    const data = await getAttendance();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/attendance', async (req: Request, res: Response) => {
  try {
    await saveAttendanceRecords(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Transfers
app.get('/api/transfers', async (req: Request, res: Response) => {
  try {
    const data = await getTransfers();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/transfers', async (req: Request, res: Response) => {
  try {
    const saved = await addTransfer(req.body);
    res.json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Method 1: Individual Prorated Transfer
app.post('/api/transfers/individual', async (req: Request, res: Response) => {
  try {
    const result = await executeIndividualTransfer(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Method 2: Course Progression / Bulk Transfer
app.post('/api/transfers/bulk', async (req: Request, res: Response) => {
  try {
    const result = await executeBulkTransfer(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Invoices
app.get('/api/invoices', async (req: Request, res: Response) => {
  try {
    const data = await getInvoices();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/invoices', async (req: Request, res: Response) => {
  try {
    const saved = await addInvoice(req.body);
    res.json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/invoices/:id/pay', async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    const updated = await recordPayment(req.params.id, Number(amount) || 0);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- VITE INTEGRATION -----------------
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} [mode: ${isProduction ? 'production' : 'development'}]`);
  });
}

startServer();
