/**
 * Booking Component Generators Index
 */

export { generateServiceGrid, generateStaffGrid, type ServiceGridOptions } from './service-grid.generator';
export { generateBookingWizard, type BookingWizardOptions } from './booking-wizard.generator';
export { generateAppointmentList, generateBookingConfirmation, generateDatePicker, generateTimeSlots, type AppointmentListOptions } from './appointment-list.generator';

// Extended booking components
export {
  generateBookingCalendarEscape,
  generateBookingFiltersRental,
  generateBookingFiltersTravel,
  generateBookingListTodayEscape,
  generateBookingListTravel,
  type ExtendedBookingOptions,
} from './extended-booking.generator';
