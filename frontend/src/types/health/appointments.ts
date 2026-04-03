/**
 * Appointment-related types
 */

export type AppointmentType = 
  | 'routine_checkup' 
  | 'consultation' 
  | 'follow_up' 
  | 'emergency' 
  | 'specialist' 
  | 'diagnostic' 
  | 'preventive' 
  | 'dental' 
  | 'vision' 
  | 'mental_health' 
  | 'physical_therapy' 
  | 'lab_work';

export interface Appointment {
  id: string;
  userId: string;

  // Appointment details
  appointmentType: AppointmentType;
  providerName: string;
  doctorName?: string; // For forms
  providerSpecialty?: string;

  // Date and time
  appointmentDate: string;
  appointmentTime?: string;
  durationMinutes?: number;

  // Location and details
  location?: string;
  hospitalClinic?: string; // For forms
  reason?: string;
  reasonForVisit?: string; // For forms
  notes?: string;

  // Status and reminders
  status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  reminderMinutes?: number;
  reminderSet?: boolean; // For forms

  // Contact info
  phoneNumber?: string;

  // Metadata
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;

  // Legacy fields for backward compatibility
  user_id?: string;
  appointment_type?: AppointmentType;
  provider_name?: string;
  provider_specialty?: string;
  appointment_date?: string;
  appointment_time?: string;
  duration_minutes?: number;
  reminder_minutes?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AppointmentFormData {
  doctorName: string;
  hospitalClinic: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: AppointmentType;
  reasonForVisit: string;
  phoneNumber?: string;
  reminderSet: boolean;
  notes?: string;
}