import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  initDatabase,
  getDoctors,
  updateDoctorSchedule,
  toggleDoctorAvailability,
  getAppointments,
  createAppointment,
  cancelAppointment,
  rescheduleAppointment,
  updateAppointmentPayment,
  verifyAppointment,
  getHospitalEvents,
  createHospitalEvent,
  updateHospitalEvent,
  deleteHospitalEvent,
  pruneExpiredEvents,
  getHospitalInfo,
  updateHospitalInfo,
  getDepartments,
  updateDepartments,
  getWhatsAppLogs,
  addWhatsAppLog,
  getStats,
  getLiveSyncPayload,
  getLiveHospitalSnapshotText,
} from './server/db';
import { loginAdmin, verifyAdminSession, logoutAdmin } from './server/auth';
import { Doctor, Appointment, TimeSlot, WhatsAppLog } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Cloud Run and container health check probes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize Centralized Database on startup
initDatabase();

// SSE (Server-Sent Events) connection pool for Real-Time Synchronization
const sseClients = new Set<express.Response>();

function broadcastSync(eventType: string = 'data_updated', extraData: any = {}) {
  const payload = getLiveSyncPayload();
  const msg = `event: ${eventType}\ndata: ${JSON.stringify({ type: eventType, data: payload, ...extraData })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(msg);
    } catch (err) {
      sseClients.delete(client);
    }
  }
}

// Keep-alive heartbeat every 25 seconds for persistent SSE streams
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(':keep-alive\n\n');
    } catch (err) {
      sseClients.delete(client);
    }
  }
}, 25000);

// Temporary slot locks map: key = `${doctorId}_${date}_${time}`, value = timestamp
const lockedSlots = new Map<string, { lockedAt: number; sessionId: string }>();

// Helper: Generate time slots dynamically against live doctor availability & appointments
function generateDoctorTimeSlots(doctor: Doctor, dateStr: string): { slots: TimeSlot[]; isAvailable: boolean; reason?: string } {
  if (!doctor.isAvailable) {
    return {
      slots: [],
      isAvailable: false,
      reason: doctor.unavailabilityReason || 'Doctor is on official leave / unavailable today.',
    };
  }

  // Parse date safely without timezone day-shifting
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = daysOfWeek[dateObj.getDay()];

  if (doctor.workingDays && doctor.workingDays.length > 0 && !doctor.workingDays.includes(dayName)) {
    return {
      slots: [],
      isAvailable: false,
      reason: `Doctor does not have regular OPD on ${dayName}. Working days: ${doctor.workingDays.join(', ')}`,
    };
  }

  const formatTimeMinutes = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m < 10 ? `0${m}` : m;
    return `${displayH < 10 ? '0' + displayH : displayH}:${displayM} ${period}`;
  };

  const slotInterval = doctor.slotDurationMinutes || 15;
  const now = Date.now();
  const appointments = getAppointments();

  // Morning Shift: 08:00 AM (480 min) to 02:00 PM (840 min)
  // Evening Shift: 04:00 PM (960 min) to 08:00 PM (1200 min)
  const shiftRanges = [
    { name: 'morning' as const, start: 8 * 60, end: 14 * 60 },
    { name: 'evening' as const, start: 16 * 60, end: 20 * 60 },
  ];

  const slots: TimeSlot[] = [];

  for (const shiftRange of shiftRanges) {
    for (let current = shiftRange.start; current + slotInterval <= shiftRange.end; current += slotInterval) {
      const timeFormatted = formatTimeMinutes(current);
      const lockKey = `${doctor.id}_${dateStr}_${timeFormatted}`;

      // Check if booked in active appointments
      const existingBooking = appointments.find(
        (a) =>
          a.doctorId === doctor.id &&
          a.date === dateStr &&
          a.time === timeFormatted &&
          a.status !== 'cancelled'
      );

      // Check if locked (< 10 mins)
      const lockInfo = lockedSlots.get(lockKey);
      let isLocked = false;
      if (lockInfo) {
        if (now - lockInfo.lockedAt < 10 * 60 * 1000) {
          isLocked = true;
        } else {
          lockedSlots.delete(lockKey);
        }
      }

      slots.push({
        time: timeFormatted,
        isAvailable: !existingBooking && !isLocked,
        isLocked: isLocked,
        shift: shiftRange.name,
      });
    }
  }

  return { slots, isAvailable: true };
}

// Trigger simulated WhatsApp Notification & record in audit log
function triggerWhatsAppNotification(
  appointment: Appointment,
  templateType: WhatsAppLog['templateType'],
  customMessageEn?: string,
  customMessageUr?: string
) {
  let msgEn = customMessageEn || '';
  let msgUr = customMessageUr || '';

  if (!msgEn) {
    if (templateType === 'payment_confirmation' || templateType === 'appointment_confirmation') {
      msgEn = `Dear ${appointment.patientName},\n\nYour appointment/payment for Gulzar Family Hospital & Children Center has been recorded.\n\nAppointment ID: ${appointment.id}\nDoctor: ${appointment.doctorNameEn}\nDate: ${appointment.date}\nTime: ${appointment.time}\nConsultation Type: ${appointment.consultationType === 'hospital_visit' ? 'Hospital Visit' : 'Online Consultation'}\n\nAddress:\nFatehpur Road, In Front of ZTBL, Chowk Azam, Layyah.\n\nHelpline: +92 340 4777745\n\nThank you,\nGulzar Family Hospital & Children Center`;

      msgUr = `محترم ${appointment.patientName}،\n\nGulzar Family Hospital & Children Center میں آپ کی اپائنٹمنٹ/ادائیگی درج ہو گئی ہے۔\n\nاپائنٹمنٹ نمبر: ${appointment.id}\nڈاکٹر: ${appointment.doctorNameUr}\nتاریخ: ${appointment.date}\nوقت: ${appointment.time}\nنوعیت: ${appointment.consultationType === 'hospital_visit' ? 'ہسپتال وزٹ' : 'آن لائن کنسلٹیشن'}\n\nپتہ:\nFatehpur Road، ZTBL کے سامنے، چوک اعظم، ضلع لیہ۔\n\nرابطہ: +92 340 4777745۔\n\nشکریہ\nGulzar Family Hospital & Children Center`;
    } else if (templateType === 'cancellation') {
      msgEn = `Dear ${appointment.patientName}, your appointment ID ${appointment.id} with ${appointment.doctorNameEn} on ${appointment.date} has been cancelled. For queries or rescheduling: +92 340 4777745. Gulzar Family Hospital.`;
      msgUr = `محترم ${appointment.patientName}، آپ کی اپائنٹمنٹ نمبر ${appointment.id} منسوخ کر دی گئی ہے۔ دوبارہ بکنگ یا رہنمائی کے لیے رابطہ کریں: +92 340 4777745۔ گلزار فیملی ہسپتال۔`;
    } else if (templateType === 'reschedule') {
      msgEn = `Dear ${appointment.patientName}, your appointment ID ${appointment.id} has been successfully rescheduled to ${appointment.date} at ${appointment.time} with ${appointment.doctorNameEn}. Helpline: +92 340 4777745.`;
      msgUr = `محترم ${appointment.patientName}، آپ کی اپائنٹمنٹ نمبر ${appointment.id} کو نئی تاریخ ${appointment.date} بوقت ${appointment.time} پر کامیابی سے تبدیل کر دیا گیا ہے۔ رابطہ: +92 340 4777745۔`;
    } else {
      msgEn = `Update for ${appointment.patientName}: Appointment ID ${appointment.id} status is now ${appointment.status}. Contact: +92 340 4777745.`;
      msgUr = `اپ ڈیٹ برائے ${appointment.patientName}: اپائنٹمنٹ نمبر ${appointment.id} کی صورتحال: ${appointment.status}۔ رابطہ: +92 340 4777745۔`;
    }
  }

  const newLog: WhatsAppLog = {
    id: `wa-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    appointmentId: appointment.id,
    recipientName: appointment.patientName,
    recipientPhone: appointment.whatsAppNumber,
    templateType,
    messageEn: msgEn,
    messageUr: msgUr,
    status: 'delivered',
    timestamp: new Date().toISOString(),
  };

  addWhatsAppLog(newLog);
  return newLog;
}

// ==========================================
// 1. REAL-TIME SERVER-SENT EVENTS (SSE) STREAM
// ==========================================
app.get('/api/events/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  // Push immediate initial snapshot
  const initialPayload = getLiveSyncPayload();
  res.write(`event: init\ndata: ${JSON.stringify({ type: 'init', data: initialPayload })}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Single-call Live Snapshot (Fallback / Polling)
app.get('/api/live-sync', (req, res) => {
  res.json(getLiveSyncPayload());
});

// ==========================================
// ADMIN CONTROL AUTHENTICATION
// ==========================================
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const result = loginAdmin(email, password, ip);
  if (result.success) {
    res.json(result);
  } else {
    res.status(401).json(result);
  }
});

app.get('/api/admin/session', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const result = verifyAdminSession(token);
  res.json(result);
});

app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  logoutAdmin(token);
  res.json({ success: true });
});

// ==========================================
// 2. HOSPITAL IDENTITY & INFO
// ==========================================
app.get('/api/hospital-info', (req, res) => {
  res.json(getHospitalInfo());
});

app.post('/api/hospital-info', (req, res) => {
  const updated = updateHospitalInfo(req.body);
  broadcastSync('hospital_info_updated', { hospitalInfo: updated });
  res.json({ success: true, hospitalInfo: updated });
});

// ==========================================
// 3. DOCTORS & DYNAMIC SCHEDULES
// ==========================================
app.get('/api/doctors', (req, res) => {
  res.json(getDoctors());
});

app.post('/api/doctors/schedule', (req, res) => {
  const updatedDoc: Doctor = req.body;
  const result = updateDoctorSchedule(updatedDoc);
  if (result) {
    broadcastSync('doctor_updated', { doctor: result });
    res.json({ success: true, doctor: result });
  } else {
    res.status(404).json({ error: 'Doctor not found' });
  }
});

app.post('/api/doctors/toggle-leave', (req, res) => {
  const { doctorId, isAvailable, unavailabilityReason } = req.body;
  if (!doctorId || typeof isAvailable !== 'boolean') {
    return res.status(400).json({ error: 'doctorId and isAvailable boolean are required' });
  }

  const result = toggleDoctorAvailability(doctorId, isAvailable, unavailabilityReason);
  if (result) {
    broadcastSync('doctor_availability_changed', { doctor: result });
    res.json({ success: true, doctor: result });
  } else {
    res.status(404).json({ error: 'Doctor not found' });
  }
});

// ==========================================
// 4. REAL-TIME APPOINTMENT SLOTS & LOCKS
// ==========================================
app.get('/api/slots', (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) {
    return res.status(400).json({ error: 'doctorId and date are required' });
  }

  const doctors = getDoctors();
  const doctor = doctors.find((d) => d.id === doctorId);
  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' });
  }

  const result = generateDoctorTimeSlots(doctor, String(date));
  res.json(result);
});

app.post('/api/appointments/lock', (req, res) => {
  const { doctorId, date, time, sessionId } = req.body;
  if (!doctorId || !date || !time) {
    return res.status(400).json({ error: 'doctorId, date, and time are required' });
  }

  const doctor = getDoctors().find((d) => d.id === doctorId);
  if (!doctor || !doctor.isAvailable) {
    return res.status(400).json({
      error: doctor?.unavailabilityReason || 'Doctor is currently on leave or unavailable for appointments.',
    });
  }

  const lockKey = `${doctorId}_${date}_${time}`;
  const now = Date.now();
  const appointments = getAppointments();

  // 1. Check if already booked
  const existingBooking = appointments.find(
    (a) => a.doctorId === doctorId && a.date === date && a.time === time && a.status !== 'cancelled'
  );
  if (existingBooking) {
    return res.status(409).json({ error: 'This time slot is already booked by another patient.' });
  }

  // 2. Check if locked by another user session within 10 minutes
  const existingLock = lockedSlots.get(lockKey);
  if (existingLock && now - existingLock.lockedAt < 10 * 60 * 1000) {
    if (existingLock.sessionId !== sessionId) {
      return res.status(409).json({
        error: 'This slot is temporarily held by another patient completing their booking (held for up to 10 minutes).',
      });
    }
  }

  // Set/Refresh lock
  lockedSlots.set(lockKey, { lockedAt: now, sessionId: sessionId || 'unknown' });
  broadcastSync('slot_locked', { lockKey });
  res.json({ success: true, message: 'Slot reserved for 10 minutes.', expiresAt: now + 10 * 60 * 1000 });
});

// ==========================================
// 5. APPOINTMENTS LIFECYCLE (BOOK, CANCEL, RESCHEDULE, SEARCH)
// ==========================================
app.get('/api/appointments', (req, res) => {
  res.json(getAppointments());
});

app.get('/api/appointments/search', (req, res) => {
  const query = (req.query.query as string || '').toLowerCase().trim();
  if (!query) {
    return res.json([]);
  }

  const cleanPhone = query.replace(/[^0-9]/g, '');
  const appointments = getAppointments();

  const results = appointments.filter((a) => {
    const idMatch = a.id.toLowerCase().includes(query);
    const nameMatch = a.patientName.toLowerCase().includes(query);
    const phoneClean = a.whatsAppNumber.replace(/[^0-9]/g, '');
    const phoneMatch = cleanPhone.length >= 4 && phoneClean.includes(cleanPhone);
    const doctorMatch = (a.doctorNameEn || '').toLowerCase().includes(query) || (a.doctorNameUr || '').includes(query);
    return idMatch || nameMatch || phoneMatch || doctorMatch;
  });

  res.json(results);
});

app.get('/api/appointments/patient-history', (req, res) => {
  const query = ((req.query.query || req.query.phone || req.query.name || req.query.id || '') as string).toLowerCase().trim();
  if (!query) {
    return res.json({ appointments: [], stats: null });
  }

  const cleanPhone = query.replace(/[^0-9]/g, '');
  const appointments = getAppointments();

  const matched = appointments.filter((a) => {
    const idMatch = a.id.toLowerCase() === query || a.id.toLowerCase().includes(query);
    const nameMatch = a.patientName.toLowerCase() === query || a.patientName.toLowerCase().includes(query);
    const phoneClean = a.whatsAppNumber.replace(/[^0-9]/g, '');
    const phoneMatch = cleanPhone.length >= 7 && phoneClean.includes(cleanPhone);
    return idMatch || nameMatch || phoneMatch;
  });

  // Sort chronologically descending (newest visit first)
  matched.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Derive patient clinical summary stats
  const totalVisits = matched.length;
  const completedVisits = matched.filter((a) => a.status === 'completed').length;
  const upcomingVisits = matched.filter((a) => a.status === 'confirmed' || a.status === 'payment_submitted').length;
  const totalFees = matched.reduce((sum, a) => sum + (a.feePKR || 0), 0);
  const distinctDoctors = Array.from(new Set(matched.map((a) => a.doctorNameEn))).filter(Boolean);
  const distinctDepartments = Array.from(new Set(matched.map((a) => a.departmentEn))).filter(Boolean);
  
  const firstVisit = matched.length > 0 ? matched[matched.length - 1].date : null;
  const latestVisit = matched.length > 0 ? matched[0].date : null;

  res.json({
    appointments: matched,
    stats: {
      totalVisits,
      completedVisits,
      upcomingVisits,
      totalFees,
      distinctDoctors,
      distinctDepartments,
      firstVisit,
      latestVisit,
    },
  });
});

app.post('/api/appointments/book', (req, res) => {
  const {
    doctorId,
    date,
    time,
    consultationType,
    patientName,
    age,
    gender,
    whatsAppNumber,
    reasonForVisit,
    paymentMethod,
    feePKR,
  } = req.body;

  if (!doctorId || !date || !time || !patientName || !whatsAppNumber) {
    return res.status(400).json({ error: 'Missing required appointment fields.' });
  }

  const doctor = getDoctors().find((d) => d.id === doctorId);
  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found.' });
  }

  if (!doctor.isAvailable) {
    return res.status(400).json({
      error: `Booking unavailable: ${doctor.nameEn} is on leave (${doctor.unavailabilityReason || 'Off-Duty'}).`,
    });
  }

  const appointments = getAppointments();

  // Strict double-booking prevention
  const doubleBooked = appointments.find(
    (a) => a.doctorId === doctorId && a.date === date && a.time === time && a.status !== 'cancelled'
  );
  if (doubleBooked) {
    return res.status(409).json({ error: 'Conflict: This exact time slot has already been booked. Please choose another slot.' });
  }

  const apptId = `GFH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newAppt: Appointment = {
    id: apptId,
    doctorId,
    doctorNameEn: doctor.nameEn,
    doctorNameUr: doctor.nameUr,
    departmentEn: doctor.departmentEn,
    departmentUr: doctor.departmentUr,
    date,
    time,
    consultationType: consultationType || 'hospital_visit',
    patientName,
    age: Number(age) || 0,
    gender: gender || 'male',
    whatsAppNumber,
    reasonForVisit: reasonForVisit || '',
    status: paymentMethod === 'hospital_counter' ? 'confirmed' : 'pending_payment',
    feePKR: feePKR || (consultationType === 'online_consultation' ? doctor.onlineFeePKR : doctor.feePKR),
    paymentMethod: paymentMethod || 'hospital_counter',
    createdAt: new Date().toLocaleString(),
    updatedAt: new Date().toLocaleString(),
  };

  createAppointment(newAppt);

  // Clear slot lock
  const lockKey = `${doctorId}_${date}_${time}`;
  lockedSlots.delete(lockKey);

  // Send automated WhatsApp confirmation
  triggerWhatsAppNotification(
    newAppt,
    newAppt.paymentMethod === 'hospital_counter' ? 'appointment_confirmation' : 'appointment_confirmation'
  );

  // Broadcast to all active users and screens
  broadcastSync('appointment_booked', { appointment: newAppt });

  res.status(201).json({ success: true, appointment: newAppt });
});

app.post('/api/appointments/:id/cancel', (req, res) => {
  const { id } = req.params;
  const cancelled = cancelAppointment(id);
  if (!cancelled) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  triggerWhatsAppNotification(cancelled, 'cancellation');
  broadcastSync('appointment_cancelled', { appointment: cancelled });
  res.json({ success: true, appointment: cancelled });
});

app.post('/api/appointments/:id/reschedule', (req, res) => {
  const { id } = req.params;
  const { date, time } = req.body;
  if (!date || !time) {
    return res.status(400).json({ error: 'date and time are required for rescheduling' });
  }

  const appt = getAppointments().find((a) => a.id === id);
  if (!appt) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  // Check doctor availability on the new date
  const doctor = getDoctors().find((d) => d.id === appt.doctorId);
  if (doctor && !doctor.isAvailable) {
    return res.status(400).json({ error: `Cannot reschedule: ${doctor.nameEn} is currently on leave.` });
  }

  // Check slot collision
  const conflict = getAppointments().find(
    (a) => a.id !== id && a.doctorId === appt.doctorId && a.date === date && a.time === time && a.status !== 'cancelled'
  );
  if (conflict) {
    return res.status(409).json({ error: 'Chosen reschedule slot is already booked. Please choose another slot.' });
  }

  const updated = rescheduleAppointment(id, date, time);
  if (updated) {
    triggerWhatsAppNotification(updated, 'reschedule');
    broadcastSync('appointment_rescheduled', { appointment: updated });
    res.json({ success: true, appointment: updated });
  } else {
    res.status(500).json({ error: 'Failed to reschedule appointment' });
  }
});

app.post('/api/appointments/:id/payment', (req, res) => {
  const { id } = req.params;
  const { paymentMethod, paymentReference, paymentScreenshotUrl } = req.body;

  if (!paymentReference) {
    return res.status(400).json({ error: 'Payment Transaction ID / Reference is required' });
  }

  const updated = updateAppointmentPayment(id, paymentMethod, paymentReference, paymentScreenshotUrl);
  if (!updated) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  triggerWhatsAppNotification(
    updated,
    'payment_confirmation',
    `Dear ${updated.patientName}, your payment details (TID: ${paymentReference}) for appointment ${updated.id} have been submitted. Hospital cashier/admin will verify shortly. Helpline: +92 340 4777745.`,
    `محترم ${updated.patientName}، اپائنٹمنٹ نمبر ${updated.id} کے لیے آپ کی ادائیگی کی رسید (TID: ${paymentReference}) جمع ہو چکی ہے۔ ہسپتال انتظامیہ جلد تصدیق کرے گی۔ رابطہ: +92 340 4777745۔`
  );

  broadcastSync('payment_submitted', { appointment: updated });
  res.json({ success: true, appointment: updated });
});

app.post('/api/admin/payments/:id/verify', (req, res) => {
  const { id } = req.params;
  const { action, notes } = req.body; // 'approve' | 'reject' | 'checkin' | 'complete' | 'cancel'

  if (!action) {
    return res.status(400).json({ error: 'Verification action is required' });
  }

  const updated = verifyAppointment(id, action, notes);
  if (!updated) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  if (action === 'approve') {
    triggerWhatsAppNotification(
      updated,
      'payment_confirmation',
      `Dear ${updated.patientName}, your payment for Appointment ID ${updated.id} is VERIFIED and CONFIRMED! Please show this slip at the hospital counter. Address: Fatehpur Road, Chowk Azam. Helpline: +92 340 4777745.`,
      `محترم ${updated.patientName}، اپائنٹمنٹ نمبر ${updated.id} کی ادائیگی باضابطہ تصدیق ہو گئی ہے۔ ہسپتال کاؤنٹر پر یہ سلپ دکھائیں۔ پتہ: فتح پور روڈ، چوک اعظم۔ رابطہ: +92 340 4777745۔`
    );
  } else if (action === 'reject') {
    triggerWhatsAppNotification(
      updated,
      'cancellation',
      `Dear ${updated.patientName}, payment reference for Appointment ID ${updated.id} could not be verified (${notes || 'Incorrect TID'}). Please re-submit your JazzCash/Easypaisa transaction details or contact us at +92 340 4777745.`,
      `محترم ${updated.patientName}، اپائنٹمنٹ نمبر ${updated.id} کی ادائیگی کا حوالہ تصدیق نہیں ہو سکا (${notes || 'غلط رسید نمبر'})۔ براہ کرم صحیح تفصیلات دوبارہ جمع کرائیں یا رابطہ کریں: +92 340 4777745۔`
    );
  }

  broadcastSync('payment_verified', { appointment: updated, action });
  res.json({ success: true, appointment: updated });
});

// ==========================================
// 6. HOSPITAL DATES, MEDICAL CAMPS & EVENTS (WITH AUTO-PRUNING)
// ==========================================
app.get('/api/events', (req, res) => {
  const includeExpired = req.query.includeExpired === 'true';
  const events = getHospitalEvents(includeExpired);
  res.json(events);
});

app.post('/api/events', (req, res) => {
  const { titleEn, titleUr, category, descriptionEn, descriptionUr, startDate, endDate, timeRangeEn, timeRangeUr, locationEn, locationUr, doctorInChargeEn, doctorInChargeUr, isFree, registrationOpen, notesEn, notesUr } = req.body;

  if (!titleEn || !startDate || !endDate) {
    return res.status(400).json({ error: 'titleEn, startDate, and endDate are required' });
  }

  const newEvent = createHospitalEvent({
    titleEn,
    titleUr: titleUr || titleEn,
    category: category || 'medical_camp',
    descriptionEn: descriptionEn || '',
    descriptionUr: descriptionUr || '',
    startDate,
    endDate,
    timeRangeEn,
    timeRangeUr,
    locationEn: locationEn || 'Gulzar Family Hospital Chowk Azam',
    locationUr: locationUr || 'گلزار فیملی ہسپتال چوک اعظم لیہ',
    doctorInChargeEn,
    doctorInChargeUr,
    isFree: Boolean(isFree),
    registrationOpen: registrationOpen !== false,
    notesEn,
    notesUr,
  });

  broadcastSync('event_created', { event: newEvent });
  res.status(201).json({ success: true, event: newEvent });
});

app.put('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const updated = updateHospitalEvent(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Event not found' });
  }

  broadcastSync('event_updated', { event: updated });
  res.json({ success: true, event: updated });
});

app.delete('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const deleted = deleteHospitalEvent(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Event not found' });
  }

  broadcastSync('event_deleted', { id });
  res.json({ success: true, message: 'Event deleted' });
});

app.post('/api/events/prune-expired', (req, res) => {
  const removedCount = pruneExpiredEvents();
  broadcastSync('events_pruned', { removedCount });
  res.json({ success: true, removedCount, remainingCount: getHospitalEvents(false).length });
});

// ==========================================
// 7. CLINICAL DEPARTMENTS
// ==========================================
app.get('/api/departments', (req, res) => {
  res.json(getDepartments());
});

app.post('/api/departments', (req, res) => {
  const updated = updateDepartments(req.body);
  broadcastSync('departments_updated', { departments: updated });
  res.json({ success: true, departments: updated });
});

// ==========================================
// 8. AUDIT LOGS & STATS
// ==========================================
app.get('/api/whatsapp/logs', (req, res) => {
  res.json(getWhatsAppLogs());
});

app.post('/api/whatsapp/send-test', (req, res) => {
  const { recipientPhone, recipientName, templateType, messageEn, messageUr } = req.body;
  const dummyAppt: Appointment = {
    id: `GFH-TEST-${Math.floor(100 + Math.random() * 900)}`,
    doctorId: 'doc-1',
    doctorNameEn: 'Dr. Nadir Hussain Dullu',
    doctorNameUr: 'ڈاکٹر نادر حسین ڈلو',
    departmentEn: 'Pediatrics',
    departmentUr: 'بچوں کے امراض',
    date: new Date().toISOString().split('T')[0],
    time: '11:00 AM',
    consultationType: 'hospital_visit',
    patientName: recipientName || 'Valued Patient',
    age: 25,
    gender: 'male',
    whatsAppNumber: recipientPhone || '+92 340 4777745',
    reasonForVisit: 'WhatsApp Test Verification',
    status: 'confirmed',
    feePKR: 1500,
    createdAt: new Date().toLocaleString(),
    updatedAt: new Date().toLocaleString(),
  };

  const log = triggerWhatsAppNotification(dummyAppt, templateType || 'payment_confirmation', messageEn, messageUr);
  broadcastSync('whatsapp_logged', { log });
  res.json({ success: true, log });
});

app.get('/api/stats', (req, res) => {
  res.json(getStats());
});

// ==========================================
// 9. REAL-TIME AI CHATBOT WITH LIVE GROUNDED DATABASE
// ==========================================
let genAiInstance: GoogleGenAI | null = null;
function getGenAi(): GoogleGenAI {
  if (!genAiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing');
    }
    genAiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAiInstance;
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required' });
    }

    // Pull FRESH live database snapshot at this exact moment
    const liveSnapshotText = getLiveHospitalSnapshotText();
    const liveSync = getLiveSyncPayload();

    const dynamicSystemInstruction = `
You are Gulzar AI, the official intelligent medical assistant and healthcare concierge for Gulzar Family Hospital & Children Center (گلزار فیملی ہسپتال و چلڈرن سینٹر) located on Fatehpur Road, In Front of ZTBL, Chowk Azam, Layyah.

MANDATORY REAL-TIME GROUNDING DIRECTIVE:
You are directly connected to the LIVE Hospital Database. You MUST base your answers on the following dynamic snapshot. Never use outdated pre-trained assumptions or hallucinate information.

${liveSnapshotText}

RULES FOR ACCURATE RESPONSES:
1. DOCTOR AVAILABILITY & LEAVES: If a doctor is listed as "ON LEAVE / UNAVAILABLE" in the snapshot, you MUST inform the user that this doctor is currently on leave (state reason if provided). If they are "AVAILABLE", provide their exact timings and OPD fee.
2. MEDICAL CAMPS & HOSPITAL EVENTS: When the user asks about camps, free checkups, specialist visits, or holidays, provide the exact dates, timings, doctor in charge, and registration status from the live events in the snapshot.
3. FEES & PAYMENTS: Provide the exact PKR fees from the snapshot. For online payment, supply the JazzCash / Easypaisa number (0340-4777745, Title: Gulzar Family Hospital).
4. UNCERTAINTY & UNLISTED DATA: If the user asks for a doctor, test, service, or policy that is NOT in the live database snapshot above or is uncertain, DO NOT invent an answer! Clearly state:
   "I do not have verified information on that in our live hospital records. Please call our 24/7 hospital helpline at +92 340 4777745 for immediate assistance."
5. URDU & ENGLISH: If the patient writes in Urdu (اردو) or Roman Urdu, reply in respectful, fluent Urdu or Roman Urdu. If in English, reply in English.
6. EMERGENCY: For acute pediatric emergency (breathing difficulty, high fever seizure, severe diarrhea dehydration, neonatal jaundice), emphasize bringing the child immediately to our 24/7 Emergency Room & Nursery Incubator Unit on Fatehpur Road, Chowk Azam.
7. FORMATTING: Use bullet points, bold text, and clean formatting for easy reading.
`;

    let answer = '';
    try {
      const ai = getGenAi();
      const contents: any[] = [];

      if (Array.isArray(history) && history.length > 0) {
        for (const item of history) {
          if (item.role && item.parts) {
            contents.push({
              role: item.role === 'user' ? 'user' : 'model',
              parts: [{ text: String(item.parts) }],
            });
          }
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          systemInstruction: dynamicSystemInstruction,
          temperature: 0.5,
        },
      });

      answer = response.text || '';
    } catch (genErr) {
      console.warn('Gemini API call failed or GEMINI_API_KEY missing, using intelligent live-grounded rule engine:', genErr);
    }

    // If Gemini wasn't available, generate an accurate live response strictly from the live database
    if (!answer) {
      const lower = message.toLowerCase();
      const docs = liveSync.doctors;
      const events = liveSync.hospitalEvents;
      const info = liveSync.hospitalInfo;

      if (lower.includes('event') || lower.includes('camp') || lower.includes('کیمپ') || lower.includes('چھٹی') || lower.includes('holiday')) {
        if (events.length > 0) {
          answer = `🏥 **Live Upcoming Hospital Events & Medical Camps:**\n\n` +
            events.map((e) =>
              `• **${e.titleEn}** (${e.titleUr})\n` +
              `  📅 **Dates:** ${e.startDate} to ${e.endDate} (${e.timeRangeEn || 'Normal hours'})\n` +
              `  📍 **Location:** ${e.locationEn}\n` +
              `  👨‍⚕️ **Doctor:** ${e.doctorInChargeEn || 'Specialist Staff'}\n` +
              `  🏷️ **Type:** ${e.isFree ? 'FREE Medical Screening' : 'Standard Rates'} | ${e.registrationOpen ? 'Registration Open' : 'Closed'}\n` +
              `  ℹ️ ${e.descriptionEn}`
            ).join('\n\n') +
            `\n\nTo register or book a token, visit our **Hospital Events** section or call **${info.phone}**.`;
        } else {
          answer = `🏥 There are currently no active special medical camps scheduled. Our regular OPD (Mon-Sat 9 AM - 2 PM & 4 PM - 8 PM) and 24/7 Emergency Room are fully operational. Call ${info.phone} for inquiries.`;
        }
      } else if (lower.includes('doctor') || lower.includes('fee') || lower.includes('schedule') || lower.includes('ڈاکٹر') || lower.includes('فیس')) {
        answer = `👨‍⚕️ **Current Doctors Roster & Live Availability Status:**\n\n` +
          docs.map((d) =>
            `• **${d.nameEn}** (${d.nameUr})\n` +
            `  - Specialty: ${d.specialtyEn}\n` +
            `  - OPD Fee: PKR ${d.feePKR} | Video Consultation: PKR ${d.onlineFeePKR}\n` +
            `  - Working Days: ${d.workingDays.join(', ')} (${d.startTime} - ${d.endTime})\n` +
            `  - Status: ${d.isAvailable ? '✅ **Available for Booking**' : `❌ **On Leave (${d.unavailabilityReason || 'Off-Duty'})**`}`
          ).join('\n\n') +
          `\n\nYou can book an appointment directly through the **Book Appointment** tab or call **${info.phone}**.`;
      } else if (lower.includes('location') || lower.includes('address') || lower.includes('where') || lower.includes('پتہ') || lower.includes('لیہ') || lower.includes('چوک اعظم')) {
        answer = `📍 **Gulzar Family Hospital & Children Center:**\n\n${info.addressEn}\n\n📞 **24/7 Emergency Helpline:** ${info.phone}\n💬 **WhatsApp:** ${info.whatsApp}\n🌐 **Google Maps:** https://maps.app.goo.gl/MZcb8Dsaf7Pq9ajQ8\n\n${info.emergencyNoticeEn || '24/7 Emergency & Nursery Baby Incubator are active.'}`;
      } else if (lower.includes('pay') || lower.includes('jazzcash') || lower.includes('easypaisa') || lower.includes('ادائیگی') || lower.includes('اکاؤنٹ')) {
        answer = `💳 **Official Payment Details (Gulzar Family Hospital):**\n\n- **JazzCash Account:** ${info.jazzCash} (Title: Gulzar Family Hospital)\n- **Easypaisa Account:** ${info.easyPaisa} (Title: Gulzar Family Hospital)\n- **Cash Counter:** Pay at reception desk during visit\n\nAfter sending fee, enter your Transaction ID (TID) in the **Patient Portal** for immediate WhatsApp confirmation.`;
      } else {
        answer = `🏥 **Gulzar Family Hospital & Children Center AI Concierge**\n\nConnected directly to our live hospital database in Chowk Azam, Layyah.\n\n- 📞 **Helpline & WhatsApp:** ${info.phone}\n- 🚨 **24/7 Emergency:** Active (${info.emergencyNoticeEn || 'Emergency & NICU Open'})\n- 📢 **Active Notice:** ${info.activeAnnouncementEn || 'Specialist OPD & Child Center Open'}\n\nHow can I help you today regarding doctor availability, medical camps, fees, or booking?`;
      }
    }

    res.json({ success: true, reply: answer, groundedTimestamp: liveSync.lastUpdated });
  } catch (err: any) {
    console.error('Error in /api/chat endpoint:', err);
    res.status(500).json({ error: 'Internal server error processing chat' });
  }
});

// ==========================================
// 10. VITE MIDDLEWARE & SERVER STARTUP
// ==========================================
async function startServer() {
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    (typeof __filename !== 'undefined' && (__filename.endsWith('.cjs') || __filename.includes('dist')));

  if (isProduction) {
    const distPath = fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'))
      ? path.join(process.cwd(), 'dist')
      : path.join(__dirname);

    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`[Server] Production mode active. Serving static assets from: ${distPath}`);
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Server] Development mode active with Vite middleware');
  }

  // Primary port for AI Studio environment (must bind to port 3000 on 0.0.0.0)
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Gulzar Family Hospital server running on http://0.0.0.0:${PORT}`);
  });

  // If deployed to Cloud Run or a container environment with custom PORT (e.g. 8080)
  const envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : null;
  if (envPort && envPort !== PORT) {
    try {
      const secondaryServer = app.listen(envPort, '0.0.0.0', () => {
        console.log(`[Server] Also listening on Cloud Run port ${envPort}`);
      });
      secondaryServer.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`[Server] Port ${envPort} already bound (reverse proxy), continuing on port ${PORT}`);
        } else {
          console.warn(`[Server] Notice on secondary port ${envPort}:`, err.message);
        }
      });
    } catch (e: any) {
      console.warn(`[Server] Could not bind to secondary port ${envPort}:`, e.message);
    }
  }
}

// Global safety error handlers
process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Server] Unhandled rejection:', reason);
});

startServer();
