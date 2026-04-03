/**
 * Healthcare Components (React Native)
 *
 * This module exports all healthcare component generators for React Native apps.
 * Includes patient profiles, medical history, appointment calendar, and doctor components.
 */

// Patient profile components
export {
  generatePatientProfile,
  generateMedicalHistory,
  type PatientProfileOptions,
  type MedicalHistoryOptions,
} from './patient-profile.generator';

// Appointment components
export {
  generateAppointmentCalendar,
  generateAppointmentForm,
  type AppointmentCalendarOptions,
  type AppointmentFormOptions,
} from './appointment-calendar.generator';

// Doctor components
export {
  generateDoctorGrid,
  generateDoctorProfile,
  generateDoctorSchedule,
  type DoctorGridOptions,
  type DoctorProfileOptions,
  type DoctorScheduleOptions,
} from './doctor-grid.generator';
