/**
 * Beauty Component Generators Index
 *
 * Exports all beauty/salon/spa component generators for the App Creator.
 * These generators produce standalone React components with @tanstack/react-query
 * for data fetching and full dark mode support.
 */

// Salon Components
export {
  generateAppointmentCalendarSalon,
  generateSalonStats,
  generateStylistProfile,
  generateStylistSchedule,
  generateClientProfileSalon,
  type SalonOptions,
} from './salon.generator';

// Spa Components
export {
  generateAppointmentCalendarSpa,
  generateSpaStats,
  generateSpaSchedule,
  generateTherapistProfileSpa,
  generateClientProfileSpa,
  type SpaOptions,
} from './spa.generator';
