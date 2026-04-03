/**
 * Paternal checkup appointment types
 */

export interface PaternalCheckupAppointment {
  id: string;
  userId: string;

  // Appointment Details
  title: string;
  type: string;
  doctor: string;
  location: string;
  date: string;
  time: string;
  week?: number;

  // Contact Information
  phone?: string;
  email?: string;

  // Additional Information
  notes?: string;

  // Reminder Settings
  reminder: boolean;
  reminderTime?: string;

  // Status
  status?: string;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;

  // Legacy fields for backward compatibility
  user_id?: string;
  reminder_time?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaternalCheckupAppointmentFormData {
  title: string;
  type: string;
  doctor: string;
  location: string;
  date: string;
  time: string;
  week?: string;
  phone?: string;
  email?: string;
  notes?: string;
  reminder: boolean;
  reminderTime: string;
}