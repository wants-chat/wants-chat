import { Blueprint } from './blueprint.interface';

/**
 * Tattoo Parlor / Tattoo Studio Blueprint
 */
export const tattooBlueprint: Blueprint = {
  appType: 'tattoo',
  description: 'Tattoo studio app with appointments, artist portfolios, designs, and consultations',

  coreEntities: ['appointment', 'consultation', 'customer', 'artist', 'design', 'aftercare'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Consultations', path: '/consultations', icon: 'MessageCircle' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Artists', path: '/artists', icon: 'Brush' },
        { label: 'Designs', path: '/designs', icon: 'Image' },
        { label: 'Aftercare', path: '/aftercare', icon: 'Heart' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-appointments', component: 'appointment-list', entity: 'appointment', position: 'main' },
    ]},
    { path: '/appointments', name: 'Appointments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-calendar', component: 'appointment-calendar', entity: 'appointment', position: 'main' },
      { id: 'appointment-table', component: 'data-table', entity: 'appointment', position: 'main' },
    ]},
    { path: '/consultations', name: 'Consultations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'consult-calendar', component: 'appointment-calendar', entity: 'consultation', position: 'main' },
      { id: 'consult-table', component: 'data-table', entity: 'consultation', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/artists', name: 'Artists', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'artist-grid', component: 'staff-grid', entity: 'artist', position: 'main' },
    ]},
    { path: '/designs', name: 'Designs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'design-grid', component: 'product-grid', entity: 'design', position: 'main' },
    ]},
    { path: '/aftercare', name: 'Aftercare', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'aftercare-table', component: 'data-table', entity: 'aftercare', position: 'main' },
    ]},
    { path: '/book', name: 'Book Consultation', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'booking-wizard', entity: 'consultation', position: 'main' },
    ]},
    { path: '/gallery', name: 'Gallery', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'portfolio', component: 'product-grid', entity: 'design', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/appointments', entity: 'appointment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/appointments', entity: 'appointment', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/consultations', entity: 'consultation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/consultations', entity: 'consultation', operation: 'create' },
    { method: 'GET', path: '/clients', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/artists', entity: 'artist', operation: 'list' },
    { method: 'GET', path: '/designs', entity: 'design', operation: 'list' },
    { method: 'GET', path: '/aftercare', entity: 'aftercare', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    appointment: {
      defaultFields: [
        { name: 'appointment_number', type: 'string', required: true },
        { name: 'appointment_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'estimated_hours', type: 'decimal' },
        { name: 'tattoo_type', type: 'enum', required: true },
        { name: 'placement', type: 'string' },
        { name: 'size', type: 'string' },
        { name: 'design_description', type: 'text' },
        { name: 'reference_images', type: 'json' },
        { name: 'final_design', type: 'image' },
        { name: 'deposit_amount', type: 'decimal' },
        { name: 'deposit_paid', type: 'boolean' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'estimated_cost', type: 'decimal' },
        { name: 'final_cost', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'artist' },
        { type: 'belongsTo', target: 'consultation' },
      ],
    },
    consultation: {
      defaultFields: [
        { name: 'consult_number', type: 'string', required: true },
        { name: 'consult_date', type: 'datetime', required: true },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'tattoo_idea', type: 'text' },
        { name: 'placement', type: 'string' },
        { name: 'size_estimate', type: 'string' },
        { name: 'style_preference', type: 'enum' },
        { name: 'reference_images', type: 'json' },
        { name: 'first_tattoo', type: 'boolean' },
        { name: 'discussed_notes', type: 'text' },
        { name: 'price_estimate', type: 'decimal' },
        { name: 'time_estimate', type: 'string' },
        { name: 'deposit_required', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'artist' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'id_verified', type: 'boolean' },
        { name: 'id_photo', type: 'image' },
        { name: 'allergies', type: 'json' },
        { name: 'medical_conditions', type: 'json' },
        { name: 'tattoo_history', type: 'json' },
        { name: 'waiver_signed', type: 'boolean' },
        { name: 'waiver_date', type: 'date' },
        { name: 'total_sessions', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'consultation' },
      ],
    },
    artist: {
      defaultFields: [
        { name: 'artist_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'styles', type: 'json' },
        { name: 'specialties', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'portfolio', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'minimum_booking', type: 'decimal' },
        { name: 'deposit_required', type: 'decimal' },
        { name: 'schedule', type: 'json' },
        { name: 'instagram', type: 'string' },
        { name: 'years_experience', type: 'integer' },
        { name: 'is_guest_artist', type: 'boolean' },
        { name: 'guest_dates', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'design' },
      ],
    },
    design: {
      defaultFields: [
        { name: 'design_name', type: 'string', required: true },
        { name: 'style', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'image_url', type: 'image', required: true },
        { name: 'placement_suggestions', type: 'json' },
        { name: 'size_options', type: 'json' },
        { name: 'estimated_time', type: 'string' },
        { name: 'price_range', type: 'json' },
        { name: 'is_flash', type: 'boolean' },
        { name: 'flash_price', type: 'decimal' },
        { name: 'is_available', type: 'boolean' },
        { name: 'times_done', type: 'integer' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'artist' },
      ],
    },
    aftercare: {
      defaultFields: [
        { name: 'followup_date', type: 'date', required: true },
        { name: 'healing_status', type: 'enum' },
        { name: 'healing_photos', type: 'json' },
        { name: 'issues_reported', type: 'json' },
        { name: 'touchup_needed', type: 'boolean' },
        { name: 'touchup_scheduled', type: 'date' },
        { name: 'aftercare_instructions_sent', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'appointment' },
      ],
    },
  },
};

export default tattooBlueprint;
