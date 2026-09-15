import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Doctor,
  Appointment,
  HospitalEvent,
  HospitalInfoData,
  HospitalDepartment,
  LiveSyncPayload,
} from '../types';
import {
  INITIAL_DOCTORS,
  INITIAL_APPOINTMENTS,
  HOSPITAL_INFO,
  INITIAL_HOSPITAL_EVENTS,
  INITIAL_DEPARTMENTS,
} from '../data/mockData';

interface HospitalDataContextType {
  doctors: Doctor[];
  appointments: Appointment[];
  hospitalEvents: HospitalEvent[];
  hospitalInfo: HospitalInfoData;
  departments: HospitalDepartment[];
  stats: LiveSyncPayload['stats'];
  isLiveConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  refreshAll: () => Promise<void>;
  bookAppointment: (payload: any) => Promise<{ success: boolean; appointment?: Appointment; error?: string }>;
  cancelAppointment: (id: string) => Promise<{ success: boolean; error?: string }>;
  rescheduleAppointment: (id: string, date: string, time: string) => Promise<{ success: boolean; appointment?: Appointment; error?: string }>;
  submitPayment: (id: string, paymentMethod: string, paymentReference: string, paymentScreenshotUrl?: string) => Promise<{ success: boolean; appointment?: Appointment; error?: string }>;
  verifyAppointment: (id: string, action: 'approve' | 'reject' | 'checkin' | 'complete' | 'cancel', notes?: string) => Promise<{ success: boolean; appointment?: Appointment; error?: string }>;
  updateDoctorSchedule: (doctor: Doctor) => Promise<{ success: boolean; doctor?: Doctor; error?: string }>;
  toggleDoctorLeave: (doctorId: string, isAvailable: boolean, unavailabilityReason?: string) => Promise<{ success: boolean; doctor?: Doctor; error?: string }>;
  createHospitalEvent: (eventData: Omit<HospitalEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; event?: HospitalEvent; error?: string }>;
  updateHospitalEvent: (id: string, updates: Partial<HospitalEvent>) => Promise<{ success: boolean; event?: HospitalEvent; error?: string }>;
  deleteHospitalEvent: (id: string) => Promise<{ success: boolean; error?: string }>;
  pruneExpiredEvents: () => Promise<{ success: boolean; removedCount?: number; error?: string }>;
  updateHospitalInfo: (updates: Partial<HospitalInfoData>) => Promise<{ success: boolean; hospitalInfo?: HospitalInfoData; error?: string }>;
}

const defaultStats: LiveSyncPayload['stats'] = {
  total: INITIAL_APPOINTMENTS.length,
  pending: 1,
  verified: 2,
  cancelled: 0,
  totalRevenue: 4900,
  todayRevenue: 1500,
  jazzCashCount: 0,
  easyPaisaCount: 1,
};

const HospitalDataContext = createContext<HospitalDataContextType | undefined>(undefined);

export const HospitalDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [hospitalEvents, setHospitalEvents] = useState<HospitalEvent[]>(INITIAL_HOSPITAL_EVENTS);
  const [hospitalInfo, setHospitalInfo] = useState<HospitalInfoData>(HOSPITAL_INFO);
  const [departments, setDepartments] = useState<HospitalDepartment[]>(INITIAL_DEPARTMENTS);
  const [stats, setStats] = useState<LiveSyncPayload['stats']>(defaultStats);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Apply complete state update from server
  const applyPayload = useCallback((payload: LiveSyncPayload) => {
    if (payload.doctors) setDoctors(payload.doctors);
    if (payload.appointments) setAppointments(payload.appointments);
    if (payload.hospitalEvents) setHospitalEvents(payload.hospitalEvents);
    if (payload.hospitalInfo) setHospitalInfo(payload.hospitalInfo);
    if (payload.departments) setDepartments(payload.departments);
    if (payload.stats) setStats(payload.stats);
    setLastSyncTime(new Date());
  }, []);

  // Fetch full state snapshot via REST
  const refreshAll = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/live-sync');
      if (res.ok) {
        const payload: LiveSyncPayload = await res.json();
        applyPayload(payload);
      }
    } catch (err) {
      console.warn('Live sync fetch error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [applyPayload]);

  // Establish SSE (Server-Sent Events) connection for real-time live synchronization
  useEffect(() => {
    // Initial fetch
    refreshAll();

    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/events/stream');

        eventSource.onopen = () => {
          setIsLiveConnected(true);
        };

        eventSource.addEventListener('init', (e: MessageEvent) => {
          try {
            const parsed = JSON.parse(e.data);
            if (parsed.data) {
              applyPayload(parsed.data);
            }
          } catch (err) {
            console.error('Error parsing SSE init payload:', err);
          }
        });

        // Listen for all broadcast event types
        const handleServerEvent = (e: MessageEvent) => {
          try {
            const parsed = JSON.parse(e.data);
            if (parsed.data) {
              applyPayload(parsed.data);
            } else {
              // Refresh if payload not directly in data
              refreshAll();
            }
          } catch (err) {
            console.error('Error handling SSE broadcast event:', err);
          }
        };

        const eventTypes = [
          'data_updated',
          'doctor_updated',
          'doctor_availability_changed',
          'appointment_booked',
          'appointment_cancelled',
          'appointment_rescheduled',
          'payment_submitted',
          'payment_verified',
          'slot_locked',
          'event_created',
          'event_updated',
          'event_deleted',
          'events_pruned',
          'hospital_info_updated',
          'departments_updated',
        ];

        eventTypes.forEach((evtType) => {
          eventSource?.addEventListener(evtType, handleServerEvent);
        });

        eventSource.onerror = () => {
          setIsLiveConnected(false);
          eventSource?.close();
          // Attempt reconnection after 3 seconds
          reconnectTimeout = setTimeout(connectSSE, 3000);
        };
      } catch (err) {
        console.warn('EventSource initialization failed, using polling fallback:', err);
        setIsLiveConnected(false);
      }
    };

    connectSSE();

    // Fallback polling interval every 20 seconds to guarantee fresh data even if tab slept
    const pollInterval = setInterval(() => {
      refreshAll();
    }, 20000);

    return () => {
      clearInterval(pollInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [applyPayload, refreshAll]);

  // ACTION METHODS
  const bookAppointment = async (payload: any) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to book appointment' };
      }
      await refreshAll();
      return { success: true, appointment: data.appointment };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error booking appointment' };
    } finally {
      setIsSyncing(false);
    }
  };

  const cancelAppointment = async (id: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/appointments/${id}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to cancel appointment' };
      }
      await refreshAll();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    } finally {
      setIsSyncing(false);
    }
  };

  const rescheduleAppointment = async (id: string, date: string, time: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/appointments/${id}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to reschedule appointment' };
      }
      await refreshAll();
      return { success: true, appointment: data.appointment };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    } finally {
      setIsSyncing(false);
    }
  };

  const submitPayment = async (
    id: string,
    paymentMethod: string,
    paymentReference: string,
    paymentScreenshotUrl?: string
  ) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/appointments/${id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod, paymentReference, paymentScreenshotUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to submit payment' };
      }
      await refreshAll();
      return { success: true, appointment: data.appointment };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    } finally {
      setIsSyncing(false);
    }
  };

  const verifyAppointment = async (
    id: string,
    action: 'approve' | 'reject' | 'checkin' | 'complete' | 'cancel',
    notes?: string
  ) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/admin/payments/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to verify appointment' };
      }
      await refreshAll();
      return { success: true, appointment: data.appointment };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    } finally {
      setIsSyncing(false);
    }
  };

  const updateDoctorSchedule = async (doctor: Doctor) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/doctors/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctor),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update schedule' };
      }
      await refreshAll();
      return { success: true, doctor: data.doctor };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleDoctorLeave = async (
    doctorId: string,
    isAvailable: boolean,
    unavailabilityReason?: string
  ) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/doctors/toggle-leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId, isAvailable, unavailabilityReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to toggle availability' };
      }
      await refreshAll();
      return { success: true, doctor: data.doctor };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    } finally {
      setIsSyncing(false);
    }
  };

  const createHospitalEvent = async (eventData: Omit<HospitalEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to create event' };
      }
      await refreshAll();
      return { success: true, event: data.event };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    } finally {
      setIsSyncing(false);
    }
  };

  const updateHospitalEvent = async (id: string, updates: Partial<HospitalEvent>) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update event' };
      }
      await refreshAll();
      return { success: true, event: data.event };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteHospitalEvent = async (id: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to delete event' };
      }
      await refreshAll();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    } finally {
      setIsSyncing(false);
    }
  };

  const pruneExpiredEvents = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/events/prune-expired', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to prune events' };
      }
      await refreshAll();
      return { success: true, removedCount: data.removedCount };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    } finally {
      setIsSyncing(false);
    }
  };

  const updateHospitalInfo = async (updates: Partial<HospitalInfoData>) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/hospital-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update hospital info' };
      }
      await refreshAll();
      return { success: true, hospitalInfo: data.hospitalInfo };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <HospitalDataContext.Provider
      value={{
        doctors,
        appointments,
        hospitalEvents,
        hospitalInfo,
        departments,
        stats,
        isLiveConnected,
        isSyncing,
        lastSyncTime,
        refreshAll,
        bookAppointment,
        cancelAppointment,
        rescheduleAppointment,
        submitPayment,
        verifyAppointment,
        updateDoctorSchedule,
        toggleDoctorLeave,
        createHospitalEvent,
        updateHospitalEvent,
        deleteHospitalEvent,
        pruneExpiredEvents,
        updateHospitalInfo,
      }}
    >
      {children}
    </HospitalDataContext.Provider>
  );
};

export const useHospitalData = () => {
  const context = useContext(HospitalDataContext);
  if (!context) {
    throw new Error('useHospitalData must be used within a HospitalDataProvider');
  }
  return context;
};
