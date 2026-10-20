import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  Doctor,
  Appointment,
  AppointmentStatus,
  HospitalEvent,
  HospitalInfoData,
  HospitalDepartment,
  WhatsAppLog,
  LiveSyncPayload,
  AdminAccount,
  AuditLogEntry,
  HospitalClinicalService,
  AdminPermission,
} from '../src/types';
import {
  INITIAL_DOCTORS,
  INITIAL_APPOINTMENTS,
  HOSPITAL_INFO,
  INITIAL_HOSPITAL_EVENTS,
  INITIAL_DEPARTMENTS,
} from '../src/data/mockData';

export const ALL_PERMISSIONS: AdminPermission[] = [
  'appointments.view',
  'appointments.create',
  'appointments.edit',
  'appointments.cancel',
  'appointments.delete',
  'patients.view',
  'doctors.manage',
  'departments.manage',
  'services.manage',
  'content.manage',
  'reports.view',
  'admin.manage',
  'system.settings',
  'audit.view',
];

export interface StoredAdminAccount extends AdminAccount {
  passwordHash: string;
}

export interface HospitalDatabaseSchema {
  doctors: Doctor[];
  appointments: Appointment[];
  hospitalEvents: HospitalEvent[];
  hospitalInfo: HospitalInfoData;
  departments: HospitalDepartment[];
  whatsappLogs: WhatsAppLog[];
  admins: StoredAdminAccount[];
  auditLogs: AuditLogEntry[];
  services: HospitalClinicalService[];
  systemSettings: {
    hospitalRegistrationNo: string;
    pmdcAuthorityNotice: string;
    emergencyHotline: string;
    defaultSlotDurationMinutes: number;
    auditRetentionDays: number;
    requireTwoFactorForSuperAdmin: boolean;
    onlineBookingGracePeriodMinutes: number;
    maxAppointmentsPerPatientPerDay: number;
    lastSecurityAuditDate: string;
  };
  lastUpdated: string;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  if (!storedHash.includes(':')) {
    return password === storedHash;
  }
  const [salt, hash] = storedHash.split(':');
  const checkHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(checkHash, 'hex'));
}

export const INITIAL_SERVICES: HospitalClinicalService[] = [
  {
    id: 'srv-mat-1',
    departmentId: 'dept-maternity',
    nameEn: 'Antenatal & High-Risk Pregnancy Monitoring',
    nameUr: 'حمل کی دیکھ بھال اور پیچیدہ کیسز کی نگرانی',
    category: 'maternity',
    descriptionEn: 'Comprehensive prenatal screening, regular ultrasound assessments, maternal blood pressure & gestational diabetes monitoring.',
    descriptionUr: 'حمل کے دوران مکمل طبی معائنہ، الٹراساؤنڈ اور زچہ و بچہ کی مکمل نگرانی۔',
    isAvailable24x7: true,
    standardFeePKR: 1500,
    featured: true,
  },
  {
    id: 'srv-mat-2',
    departmentId: 'dept-maternity',
    nameEn: 'Maternity Labor & Normal/Operative Delivery Suite',
    nameUr: 'لیبر روم اور زچگی کے جدید و محفوظ انتظامات',
    category: 'maternity',
    descriptionEn: 'State-of-the-art labor suites, fetal heart monitoring, normal delivery, elective and emergency C-section surgical care.',
    descriptionUr: 'جدید لیبر سوئیٹس، فیٹل مانیٹرنگ، نارمل ڈلیوری اور ہنگامی سیزیرین سرجری۔',
    isAvailable24x7: true,
    standardFeePKR: 2000,
    featured: true,
  },
  {
    id: 'srv-ped-1',
    departmentId: 'dept-pediatrics',
    nameEn: 'Neonatal Nursery & Incubator Care',
    nameUr: 'نوزائیدہ بچوں کے انکیوبیٹر اور نرسری کی نگہداشت',
    category: 'pediatric',
    descriptionEn: 'Specialized neonatal intensive warming, phototherapy for neonatal jaundice, premature infant medical support.',
    descriptionUr: 'قبل از وقت پیدا ہونے والے بچوں کے لیے انکیوبیٹر، فوٹو تھراپی اور ماہرانہ نگہداشت۔',
    isAvailable24x7: true,
    standardFeePKR: 1500,
    featured: true,
  },
  {
    id: 'srv-ped-2',
    departmentId: 'dept-pediatrics',
    nameEn: 'General Pediatric Consultation & EPI Vaccination',
    nameUr: 'بچوں کا او پی ڈی معائنہ اور حفاظتی ٹیکہ جات',
    category: 'pediatric',
    descriptionEn: 'Comprehensive growth and developmental screening, routine immunization against preventable childhood illnesses, pediatric acute infections.',
    descriptionUr: 'بچوں کے تمام عمومی امراض، نشوونما کا جائزہ اور حفاظتی ٹیکے لگانے کی مکمل سہولت۔',
    isAvailable24x7: false,
    standardFeePKR: 1500,
    featured: true,
  },
  {
    id: 'srv-med-1',
    departmentId: 'dept-general-medicine',
    nameEn: 'Family Physician Primary Care & Chronic Disease Management',
    nameUr: 'فیملی فزیشن اور پرانے امراض کا طویل المدتی علاج',
    category: 'family_medicine',
    descriptionEn: 'Expert medical diagnosis and continuous management for Diabetes Type 1 & 2, Hypertension, Thyroid disorders, seasonal infections.',
    descriptionUr: 'ذیابیطس، ہائی بلڈ پریشر، تھائرائیڈ اور موسمی بیماریوں کا مستند و معیاری علاج۔',
    isAvailable24x7: true,
    standardFeePKR: 1500,
    featured: true,
  },
  {
    id: 'srv-resp-1',
    departmentId: 'dept-respiratory',
    nameEn: 'Pulmonary Care, Nebulization & Asthma Therapy',
    nameUr: 'سانس و پھیپھڑوں کے امراض، دمہ اور فوری نیبولائزیشن',
    category: 'respiratory',
    descriptionEn: 'Dedicated respiratory nebulization station, peak flow measurement, acute asthma crisis stabilization, COPD long-term maintenance.',
    descriptionUr: 'دمہ، الرجی، سینے کے انفیکشن اور کھانسی کے لیے فوری نیبولائزر کی 24 گھنٹے سہولت۔',
    isAvailable24x7: true,
    standardFeePKR: 1200,
    featured: true,
  },
  {
    id: 'srv-card-1',
    departmentId: 'dept-cardiology',
    nameEn: 'Cardiovascular Risk Screening & 12-Lead ECG',
    nameUr: 'دل کے امراض کی ابتدائی تشخیص اور 12-لیڈ ای سی جی',
    category: 'cardiology',
    descriptionEn: 'High-precision resting 12-lead Electrocardiogram (ECG), arrhythmia detection, emergency cardiac referral triage, angina evaluation.',
    descriptionUr: 'جدید ڈیجیٹل ای سی جی، دل کی دھڑکن اور بلڈ پریشر کا فوری اور مستند تجزیہ۔',
    isAvailable24x7: true,
    standardFeePKR: 1000,
    featured: true,
  },
  {
    id: 'srv-lab-1',
    departmentId: 'dept-laboratory',
    nameEn: '24/7 Clinical Diagnostic Pathology Lab',
    nameUr: 'چوبیس گھنٹے کلینیکل لیبارٹری اور تشخیصی ٹیسٹ',
    category: 'laboratory',
    descriptionEn: 'Rapid automated blood analysis (CBC), blood sugar, lipid profile, liver & renal function tests (LFT/RFT), urine toxicology & pregnancy testing.',
    descriptionUr: 'خون اور پیشاب کے فوری لیب ٹیسٹ، شوگر اور جگر و گردوں کے ٹیسٹ کی فوری رپورٹنگ۔',
    isAvailable24x7: true,
    standardFeePKR: 500,
    featured: true,
  },
  {
    id: 'srv-emg-1',
    departmentId: 'dept-emergency',
    nameEn: '24/7 Acute Emergency & Minor Surgical Unit',
    nameUr: 'چوبیس گھنٹے ایمرجنسی وارڈ اور ابتدائی طبی امداد',
    category: 'emergency',
    descriptionEn: 'Trauma wound debridement, sterile stitching, intravenous fluid resuscitation, burn dressing, emergency acute medical stabilization.',
    descriptionUr: 'کسی بھی حادثے یا ہنگامی صورتحال میں فوری فرسٹ ایڈ، ڈریسنگ اور جان بچانے والی ادویات۔',
    isAvailable24x7: true,
    standardFeePKR: 1000,
    featured: true,
  }
];

export const INITIAL_ADMINS: StoredAdminAccount[] = [
  {
    id: 'sa-master',
    name: 'Dr. Nadir Hussain Dullu (Super Admin)',
    email: 'nh979681@gmail.com',
    mobile: '+92 340 4777745',
    role: 'super_admin',
    status: 'active',
    permissions: [...ALL_PERMISSIONS],
    passwordHash: hashPassword('fazal381381'),
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLogin: '2026-09-16T08:00:00.000Z',
    createdBy: 'System Root',
  },
  {
    id: 'adm-staff-1',
    name: 'Hospital Reception & OPD Admin Desk',
    email: 'admin@gulzarhospital.com',
    mobile: '+92 300 1234567',
    role: 'admin',
    status: 'active',
    permissions: [
      'appointments.view',
      'appointments.create',
      'appointments.edit',
      'appointments.cancel',
      'patients.view',
      'reports.view',
    ],
    passwordHash: hashPassword('hospitaladmin123'),
    createdAt: '2026-02-01T00:00:00.000Z',
    lastLogin: '2026-09-15T14:30:00.000Z',
    createdBy: 'Dr. Nadir Hussain Dullu (Super Admin)',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-seed-1',
    userId: 'sa-master',
    userName: 'Dr. Nadir Hussain Dullu',
    userRole: 'super_admin',
    action: 'System Initialized & Security Policies Applied',
    timestamp: '2026-09-10T10:00:00.000Z',
    affectedRecord: 'SYSTEM_BOOT',
    newValue: 'Role-Based Access Control activated with zero-trust isolation',
    ipAddress: '127.0.0.1',
  },
  {
    id: 'aud-seed-2',
    userId: 'sa-master',
    userName: 'Dr. Nadir Hussain Dullu',
    userRole: 'super_admin',
    action: 'Created Staff Administrator Account',
    timestamp: '2026-09-12T11:20:00.000Z',
    affectedRecord: 'adm-staff-1 (admin@gulzarhospital.com)',
    newValue: 'Granted appointment and patient view permissions',
    ipAddress: '127.0.0.1',
  },
];


function getDbFilePath(): string {
  const preferredPath = path.join(process.cwd(), 'data', 'hospital_db.json');
  try {
    const dir = path.dirname(preferredPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // Test write permission
    const testFile = path.join(dir, '.write_test');
    fs.writeFileSync(testFile, '1');
    fs.unlinkSync(testFile);
    return preferredPath;
  } catch (e) {
    // If working directory is read-only or not writable, fallback to /tmp
    return path.join('/tmp', 'hospital_db.json');
  }
}

const DB_FILE_PATH = getDbFilePath();

// Ensure directory exists
function ensureDbDir() {
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (e) {
      console.warn('Could not create directory for database:', e);
    }
  }
}

// In-memory single source of truth
let db: HospitalDatabaseSchema = {
  doctors: [...INITIAL_DOCTORS],
  appointments: [...INITIAL_APPOINTMENTS],
  hospitalEvents: [...INITIAL_HOSPITAL_EVENTS],
  hospitalInfo: { ...HOSPITAL_INFO },
  departments: [...INITIAL_DEPARTMENTS],
  whatsappLogs: [
    {
      id: 'wa-1',
      appointmentId: 'GFH-2026-101',
      recipientName: 'Ali Raza',
      recipientPhone: '+923001234567',
      templateType: 'payment_confirmation',
      messageEn: `Dear Ali Raza, Your payment for Gulzar Family Hospital & Children Center has been received/verified. Appointment ID: GFH-2026-101.`,
      messageUr: `محترم Ali Raza، Gulzar Family Hospital & Children Center میں آپ کی ادائیگی موصول/تصدیق ہو گئی ہے۔`,
      status: 'delivered',
      timestamp: new Date().toISOString(),
    },
  ],
  admins: [...INITIAL_ADMINS],
  auditLogs: [...INITIAL_AUDIT_LOGS],
  services: [...INITIAL_SERVICES],
  systemSettings: {
    hospitalRegistrationNo: 'GFH-PB-2026-889',
    pmdcAuthorityNotice: 'All doctors and specialists are PMDC certified and authorized',
    emergencyHotline: '+92 340 4777745',
    defaultSlotDurationMinutes: 15,
    auditRetentionDays: 365,
    requireTwoFactorForSuperAdmin: false,
    onlineBookingGracePeriodMinutes: 30,
    maxAppointmentsPerPatientPerDay: 3,
    lastSecurityAuditDate: '2026-09-16T08:00:00.000Z',
  },
  lastUpdated: new Date().toISOString(),
};

// Auto-load on boot if file exists
export function initDatabase() {
  ensureDbDir();
  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.doctors) && Array.isArray(parsed.appointments)) {
        db = {
          doctors: parsed.doctors || INITIAL_DOCTORS,
          appointments: parsed.appointments || INITIAL_APPOINTMENTS,
          hospitalEvents: parsed.hospitalEvents || INITIAL_HOSPITAL_EVENTS,
          hospitalInfo: parsed.hospitalInfo || HOSPITAL_INFO,
          departments: parsed.departments || INITIAL_DEPARTMENTS,
          whatsappLogs: parsed.whatsappLogs || [],
          admins: Array.isArray(parsed.admins) && parsed.admins.length > 0 ? parsed.admins : [...INITIAL_ADMINS],
          auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [...INITIAL_AUDIT_LOGS],
          services: Array.isArray(parsed.services) && parsed.services.length > 0 ? parsed.services : [...INITIAL_SERVICES],
          systemSettings: parsed.systemSettings || db.systemSettings,
          lastUpdated: parsed.lastUpdated || new Date().toISOString(),
        };

        // Enforce Master Super Admin presence and inviolability
        const hasMasterSuperAdmin = db.admins.some((a) => a.email.toLowerCase() === 'nh979681@gmail.com');
        if (!hasMasterSuperAdmin) {
          db.admins.unshift(INITIAL_ADMINS[0]);
        } else {
          // Guarantee super_admin role and active status
          const master = db.admins.find((a) => a.email.toLowerCase() === 'nh979681@gmail.com')!;
          master.role = 'super_admin';
          master.status = 'active';
          master.permissions = [...ALL_PERMISSIONS];
        }

        console.log(`[DB] Successfully loaded hospital database from ${DB_FILE_PATH}`);
      }
    } catch (err) {
      console.error('[DB] Failed to parse database file, falling back to seed data:', err);
    }
  } else {
    saveDatabase();
  }

  // Prune expired events initially
  pruneExpiredEvents();
}

export function saveDatabase() {
  ensureDbDir();
  db.lastUpdated = new Date().toISOString();
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error writing database to file:', err);
  }
}

// Automatically prune expired dates for events
export function pruneExpiredEvents(): number {
  const today = new Date().toISOString().split('T')[0];
  const initialCount = db.hospitalEvents.length;

  // Filter out events that ended before today
  db.hospitalEvents = db.hospitalEvents.filter((evt) => {
    const end = evt.endDate || evt.startDate;
    return end >= today;
  });

  const removedCount = initialCount - db.hospitalEvents.length;
  if (removedCount > 0) {
    saveDatabase();
  }
  return removedCount;
}

// DOCTORS CRUD & AVAILABILITY
export function getDoctors(): Doctor[] {
  return db.doctors;
}

export function updateDoctorSchedule(updatedDoctor: Doctor): Doctor | null {
  const index = db.doctors.findIndex((d) => d.id === updatedDoctor.id);
  if (index === -1) return null;

  db.doctors[index] = {
    ...db.doctors[index],
    ...updatedDoctor,
  };
  saveDatabase();
  return db.doctors[index];
}

export function toggleDoctorAvailability(
  doctorId: string,
  isAvailable: boolean,
  unavailabilityReason?: string
): Doctor | null {
  const doctor = db.doctors.find((d) => d.id === doctorId);
  if (!doctor) return null;

  doctor.isAvailable = isAvailable;
  doctor.unavailabilityReason = isAvailable ? '' : (unavailabilityReason || 'On Leave / Off-Duty');
  saveDatabase();
  return doctor;
}

// APPOINTMENTS
export function getAppointments(): Appointment[] {
  return db.appointments;
}

export function createAppointment(newAppt: Appointment): Appointment {
  db.appointments.unshift(newAppt);
  saveDatabase();
  return newAppt;
}

export function cancelAppointment(id: string): Appointment | null {
  const appt = db.appointments.find((a) => a.id === id);
  if (!appt) return null;

  appt.status = 'cancelled';
  appt.updatedAt = new Date().toLocaleString();
  saveDatabase();
  return appt;
}

export function rescheduleAppointment(id: string, date: string, time: string): Appointment | null {
  const appt = db.appointments.find((a) => a.id === id);
  if (!appt) return null;

  appt.date = date;
  appt.time = time;
  appt.status = 'confirmed';
  appt.updatedAt = new Date().toLocaleString();
  saveDatabase();
  return appt;
}

export function updateAppointmentPayment(
  id: string,
  paymentMethod: any,
  paymentReference: string,
  paymentScreenshotUrl?: string
): Appointment | null {
  const appt = db.appointments.find((a) => a.id === id);
  if (!appt) return null;

  appt.paymentMethod = paymentMethod;
  appt.paymentReference = paymentReference;
  if (paymentScreenshotUrl) {
    appt.paymentScreenshotUrl = paymentScreenshotUrl;
  }
  appt.status = 'payment_submitted';
  appt.updatedAt = new Date().toLocaleString();
  saveDatabase();
  return appt;
}

export function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  extra?: Partial<Appointment>
): Appointment | null {
  const appt = db.appointments.find((a) => a.id === id);
  if (!appt) return null;

  appt.status = status;
  if (extra) {
    Object.assign(appt, extra);
  }
  appt.updatedAt = new Date().toLocaleString();
  saveDatabase();
  return appt;
}

export function refundAppointment(
  id: string,
  refundReason: string,
  refundAmount?: number
): Appointment | null {
  const appt = db.appointments.find((a) => a.id === id);
  if (!appt) return null;

  appt.status = 'refunded';
  appt.paymentStatus = 'refunded';
  appt.refundReason = refundReason;
  appt.refundAmount = refundAmount || appt.feePKR;
  appt.refundedAt = new Date().toLocaleString();
  appt.updatedAt = new Date().toLocaleString();
  saveDatabase();
  return appt;
}

export function verifyAppointment(
  id: string,
  action: 'approve' | 'reject' | 'checkin' | 'complete' | 'cancel' | 'refund',
  notes?: string
): Appointment | null {
  const appt = db.appointments.find((a) => a.id === id);
  if (!appt) return null;

  if (action === 'approve') {
    appt.status = 'confirmed';
    if (!appt.paymentStatus || appt.paymentStatus === 'pending') {
      appt.paymentStatus = appt.bookingOption === 'pay_at_hospital' ? 'pay_at_hospital' : 'paid_online';
    }
    if (notes) appt.notes = notes;
  } else if (action === 'reject') {
    appt.status = 'pending_payment';
    appt.notes = notes || 'Payment rejected. Re-submit reference.';
  } else if (action === 'checkin') {
    appt.status = 'checked_in';
  } else if (action === 'complete') {
    appt.status = 'completed';
  } else if (action === 'cancel') {
    appt.status = 'cancelled';
    if (notes) appt.notes = notes;
  } else if (action === 'refund') {
    appt.status = 'refunded';
    appt.paymentStatus = 'refunded';
    appt.refundReason = notes || 'Refund issued by administrator';
    appt.refundAmount = appt.feePKR;
    appt.refundedAt = new Date().toLocaleString();
  }

  appt.updatedAt = new Date().toLocaleString();
  saveDatabase();
  return appt;
}

// HOSPITAL EVENTS & DATES
export function getHospitalEvents(includeExpired = false): HospitalEvent[] {
  const today = new Date().toISOString().split('T')[0];
  if (includeExpired) {
    return db.hospitalEvents;
  }
  return db.hospitalEvents.filter((e) => (e.endDate || e.startDate) >= today);
}

export function createHospitalEvent(eventData: Omit<HospitalEvent, 'id' | 'createdAt' | 'updatedAt'>): HospitalEvent {
  const newEvent: HospitalEvent = {
    ...eventData,
    id: `evt-${Date.now()}-${Math.floor(10 + Math.random() * 90)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.hospitalEvents.unshift(newEvent);
  saveDatabase();
  return newEvent;
}

export function updateHospitalEvent(id: string, updates: Partial<HospitalEvent>): HospitalEvent | null {
  const index = db.hospitalEvents.findIndex((e) => e.id === id);
  if (index === -1) return null;

  db.hospitalEvents[index] = {
    ...db.hospitalEvents[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveDatabase();
  return db.hospitalEvents[index];
}

export function deleteHospitalEvent(id: string): boolean {
  const initialLen = db.hospitalEvents.length;
  db.hospitalEvents = db.hospitalEvents.filter((e) => e.id !== id);
  if (db.hospitalEvents.length !== initialLen) {
    saveDatabase();
    return true;
  }
  return false;
}

// HOSPITAL INFO & ANNOUNCEMENTS
export function getHospitalInfo(): HospitalInfoData {
  return db.hospitalInfo;
}

export function updateHospitalInfo(updates: Partial<HospitalInfoData>): HospitalInfoData {
  db.hospitalInfo = {
    ...db.hospitalInfo,
    ...updates,
    lastUpdated: new Date().toISOString(),
  };
  saveDatabase();
  return db.hospitalInfo;
}

// DEPARTMENTS
export function getDepartments(): HospitalDepartment[] {
  return db.departments;
}

export function updateDepartments(departments: HospitalDepartment[]): HospitalDepartment[] {
  db.departments = departments;
  saveDatabase();
  return db.departments;
}

// WHATSAPP LOGS
export function getWhatsAppLogs(): WhatsAppLog[] {
  return db.whatsappLogs;
}

export function addWhatsAppLog(log: WhatsAppLog) {
  db.whatsappLogs.unshift(log);
  if (db.whatsappLogs.length > 200) {
    db.whatsappLogs = db.whatsappLogs.slice(0, 200);
  }
  saveDatabase();
}

// STATS
export function getStats() {
  const total = db.appointments.length;
  const pending = db.appointments.filter((a) => a.status === 'pending_payment' || a.status === 'payment_submitted').length;
  const verified = db.appointments.filter(
    (a) => a.status === 'confirmed' || a.status === 'payment_verified' || a.status === 'completed' || a.status === 'checked_in'
  ).length;
  const cancelled = db.appointments.filter((a) => a.status === 'cancelled').length;

  const totalRevenue = db.appointments
    .filter((a) => a.status === 'confirmed' || a.status === 'payment_verified' || a.status === 'completed' || a.status === 'checked_in')
    .reduce((sum, a) => sum + (a.feePKR || 0), 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRevenue = db.appointments
    .filter((a) => a.date === todayStr && (a.status === 'confirmed' || a.status === 'payment_verified' || a.status === 'completed'))
    .reduce((sum, a) => sum + (a.feePKR || 0), 0);

  const jazzCashCount = db.appointments.filter((a) => a.paymentMethod === 'jazzcash').length;
  const easyPaisaCount = db.appointments.filter((a) => a.paymentMethod === 'easypaisa').length;

  return {
    total,
    pending,
    verified,
    cancelled,
    totalRevenue,
    todayRevenue,
    jazzCashCount,
    easyPaisaCount,
  };
}

// FULL SNAPSHOT FOR REAL-TIME STREAMING & CHATBOT
export function getLiveSyncPayload(): LiveSyncPayload {
  pruneExpiredEvents();
  return {
    doctors: db.doctors,
    appointments: db.appointments,
    hospitalEvents: getHospitalEvents(false),
    hospitalInfo: db.hospitalInfo,
    departments: db.departments,
    stats: getStats(),
    lastUpdated: db.lastUpdated,
  };
}

// Generate comprehensive dynamic system prompt snapshot for the AI Chatbot
export function getLiveHospitalSnapshotText(): string {
  const info = db.hospitalInfo;
  const events = getHospitalEvents(false);
  const doctors = db.doctors;
  const departments = db.departments;

  let prompt = `=== LIVE HOSPITAL DATABASE SNAPSHOT (TIMESTAMP: ${new Date().toISOString()}) ===\n`;
  prompt += `HOSPITAL IDENTITY & CONTACT:\n`;
  prompt += `- Official Name: ${info.name} (${info.nameUr})\n`;
  prompt += `- Address: ${info.addressEn}\n`;
  prompt += `- Landmark: Opposite ZTBL Bank, Fatehpur Road, Ward #4, Chowk Azam\n`;
  prompt += `- Official Google Maps Link: ${info.googleMapsUrl || 'https://share.google/nClgUpNiP0qDg6Dpe'}\n`;
  prompt += `- GPS Coordinates: 30.9628° N, 71.2125° E\n`;
  prompt += `- Phone / Emergency Helpline: ${info.phone}\n`;
  prompt += `- WhatsApp Official: ${info.whatsApp}\n`;
  prompt += `- Visiting Hours: ${info.visitingHoursEn || 'Morning 10 AM - 1 PM, Evening 5 PM - 8 PM'}\n`;
  prompt += `- General OPD Hours: ${info.opdTimingsEn || 'Mon-Sat: 09:00 AM - 02:00 PM & 04:00 PM - 08:00 PM'}\n`;
  prompt += `- 24/7 Services: Emergency Room, Labor Suite, Delivery, NICU Incubator Nursery & Pharmacy\n`;
  prompt += `- Active Emergency Notice: ${info.emergencyNoticeEn || 'All emergency facilities 24/7 open.'}\n`;
  prompt += `- Active Announcement: ${info.activeAnnouncementEn || 'None'}\n\n`;

  prompt += `ABOUT US, VISION & MISSION:\n`;
  prompt += `- About Us: Gulzar Family Hospital & Children Center is a modern, patient-centered healthcare facility dedicated to comprehensive, compassionate, accessible care for individuals and families at every stage of life. Located on Fatehpur Road, in front of ZTBL Bank, Chowk Azam.\n`;
  prompt += `- Mission: To provide safe, reliable, evidence-based healthcare close to home while treating every patient with dignity, respect, and compassion.\n`;
  prompt += `- Vision: To become a trusted healthcare center for the people of Chowk Azam, Layyah and surrounding areas, providing modern medical services, qualified healthcare professionals, advanced diagnostics, and family-centered care.\n`;
  prompt += `- Core Values: Patient Safety, Compassion, Integrity, Professionalism, Accessibility, Respect, Continuous Improvement.\n`;
  prompt += `- Tagline: Your Family's Health in Safe Hands\n\n`;

  prompt += `PAYMENT METHODS:\n`;
  prompt += `- JazzCash Account: ${info.jazzCash} (Title: Gulzar Family Hospital)\n`;
  prompt += `- Easypaisa Account: ${info.easyPaisa} (Title: Gulzar Family Hospital)\n`;
  prompt += `- Hospital Counter: Cash accepted at OPD reception counter\n\n`;

  prompt += `CURRENT DOCTORS & LIVE AVAILABILITY STATUS:\n`;
  for (const doc of doctors) {
    prompt += `• ${doc.nameEn} (${doc.nameUr})\n`;
    prompt += `  - Department: ${doc.departmentEn}\n`;
    prompt += `  - Specialty: ${doc.specialtyEn}\n`;
    prompt += `  - Qualifications: ${doc.qualificationEn} (PMDC: ${doc.pmdcRegistration || 'Registered'})\n`;
    prompt += `  - Experience: ${doc.experienceYears}+ years\n`;
    prompt += `  - OPD Fee: PKR ${doc.feePKR} | Video Consultation Fee: PKR ${doc.onlineFeePKR}\n`;
    prompt += `  - Working Days: ${doc.workingDays.join(', ')}\n`;
    prompt += `  - Working Hours: ${doc.startTime} to ${doc.endTime}\n`;
    prompt += `  - CURRENT STATUS: ${doc.isAvailable ? '✅ AVAILABLE FOR APPOINTMENTS' : `❌ ON LEAVE / UNAVAILABLE (${doc.unavailabilityReason || 'Off-Duty'})`}\n`;
  }
  prompt += `\n`;

  prompt += `CURRENT UPCOMING EVENTS, MEDICAL CAMPS & HOLIDAYS (Live Database):\n`;
  if (events.length === 0) {
    prompt += `- No upcoming special camps currently scheduled. Regular 24/7 emergency & OPD services active.\n`;
  } else {
    for (const evt of events) {
      prompt += `• [${evt.category.toUpperCase()}] ${evt.titleEn} (${evt.titleUr})\n`;
      prompt += `  - Dates: ${evt.startDate} to ${evt.endDate} (${evt.timeRangeEn || 'Normal hours'})\n`;
      prompt += `  - Location: ${evt.locationEn}\n`;
      prompt += `  - Doctor in Charge: ${evt.doctorInChargeEn || 'Hospital Staff'}\n`;
      prompt += `  - Cost: ${evt.isFree ? 'FREE OF COST' : 'Standard Hospital Rates'}\n`;
      prompt += `  - Registration: ${evt.registrationOpen ? 'Open (Can register or book token online)' : 'Closed'}\n`;
      prompt += `  - Details: ${evt.descriptionEn}\n`;
    }
  }
  prompt += `\n`;

  prompt += `CLINICAL DEPARTMENTS:\n`;
  for (const dept of departments) {
    prompt += `• ${dept.nameEn} (Head: ${dept.headDoctorEn}, 24/7: ${dept.is24x7 ? 'Yes' : 'No'}, Timings: ${dept.timingsEn})\n`;
  }

  prompt += `=== END OF LIVE DATABASE SNAPSHOT ===\n`;
  return prompt;
}

// ==========================================
// ROLE-BASED ACCESS CONTROL & AUDIT LOGS
// ==========================================

export function getAdmins(): AdminAccount[] {
  return db.admins.map(({ passwordHash, ...safeAdmin }) => safeAdmin);
}

export function getAdminById(id: string): StoredAdminAccount | null {
  return db.admins.find((a) => a.id === id) || null;
}

export function getAdminByEmailOrMobile(identifier: string): StoredAdminAccount | null {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  const cleanMobile = identifier.trim().replace(/[\s\-]/g, '');

  return (
    db.admins.find((a) => {
      const emailMatch = a.email.toLowerCase() === clean;
      const mobileMatch = a.mobile.replace(/[\s\-]/g, '').includes(cleanMobile) || cleanMobile.includes(a.mobile.replace(/[\s\-]/g, ''));
      return emailMatch || mobileMatch;
    }) || null
  );
}

export function createAdminAccount(
  data: {
    name: string;
    email: string;
    mobile: string;
    password: string;
    role?: 'super_admin' | 'admin';
    permissions?: AdminPermission[];
  },
  actor: { id: string; name: string; role: string; ipAddress?: string }
): { success: boolean; admin?: AdminAccount; error?: string } {
  if (actor.role !== 'super_admin') {
    return { success: false, error: 'Access Denied — Super Admin authorization required.' };
  }

  const cleanEmail = data.email.trim().toLowerCase();
  const existing = db.admins.find((a) => a.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, error: 'An administrator with this email address already exists.' };
  }

  const newId = `adm-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const assignedRole = data.role === 'super_admin' ? 'super_admin' : 'admin';
  const assignedPermissions = assignedRole === 'super_admin' ? [...ALL_PERMISSIONS] : (data.permissions || [
    'appointments.view',
    'appointments.create',
    'appointments.edit',
    'appointments.cancel',
    'patients.view',
  ]);

  const newAdmin: StoredAdminAccount = {
    id: newId,
    name: data.name.trim(),
    email: cleanEmail,
    mobile: data.mobile.trim(),
    role: assignedRole,
    status: 'active',
    permissions: assignedPermissions,
    passwordHash: hashPassword(data.password),
    createdAt: new Date().toISOString(),
    createdBy: actor.name,
  };

  db.admins.push(newAdmin);
  saveDatabase();

  recordAuditLog({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role as any,
    action: `Added Administrator ${newAdmin.name} (${newAdmin.email})`,
    affectedRecord: newAdmin.id,
    newValue: JSON.stringify({ role: newAdmin.role, permissions: newAdmin.permissions }),
    ipAddress: actor.ipAddress,
  });

  const { passwordHash, ...safe } = newAdmin;
  return { success: true, admin: safe };
}

export function updateAdminAccount(
  id: string,
  updates: {
    name?: string;
    mobile?: string;
    role?: 'super_admin' | 'admin';
    permissions?: AdminPermission[];
    status?: 'active' | 'disabled';
  },
  actor: { id: string; name: string; role: string; ipAddress?: string }
): { success: boolean; admin?: AdminAccount; error?: string } {
  if (actor.role !== 'super_admin') {
    return { success: false, error: 'Access Denied — Super Admin authorization required.' };
  }

  const adminIndex = db.admins.findIndex((a) => a.id === id);
  if (adminIndex === -1) {
    return { success: false, error: 'Administrator account not found.' };
  }

  const current = db.admins[adminIndex];

  // Inviolability of Master Super Admin
  if (current.id === 'sa-master' || current.email.toLowerCase() === 'nh979681@gmail.com') {
    if (updates.status === 'disabled') {
      return { success: false, error: 'Super Admin account cannot be disabled, restricted, or removed.' };
    }
    if (updates.role && updates.role !== 'super_admin') {
      return { success: false, error: 'Super Admin role cannot be modified or downgraded.' };
    }
  }

  const previousValue = JSON.stringify({
    name: current.name,
    role: current.role,
    status: current.status,
    permissions: current.permissions,
  });

  db.admins[adminIndex] = {
    ...current,
    name: updates.name !== undefined ? updates.name.trim() : current.name,
    mobile: updates.mobile !== undefined ? updates.mobile.trim() : current.mobile,
    role: updates.role !== undefined ? updates.role : current.role,
    status: updates.status !== undefined ? updates.status : current.status,
    permissions: updates.permissions !== undefined ? updates.permissions : current.permissions,
  };

  saveDatabase();

  const updated = db.admins[adminIndex];
  const newValue = JSON.stringify({
    name: updated.name,
    role: updated.role,
    status: updated.status,
    permissions: updated.permissions,
  });

  recordAuditLog({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role as any,
    action: `Updated Administrator Account ${updated.name}`,
    affectedRecord: updated.id,
    previousValue,
    newValue,
    ipAddress: actor.ipAddress,
  });

  const { passwordHash, ...safe } = updated;
  return { success: true, admin: safe };
}

export function toggleAdminStatus(
  id: string,
  status: 'active' | 'disabled',
  actor: { id: string; name: string; role: string; ipAddress?: string }
): { success: boolean; admin?: AdminAccount; error?: string } {
  if (actor.role !== 'super_admin') {
    return { success: false, error: 'Access Denied — Super Admin authorization required.' };
  }

  const admin = db.admins.find((a) => a.id === id);
  if (!admin) {
    return { success: false, error: 'Administrator account not found.' };
  }

  if (admin.id === 'sa-master' || admin.email.toLowerCase() === 'nh979681@gmail.com') {
    return { success: false, error: 'Super Admin account cannot be disabled.' };
  }

  const prevStatus = admin.status;
  admin.status = status;
  saveDatabase();

  recordAuditLog({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role as any,
    action: `${status === 'active' ? 'Enabled' : 'Disabled'} Administrator Account ${admin.name}`,
    affectedRecord: admin.id,
    previousValue: prevStatus,
    newValue: status,
    ipAddress: actor.ipAddress,
  });

  const { passwordHash, ...safe } = admin;
  return { success: true, admin: safe };
}

export function deleteAdminAccount(
  id: string,
  actor: { id: string; name: string; role: string; ipAddress?: string }
): { success: boolean; error?: string } {
  if (actor.role !== 'super_admin') {
    return { success: false, error: 'Access Denied — Super Admin authorization required.' };
  }

  const adminIndex = db.admins.findIndex((a) => a.id === id);
  if (adminIndex === -1) {
    return { success: false, error: 'Administrator account not found.' };
  }

  const target = db.admins[adminIndex];
  if (target.id === 'sa-master' || target.email.toLowerCase() === 'nh979681@gmail.com') {
    return { success: false, error: 'Super Admin account cannot be deleted or removed.' };
  }

  db.admins.splice(adminIndex, 1);
  saveDatabase();

  recordAuditLog({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role as any,
    action: `Permanently Removed Administrator Account ${target.name} (${target.email})`,
    affectedRecord: target.id,
    previousValue: JSON.stringify({ name: target.name, email: target.email, role: target.role }),
    newValue: 'DELETED',
    ipAddress: actor.ipAddress,
  });

  return { success: true };
}

export function resetAdminPassword(
  id: string,
  newPass: string,
  actor: { id: string; name: string; role: string; ipAddress?: string }
): { success: boolean; error?: string } {
  if (actor.role !== 'super_admin' && actor.id !== id) {
    return { success: false, error: 'Access Denied — Super Admin authorization required.' };
  }

  const admin = db.admins.find((a) => a.id === id);
  if (!admin) {
    return { success: false, error: 'Administrator account not found.' };
  }

  admin.passwordHash = hashPassword(newPass);
  saveDatabase();

  recordAuditLog({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role as any,
    action: `Reset Password for Administrator ${admin.name}`,
    affectedRecord: admin.id,
    newValue: 'PASSWORD_CHANGED',
    ipAddress: actor.ipAddress,
  });

  return { success: true };
}

export function recordAuditLog(log: Omit<AuditLogEntry, 'id' | 'timestamp'> & { timestamp?: string }): AuditLogEntry {
  const newEntry: AuditLogEntry = {
    id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: log.timestamp || new Date().toISOString(),
    userId: log.userId,
    userName: log.userName,
    userRole: log.userRole,
    action: log.action,
    affectedRecord: log.affectedRecord,
    previousValue: log.previousValue,
    newValue: log.newValue,
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
  };

  db.auditLogs.unshift(newEntry);
  if (db.auditLogs.length > 1000) {
    db.auditLogs = db.auditLogs.slice(0, 1000);
  }
  saveDatabase();
  return newEntry;
}

export function getAuditLogs(limit = 100, filterAction?: string): AuditLogEntry[] {
  let logs = db.auditLogs;
  if (filterAction && filterAction !== 'all') {
    logs = logs.filter((l) => l.action.toLowerCase().includes(filterAction.toLowerCase()));
  }
  return logs.slice(0, limit);
}

// ==========================================
// CLINICAL SERVICES MANAGEMENT
// ==========================================

export function getHospitalServices(): HospitalClinicalService[] {
  return db.services || INITIAL_SERVICES;
}

export function createHospitalService(
  service: Omit<HospitalClinicalService, 'id'>,
  actor: { id: string; name: string; role: string }
): HospitalClinicalService {
  const newService: HospitalClinicalService = {
    ...service,
    id: `srv-${Date.now().toString(36)}`,
  };
  db.services.unshift(newService);
  saveDatabase();

  recordAuditLog({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role as any,
    action: `Added Hospital Clinical Service: ${newService.nameEn}`,
    affectedRecord: newService.id,
    newValue: JSON.stringify(newService),
  });

  return newService;
}

export function updateHospitalService(
  id: string,
  updates: Partial<HospitalClinicalService>,
  actor: { id: string; name: string; role: string }
): HospitalClinicalService | null {
  const idx = db.services.findIndex((s) => s.id === id);
  if (idx === -1) return null;

  const current = db.services[idx];
  db.services[idx] = { ...current, ...updates };
  saveDatabase();

  recordAuditLog({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role as any,
    action: `Updated Hospital Clinical Service: ${db.services[idx].nameEn}`,
    affectedRecord: id,
    newValue: JSON.stringify(updates),
  });

  return db.services[idx];
}

export function deleteHospitalService(
  id: string,
  actor: { id: string; name: string; role: string }
): boolean {
  const idx = db.services.findIndex((s) => s.id === id);
  if (idx === -1) return false;

  const target = db.services[idx];
  db.services.splice(idx, 1);
  saveDatabase();

  recordAuditLog({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role as any,
    action: `Removed Hospital Clinical Service: ${target.nameEn}`,
    affectedRecord: id,
    previousValue: target.nameEn,
  });

  return true;
}

// ==========================================
// SYSTEM SETTINGS
// ==========================================

export function getSystemSettings() {
  return db.systemSettings;
}

export function updateSystemSettings(
  updates: Partial<HospitalDatabaseSchema['systemSettings']>,
  actor: { id: string; name: string; role: string }
) {
  const prev = JSON.stringify(db.systemSettings);
  db.systemSettings = {
    ...db.systemSettings,
    ...updates,
    lastSecurityAuditDate: new Date().toISOString(),
  };
  saveDatabase();

  recordAuditLog({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role as any,
    action: 'Updated Hospital Administrative & Security System Settings',
    affectedRecord: 'SYSTEM_SETTINGS',
    previousValue: prev,
    newValue: JSON.stringify(updates),
  });

  return db.systemSettings;
}

