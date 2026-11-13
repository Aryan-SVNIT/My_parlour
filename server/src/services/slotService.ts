import { getDb } from '../db/index.js';

export interface TimeSlot {
  time: string; // HH:MM
  endTime: string; // HH:MM
  available: boolean;
  reason?: string;
}

export interface AvailabilityResult {
  date: string;
  isOpen: boolean;
  message?: string;
  slots: TimeSlot[];
}

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function calculateAvailableSlots(
  appointmentDate: string,
  totalDurationMinutes: number,
  staffId?: string
): AvailabilityResult {
  const db = getDb();
  const settings = db.website_settings;

  // Validate format YYYY-MM-DD
  const targetDate = new Date(`${appointmentDate}T00:00:00`);
  if (isNaN(targetDate.getTime())) {
    return { date: appointmentDate, isOpen: false, message: 'Invalid date format', slots: [] };
  }

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Past date check
  if (appointmentDate < todayStr) {
    return {
      date: appointmentDate,
      isOpen: false,
      message: 'Cannot book appointments for past dates.',
      slots: [],
    };
  }

  // Advance booking limit check
  const maxAdvanceDate = new Date();
  maxAdvanceDate.setDate(maxAdvanceDate.getDate() + (settings.advance_booking_days || 30));
  const maxAdvanceStr = maxAdvanceDate.toISOString().split('T')[0];
  if (appointmentDate > maxAdvanceStr) {
    return {
      date: appointmentDate,
      isOpen: false,
      message: `Bookings can only be made up to ${settings.advance_booking_days || 30} days in advance.`,
      slots: [],
    };
  }

  // Holiday check
  const holiday = db.holidays.find((h) => h.holiday_date === appointmentDate);
  if (holiday) {
    return {
      date: appointmentDate,
      isOpen: false,
      message: `The parlour is closed on this date for "${holiday.title}".`,
      slots: [],
    };
  }

  // Day of week check (0=Sunday, 1=Monday, ...)
  const dayOfWeek = targetDate.getDay();
  const businessHours = db.business_hours.find((b) => b.day_of_week === dayOfWeek);

  if (!businessHours || businessHours.is_closed) {
    return {
      date: appointmentDate,
      isOpen: false,
      message: `The parlour is closed on ${businessHours?.day_name || 'this day'}.`,
      slots: [],
    };
  }

  const openMinutes = timeToMinutes(businessHours.open_time);
  const closeMinutes = timeToMinutes(businessHours.close_time);
  const slotInterval = businessHours.slot_interval_minutes || 30;
  const breakStartMin = businessHours.break_start ? timeToMinutes(businessHours.break_start) : null;
  const breakEndMin = businessHours.break_end ? timeToMinutes(businessHours.break_end) : null;

  // Active staff count determines capacity
  const activeStaff = db.staff.filter((s) => s.is_active);
  const capacity = activeStaff.length > 0 ? activeStaff.length : 1;

  // Fetch non-cancelled appointments for this date
  const dayAppointments = db.appointments.filter(
    (a) => a.appointment_date === appointmentDate && a.status !== 'cancelled' && a.status !== 'rejected'
  );

  const isToday = appointmentDate === todayStr;
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
  const noticeMinutes = (settings.min_booking_notice_hours || 1) * 60;

  const slots: TimeSlot[] = [];

  for (let startMin = openMinutes; startMin + totalDurationMinutes <= closeMinutes; startMin += slotInterval) {
    const endMin = startMin + totalDurationMinutes;
    const timeStr = minutesToTime(startMin);
    const endTimeStr = minutesToTime(endMin);

    // If today, check if slot is past or within minimum notice window
    if (isToday && startMin <= currentTotalMinutes + noticeMinutes) {
      continue; // do not include past slots for today
    }

    // Check if slot overlaps with parlour break
    if (breakStartMin !== null && breakEndMin !== null) {
      const overlapsWithBreak = Math.max(startMin, breakStartMin) < Math.min(endMin, breakEndMin);
      if (overlapsWithBreak) {
        continue; // Skip slots that overlap with staff lunch/break
      }
    }

    // Check overlaps with existing bookings
    let overlappingBookingsCount = 0;
    for (const apt of dayAppointments) {
      const aptStart = timeToMinutes(apt.start_time);
      const aptEnd = timeToMinutes(apt.end_time);

      const hasOverlap = Math.max(startMin, aptStart) < Math.min(endMin, aptEnd);
      if (hasOverlap) {
        if (staffId && apt.staff_id === staffId) {
          overlappingBookingsCount = capacity; // staff busy
          break;
        }
        overlappingBookingsCount++;
      }
    }

    const available = overlappingBookingsCount < capacity;

    slots.push({
      time: timeStr,
      endTime: endTimeStr,
      available,
      reason: available ? undefined : 'Slot fully booked',
    });
  }

  return {
    date: appointmentDate,
    isOpen: true,
    slots,
  };
}

