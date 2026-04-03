/**
 * Beauty Component Generators Index (React Native)
 *
 * Exports all beauty/salon/spa component generators for React Native apps.
 * These generators produce standalone React Native components with @tanstack/react-query
 * for data fetching and @expo/vector-icons for icons.
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
