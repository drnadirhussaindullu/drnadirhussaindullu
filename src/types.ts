export type Language = 'en' | 'ur';

export type ConsultationType = 'hospital_visit' | 'online_consultation';

export type Gender = 'male' | 'female' | 'other';

export type AppointmentStatus =
  | 'pending_payment'
  | 'payment_submitted'
  | 'payment_verified'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type PaymentMethod = 'jazzcash' | 'easypaisa' | 'gateway_api' | 'hospital_counter';

export interface DoctorQualification {
  degree: string;
  institute: string;
  year?: string;
  detail?: string;
}

export interface Doctor {
  id: string;
  nameEn: string;
  nameUr: string;
  specialtyEn: string;
  specialtyUr: string;
  departmentEn: string;
  departmentUr: string;
  qualificationEn: string;
  qualificationUr: string;
  experienceYears: number;
  feePKR: number;
  onlineFeePKR: number;
  avatarUrl: string;
  workingDays: string[]; // e.g. ['Monday', 'Tuesday', ...]
  startTime: string; // e.g. '09:00'
  endTime: string; // e.g. '17:00'
  breakStartTime?: string; // e.g. '13:00'
  breakEndTime?: string; // e.g. '14:00'
  slotDurationMinutes: number; // e.g. 15
  maxPatientsPerDay: number;
  acceptsOnline: boolean;
  acceptsHospitalVisit: boolean;
  isAvailable: boolean;
  unavailabilityReason?: string;
  // Specific detail view attributes:
  bioEn?: string;
  bioUr?: string;
  pmdcRegistration?: string;
  specializationsEn?: string[];
  specializationsUr?: string[];
  educationHistory?: DoctorQualification[];
  careerHighlights?: string[];
  languages?: string[];
  proceduresOffered?: string[];
}

export interface TimeSlot {
  time: string; // e.g. '09:00 AM'
  isAvailable: boolean;
  isLocked?: boolean;
  lockedBySession?: string;
  shift?: 'morning' | 'evening';
}

export interface Appointment {
  id: string; // e.g. GFH-2026-8842
  doctorId: string;
  doctorNameEn: string;
  doctorNameUr: string;
  departmentEn: string;
  departmentUr: string;
  date: string; // YYYY-MM-DD
  time: string; // 10:30 AM
  consultationType: ConsultationType;
  patientName: string;
  age: number;
  gender: Gender;
  whatsAppNumber: string;
  reasonForVisit: string;
  status: AppointmentStatus;
  feePKR: number;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  paymentScreenshotUrl?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface WhatsAppLog {
  id: string;
  appointmentId: string;
  recipientName: string;
  recipientPhone: string;
  templateType:
    | 'appointment_confirmation'
    | 'payment_confirmation'
    | 'reminder_24h'
    | 'reminder_2h'
    | 'cancellation'
    | 'reschedule'
    | 'doctor_unavailable'
    | 'online_consultation_link'
    | 'follow_up';
  messageEn: string;
  messageUr: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
}

export interface HospitalInfoData {
  name: string;
  nameUr: string;
  addressEn: string;
  addressUr: string;
  phone: string;
  whatsApp: string;
  jazzCash: string;
  easyPaisa: string;
  emergencyNoticeEn?: string;
  emergencyNoticeUr?: string;
  activeAnnouncementEn?: string;
  activeAnnouncementUr?: string;
  visitingHoursEn?: string;
  visitingHoursUr?: string;
  opdTimingsEn?: string;
  opdTimingsUr?: string;
  googleMapsUrl?: string;
  googleMapsEmbedUrl?: string;
  latitude?: number;
  longitude?: number;
  landmarkEn?: string;
  landmarkUr?: string;
  lastUpdated?: string;
}

export type EventCategory =
  | 'medical_camp'
  | 'holiday'
  | 'specialist_visit'
  | 'vaccination_drive'
  | 'health_awareness';

export interface HospitalEvent {
  id: string;
  titleEn: string;
  titleUr: string;
  category: EventCategory;
  descriptionEn: string;
  descriptionUr: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  timeRangeEn?: string; // e.g. "09:00 AM - 03:00 PM"
  timeRangeUr?: string;
  locationEn: string;
  locationUr: string;
  doctorInChargeEn?: string;
  doctorInChargeUr?: string;
  isFree: boolean;
  registrationOpen: boolean;
  notesEn?: string;
  notesUr?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HospitalDepartment {
  id: string;
  nameEn: string;
  nameUr: string;
  headDoctorEn: string;
  headDoctorUr: string;
  servicesEn: string[];
  servicesUr: string[];
  timingsEn: string;
  timingsUr: string;
  is24x7: boolean;
}

export interface LiveSyncPayload {
  doctors: Doctor[];
  appointments: Appointment[];
  hospitalEvents: HospitalEvent[];
  hospitalInfo: HospitalInfoData;
  departments: HospitalDepartment[];
  stats: {
    total: number;
    pending: number;
    verified: number;
    cancelled: number;
    totalRevenue: number;
    todayRevenue: number;
    jazzCashCount: number;
    easyPaisaCount: number;
  };
  lastUpdated: string;
}

export interface AdminUser {
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
}
