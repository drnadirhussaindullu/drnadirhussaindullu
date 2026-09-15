import fs from 'fs';
import path from 'path';
import {
  Doctor,
  Appointment,
  HospitalEvent,
  HospitalInfoData,
  HospitalDepartment,
  WhatsAppLog,
  LiveSyncPayload,
} from '../src/types';
import {
  INITIAL_DOCTORS,
  INITIAL_APPOINTMENTS,
  HOSPITAL_INFO,
  INITIAL_HOSPITAL_EVENTS,
  INITIAL_DEPARTMENTS,
} from '../src/data/mockData';

export interface HospitalDatabaseSchema {
  doctors: Doctor[];
  appointments: Appointment[];
  hospitalEvents: HospitalEvent[];
  hospitalInfo: HospitalInfoData;
  departments: HospitalDepartment[];
  whatsappLogs: WhatsAppLog[];
  lastUpdated: string;
}

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
          lastUpdated: parsed.lastUpdated || new Date().toISOString(),
        };
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

export function verifyAppointment(
  id: string,
  action: 'approve' | 'reject' | 'checkin' | 'complete' | 'cancel',
  notes?: string
): Appointment | null {
  const appt = db.appointments.find((a) => a.id === id);
  if (!appt) return null;

  if (action === 'approve') {
    appt.status = 'confirmed';
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
