import { Blueprint } from './blueprint.interface';

/**
 * Booking/Appointment Blueprint
 *
 * Defines the structure for a booking application:
 * - Service catalog
 * - Staff/provider management
 * - Appointment scheduling
 * - Calendar integration
 * - Customer management
 */
export const bookingBlueprint: Blueprint = {
  appType: 'booking',
  description: 'Booking system with services, appointments, and calendar',

  coreEntities: ['service', 'staff', 'appointment', 'customer', 'schedule', 'review'],

  commonFields: {
    timestamps: true,
    softDelete: true,
    userOwnership: true,
  },

  pages: [
    // Public Booking Page
    {
      path: '/',
      name: 'Book Appointment',
      layout: 'landing',
      sections: [
        {
          id: 'hero',
          component: 'hero',
          position: 'full',
          props: {
            title: 'Book Your Appointment',
            subtitle: 'Easy online scheduling',
            primaryCTA: 'Book Now',
            primaryCTALink: '/book',
          },
        },
        {
          id: 'services',
          component: 'service-grid',
          entity: 'service',
          position: 'main',
          props: {
            title: 'Our Services',
          },
        },
        {
          id: 'staff',
          component: 'staff-grid',
          entity: 'staff',
          position: 'main',
          props: {
            title: 'Meet Our Team',
          },
        },
        {
          id: 'reviews',
          component: 'review-carousel',
          entity: 'review',
          position: 'main',
          props: {
            title: 'What Our Customers Say',
          },
        },
      ],
    },
    // Booking Flow
    {
      path: '/book',
      name: 'Select Service',
      layout: 'single-column',
      sections: [
        {
          id: 'booking-wizard',
          component: 'booking-wizard',
          entity: 'appointment',
          position: 'main',
          props: {
            steps: ['service', 'staff', 'datetime', 'details', 'confirm'],
          },
        },
      ],
    },
    {
      path: '/book/confirm',
      name: 'Confirm Booking',
      layout: 'single-column',
      sections: [
        {
          id: 'booking-confirmation',
          component: 'booking-confirmation',
          entity: 'appointment',
          position: 'main',
        },
      ],
    },
    // My Appointments
    {
      path: '/appointments',
      name: 'My Appointments',
      layout: 'single-column',
      requiresAuth: true,
      sections: [
        {
          id: 'appointments-list',
          component: 'appointment-list',
          entity: 'appointment',
          position: 'main',
          props: {
            title: 'My Appointments',
            userScoped: true,
          },
        },
      ],
    },
    {
      path: '/appointments/:id',
      name: 'Appointment Detail',
      layout: 'single-column',
      requiresAuth: true,
      sections: [
        {
          id: 'appointment-detail',
          component: 'appointment-detail',
          entity: 'appointment',
          position: 'main',
        },
      ],
    },
    // Admin Dashboard
    {
      path: '/admin',
      name: 'Dashboard',
      layout: 'dashboard',
      requiresAuth: true,
      adminOnly: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            links: [
              { label: 'Dashboard', path: '/admin', icon: 'LayoutDashboard' },
              { label: 'Calendar', path: '/admin/calendar', icon: 'Calendar' },
              { label: 'Appointments', path: '/admin/appointments', icon: 'Clock' },
              { label: 'Services', path: '/admin/services', icon: 'Briefcase' },
              { label: 'Staff', path: '/admin/staff', icon: 'Users' },
              { label: 'Customers', path: '/admin/customers', icon: 'UserCircle' },
            ],
          },
        },
        {
          id: 'stats',
          component: 'stats-cards',
          position: 'main',
          props: {
            stats: ['appointments_today', 'revenue_month', 'new_customers', 'rating'],
          },
        },
        {
          id: 'upcoming',
          component: 'appointment-list',
          entity: 'appointment',
          position: 'main',
          props: {
            title: 'Upcoming Appointments',
            limit: 10,
          },
        },
      ],
    },
    // Admin Calendar
    {
      path: '/admin/calendar',
      name: 'Calendar',
      layout: 'dashboard',
      requiresAuth: true,
      adminOnly: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'calendar',
          component: 'calendar-view',
          entity: 'appointment',
          position: 'main',
          props: {
            view: 'week',
          },
        },
      ],
    },
    // Admin Services
    {
      path: '/admin/services',
      name: 'Manage Services',
      layout: 'dashboard',
      requiresAuth: true,
      adminOnly: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'services-table',
          component: 'data-table',
          entity: 'service',
          position: 'main',
          props: {
            title: 'Services',
            showCreate: true,
            showEdit: true,
            showDelete: true,
            columns: ['name', 'duration', 'price', 'is_active'],
          },
        },
      ],
    },
    // Admin Staff
    {
      path: '/admin/staff',
      name: 'Manage Staff',
      layout: 'dashboard',
      requiresAuth: true,
      adminOnly: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'staff-table',
          component: 'data-table',
          entity: 'staff',
          position: 'main',
          props: {
            title: 'Staff',
            showCreate: true,
            showEdit: true,
            columns: ['name', 'email', 'role', 'is_active'],
          },
        },
      ],
    },
  ],

  endpoints: [
    // Services
    { method: 'GET', path: '/services', entity: 'service', operation: 'list' },
    { method: 'GET', path: '/services/:id', entity: 'service', operation: 'get' },
    { method: 'POST', path: '/services', entity: 'service', operation: 'create', requiresAuth: true, adminOnly: true },
    { method: 'PUT', path: '/services/:id', entity: 'service', operation: 'update', requiresAuth: true, adminOnly: true },
    { method: 'DELETE', path: '/services/:id', entity: 'service', operation: 'delete', requiresAuth: true, adminOnly: true },

    // Staff
    { method: 'GET', path: '/staff', entity: 'staff', operation: 'list' },
    { method: 'GET', path: '/staff/:id', entity: 'staff', operation: 'get' },
    { method: 'GET', path: '/staff/:id/availability', entity: 'schedule', operation: 'list' },
    { method: 'POST', path: '/staff', entity: 'staff', operation: 'create', requiresAuth: true, adminOnly: true },
    { method: 'PUT', path: '/staff/:id', entity: 'staff', operation: 'update', requiresAuth: true, adminOnly: true },

    // Appointments
    { method: 'GET', path: '/appointments', entity: 'appointment', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/appointments/:id', entity: 'appointment', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/appointments', entity: 'appointment', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/appointments/:id', entity: 'appointment', operation: 'update', requiresAuth: true },
    { method: 'PATCH', path: '/appointments/:id/cancel', entity: 'appointment', operation: 'update', requiresAuth: true },
    { method: 'PATCH', path: '/appointments/:id/status', entity: 'appointment', operation: 'update', requiresAuth: true, adminOnly: true },

    // Availability
    { method: 'GET', path: '/availability', entity: 'schedule', operation: 'list' },
    { method: 'POST', path: '/schedules', entity: 'schedule', operation: 'create', requiresAuth: true, adminOnly: true },

    // Customers
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true, adminOnly: true },
    { method: 'GET', path: '/customers/:id', entity: 'customer', operation: 'get', requiresAuth: true, adminOnly: true },

    // Reviews
    { method: 'GET', path: '/reviews', entity: 'review', operation: 'list' },
    { method: 'POST', path: '/reviews', entity: 'review', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    service: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'duration', type: 'integer', required: true },
        { name: 'price', type: 'decimal', required: true },
        { name: 'image_url', type: 'image' },
        { name: 'category', type: 'string' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'staff' },
      ],
    },
    staff: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'role', type: 'string' },
        { name: 'bio', type: 'text' },
        { name: 'avatar_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'user' },
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'schedule' },
      ],
    },
    appointment: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'start_time', type: 'string', required: true },
        { name: 'end_time', type: 'string', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'notes', type: 'text' },
        { name: 'total_price', type: 'decimal' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'service' },
        { type: 'belongsTo', target: 'staff' },
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'user' },
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'review' },
      ],
    },
    schedule: {
      defaultFields: [
        { name: 'day_of_week', type: 'integer', required: true },
        { name: 'start_time', type: 'string', required: true },
        { name: 'end_time', type: 'string', required: true },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'staff' },
      ],
    },
    review: {
      defaultFields: [
        { name: 'rating', type: 'integer', required: true },
        { name: 'comment', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'appointment' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
  },
};

export default bookingBlueprint;
