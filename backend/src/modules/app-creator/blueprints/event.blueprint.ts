import { Blueprint } from './blueprint.interface';

/**
 * Event Management Blueprint
 *
 * Defines the structure for an event management application:
 * - Events
 * - Tickets
 * - Venues
 * - Speakers/Performers
 * - Attendees
 * - Schedules
 */
export const eventBlueprint: Blueprint = {
  appType: 'event',
  description: 'Event management app with events, tickets, venues, and attendee management',

  coreEntities: ['event', 'ticket', 'venue', 'speaker', 'attendee', 'schedule', 'sponsor'],

  commonFields: {
    timestamps: true,
    softDelete: true,
    userOwnership: true,
  },

  pages: [
    // Home/Landing
    {
      path: '/',
      name: 'Home',
      layout: 'landing',
      sections: [
        {
          id: 'hero',
          component: 'hero',
          position: 'full',
          props: {
            title: 'Discover Amazing Events',
            subtitle: 'Find and book tickets to concerts, conferences, workshops, and more',
            primaryCTA: 'Browse Events',
            primaryCTALink: '/events',
            secondaryCTA: 'Create Event',
            secondaryCTALink: '/events/create',
          },
        },
        {
          id: 'featured-events',
          component: 'event-grid',
          entity: 'event',
          position: 'main',
          props: {
            title: 'Featured Events',
            limit: 6,
            featured: true,
          },
        },
        {
          id: 'upcoming-events',
          component: 'event-grid',
          entity: 'event',
          position: 'main',
          props: {
            title: 'Upcoming Events',
            limit: 8,
          },
        },
        {
          id: 'categories',
          component: 'category-grid',
          position: 'main',
          props: {
            title: 'Browse by Category',
          },
        },
      ],
    },
    // Events Listing
    {
      path: '/events',
      name: 'Events',
      layout: 'two-column',
      sections: [
        {
          id: 'event-filters',
          component: 'event-filters',
          position: 'sidebar',
        },
        {
          id: 'event-grid',
          component: 'event-grid',
          entity: 'event',
          position: 'main',
        },
      ],
    },
    // Event Detail
    {
      path: '/events/:id',
      name: 'Event Detail',
      layout: 'single-column',
      sections: [
        {
          id: 'event-header',
          component: 'event-header',
          entity: 'event',
          position: 'main',
        },
        {
          id: 'event-schedule',
          component: 'event-schedule',
          entity: 'schedule',
          position: 'main',
        },
        {
          id: 'speakers',
          component: 'speaker-grid',
          entity: 'speaker',
          position: 'main',
          props: {
            title: 'Speakers & Performers',
          },
        },
        {
          id: 'ticket-selector',
          component: 'ticket-selector',
          entity: 'ticket',
          position: 'main',
        },
        {
          id: 'venue-info',
          component: 'venue-info',
          entity: 'venue',
          position: 'main',
        },
        {
          id: 'sponsors',
          component: 'sponsor-grid',
          entity: 'sponsor',
          position: 'main',
          props: {
            title: 'Event Sponsors',
          },
        },
      ],
    },
    // Create Event
    {
      path: '/events/create',
      name: 'Create Event',
      layout: 'single-column',
      requiresAuth: true,
      sections: [
        {
          id: 'event-form',
          component: 'event-form',
          entity: 'event',
          position: 'main',
        },
      ],
    },
    // Checkout
    {
      path: '/checkout',
      name: 'Checkout',
      layout: 'single-column',
      requiresAuth: true,
      sections: [
        {
          id: 'checkout-form',
          component: 'checkout-form',
          position: 'main',
        },
      ],
    },
    // User Dashboard
    {
      path: '/dashboard',
      name: 'Dashboard',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            links: [
              { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
              { label: 'My Tickets', path: '/dashboard/tickets', icon: 'Ticket' },
              { label: 'My Events', path: '/dashboard/my-events', icon: 'Calendar' },
              { label: 'Saved Events', path: '/dashboard/saved', icon: 'Heart' },
              { label: 'Profile', path: '/dashboard/profile', icon: 'User' },
            ],
          },
        },
        {
          id: 'upcoming-events',
          component: 'attendee-events',
          entity: 'attendee',
          position: 'main',
          props: {
            title: 'Your Upcoming Events',
          },
        },
        {
          id: 'recent-tickets',
          component: 'ticket-list',
          entity: 'ticket',
          position: 'main',
          props: {
            title: 'Recent Tickets',
            limit: 5,
          },
        },
      ],
    },
    // My Tickets
    {
      path: '/dashboard/tickets',
      name: 'My Tickets',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'ticket-list',
          component: 'ticket-list',
          entity: 'ticket',
          position: 'main',
          props: {
            title: 'All Tickets',
          },
        },
      ],
    },
    // Ticket Detail
    {
      path: '/dashboard/tickets/:id',
      name: 'Ticket Detail',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'ticket-detail',
          component: 'ticket-detail',
          entity: 'ticket',
          position: 'main',
        },
      ],
    },
    // My Events (Organizer)
    {
      path: '/dashboard/my-events',
      name: 'My Events',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'organizer-events',
          component: 'organizer-events',
          entity: 'event',
          position: 'main',
          props: {
            title: 'Events You Created',
            showCreate: true,
          },
        },
      ],
    },
    // Event Analytics (Organizer)
    {
      path: '/dashboard/my-events/:id/analytics',
      name: 'Event Analytics',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'event-stats',
          component: 'event-stats',
          entity: 'event',
          position: 'main',
        },
        {
          id: 'attendee-list',
          component: 'attendee-list',
          entity: 'attendee',
          position: 'main',
          props: {
            title: 'Attendees',
          },
        },
      ],
    },
  ],

  endpoints: [
    // Events
    { method: 'GET', path: '/events', entity: 'event', operation: 'list' },
    { method: 'GET', path: '/events/:id', entity: 'event', operation: 'get' },
    { method: 'POST', path: '/events', entity: 'event', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/events/:id', entity: 'event', operation: 'update', requiresAuth: true },
    { method: 'DELETE', path: '/events/:id', entity: 'event', operation: 'delete', requiresAuth: true },
    { method: 'GET', path: '/events/:id/schedule', entity: 'schedule', operation: 'list' },
    { method: 'GET', path: '/events/:id/speakers', entity: 'speaker', operation: 'list' },
    { method: 'GET', path: '/events/:id/tickets', entity: 'ticket', operation: 'list' },
    { method: 'GET', path: '/events/:id/attendees', entity: 'attendee', operation: 'list', requiresAuth: true },

    // Tickets
    { method: 'GET', path: '/tickets', entity: 'ticket', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/tickets/:id', entity: 'ticket', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/tickets/purchase', entity: 'ticket', operation: 'create', requiresAuth: true },

    // Venues
    { method: 'GET', path: '/venues', entity: 'venue', operation: 'list' },
    { method: 'GET', path: '/venues/:id', entity: 'venue', operation: 'get' },

    // My Events (Organizer)
    { method: 'GET', path: '/my-events', entity: 'event', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/my-events/:id/stats', entity: 'event', operation: 'custom', requiresAuth: true },
  ],

  entityConfig: {
    event: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'short_description', type: 'string' },
        { name: 'category', type: 'enum', required: true },
        { name: 'type', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
        { name: 'start_date', type: 'datetime', required: true },
        { name: 'end_date', type: 'datetime', required: true },
        { name: 'timezone', type: 'string' },
        { name: 'image_url', type: 'image' },
        { name: 'gallery', type: 'json' },
        { name: 'is_online', type: 'boolean' },
        { name: 'online_url', type: 'url' },
        { name: 'max_attendees', type: 'integer' },
        { name: 'current_attendees', type: 'integer' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'is_free', type: 'boolean' },
        { name: 'tags', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'user' },
        { type: 'belongsTo', target: 'venue' },
        { type: 'hasMany', target: 'ticket' },
        { type: 'hasMany', target: 'schedule' },
        { type: 'hasMany', target: 'speaker' },
        { type: 'hasMany', target: 'sponsor' },
        { type: 'hasMany', target: 'attendee' },
      ],
    },
    ticket: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'type', type: 'enum', required: true },
        { name: 'price', type: 'decimal', required: true },
        { name: 'quantity_available', type: 'integer' },
        { name: 'quantity_sold', type: 'integer' },
        { name: 'max_per_order', type: 'integer' },
        { name: 'sale_start', type: 'datetime' },
        { name: 'sale_end', type: 'datetime' },
        { name: 'benefits', type: 'json' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'event' },
      ],
    },
    venue: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'address', type: 'string', required: true },
        { name: 'city', type: 'string', required: true },
        { name: 'state', type: 'string' },
        { name: 'country', type: 'string', required: true },
        { name: 'postal_code', type: 'string' },
        { name: 'latitude', type: 'decimal' },
        { name: 'longitude', type: 'decimal' },
        { name: 'capacity', type: 'integer' },
        { name: 'image_url', type: 'image' },
        { name: 'amenities', type: 'json' },
        { name: 'parking_info', type: 'text' },
        { name: 'accessibility_info', type: 'text' },
        { name: 'contact_email', type: 'email' },
        { name: 'contact_phone', type: 'phone' },
      ],
      relationships: [
        { type: 'hasMany', target: 'event' },
      ],
    },
    speaker: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'title', type: 'string' },
        { name: 'company', type: 'string' },
        { name: 'bio', type: 'text' },
        { name: 'avatar_url', type: 'image' },
        { name: 'linkedin_url', type: 'url' },
        { name: 'twitter_url', type: 'url' },
        { name: 'website_url', type: 'url' },
        { name: 'topics', type: 'json' },
        { name: 'is_featured', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'event' },
        { type: 'hasMany', target: 'schedule' },
      ],
    },
    attendee: {
      defaultFields: [
        { name: 'registration_date', type: 'datetime', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'ticket_type', type: 'string' },
        { name: 'check_in_time', type: 'datetime' },
        { name: 'qr_code', type: 'string' },
        { name: 'dietary_requirements', type: 'json' },
        { name: 'special_needs', type: 'text' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'user' },
        { type: 'belongsTo', target: 'event' },
        { type: 'belongsTo', target: 'ticket' },
      ],
    },
    schedule: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime', required: true },
        { name: 'location', type: 'string' },
        { name: 'type', type: 'enum' },
        { name: 'track', type: 'string' },
        { name: 'level', type: 'enum' },
        { name: 'materials_url', type: 'url' },
        { name: 'recording_url', type: 'url' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'event' },
        { type: 'belongsTo', target: 'speaker' },
      ],
    },
    sponsor: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'logo_url', type: 'image' },
        { name: 'website_url', type: 'url' },
        { name: 'tier', type: 'enum', required: true },
        { name: 'booth_location', type: 'string' },
        { name: 'contact_email', type: 'email' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'event' },
      ],
    },
  },
};

export default eventBlueprint;
