import { Blueprint } from './blueprint.interface';

/**
 * Cinema/Theater Blueprint
 */
export const cinemaBlueprint: Blueprint = {
  appType: 'cinema',
  description: 'Cinema/theater with movies, screenings, ticket sales, and seat management',

  coreEntities: ['movie', 'screening', 'ticket', 'theater', 'seat', 'concession'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Movies', path: '/movies', icon: 'Film' },
        { label: 'Screenings', path: '/screenings', icon: 'Calendar' },
        { label: 'Theaters', path: '/theaters', icon: 'Building' },
        { label: 'Tickets', path: '/tickets', icon: 'Ticket' },
        { label: 'Concessions', path: '/concessions', icon: 'Popcorn' },
      ]}},
      { id: 'cinema-stats', component: 'cinema-stats', position: 'main' },
      { id: 'today-screenings', component: 'screening-list-today', entity: 'screening', position: 'main' },
      { id: 'recent-sales', component: 'ticket-sales-recent', entity: 'ticket', position: 'main' },
    ]},
    { path: '/movies', name: 'Movies', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'movie-filters', component: 'movie-filters', entity: 'movie', position: 'main' },
      { id: 'movie-grid', component: 'movie-grid-admin', entity: 'movie', position: 'main' },
    ]},
    { path: '/movies/:id', name: 'Movie Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'movie-header', component: 'movie-header', entity: 'movie', position: 'main' },
      { id: 'movie-screenings', component: 'movie-screenings', entity: 'screening', position: 'main' },
    ]},
    { path: '/movies/new', name: 'Add Movie', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'movie-form', component: 'movie-form', entity: 'movie', position: 'main' },
    ]},
    { path: '/screenings', name: 'Screenings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'screening-calendar', component: 'screening-calendar', entity: 'screening', position: 'main' },
    ]},
    { path: '/screenings/:id', name: 'Screening Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'screening-detail', component: 'screening-detail', entity: 'screening', position: 'main' },
      { id: 'seat-map', component: 'seat-map-admin', entity: 'seat', position: 'main' },
    ]},
    { path: '/theaters', name: 'Theaters', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'theater-grid', component: 'theater-grid', entity: 'theater', position: 'main' },
    ]},
    { path: '/theaters/:id', name: 'Theater Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'theater-detail', component: 'theater-detail', entity: 'theater', position: 'main' },
      { id: 'theater-layout', component: 'theater-layout', entity: 'seat', position: 'main' },
    ]},
    { path: '/tickets', name: 'Tickets', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'ticket-stats', component: 'ticket-stats', position: 'main' },
      { id: 'ticket-table', component: 'ticket-table', entity: 'ticket', position: 'main' },
    ]},
    { path: '/concessions', name: 'Concessions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'concession-grid', component: 'concession-grid', entity: 'concession', position: 'main' },
    ]},
    { path: '/now-showing', name: 'Now Showing', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-movies', component: 'public-movie-grid', entity: 'movie', position: 'main' },
    ]},
    { path: '/movie/:id', name: 'Movie Info', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-movie', component: 'public-movie-detail', entity: 'movie', position: 'main' },
      { id: 'public-showtimes', component: 'public-showtimes', entity: 'screening', position: 'main' },
    ]},
    { path: '/book/:id', name: 'Book Tickets', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'seat-selector', component: 'seat-selector', entity: 'seat', position: 'main' },
      { id: 'ticket-checkout', component: 'ticket-checkout', entity: 'ticket', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/movies', entity: 'movie', operation: 'list' },
    { method: 'POST', path: '/movies', entity: 'movie', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/screenings', entity: 'screening', operation: 'list' },
    { method: 'POST', path: '/screenings', entity: 'screening', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/theaters', entity: 'theater', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/tickets', entity: 'ticket', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/tickets', entity: 'ticket', operation: 'create' },
    { method: 'GET', path: '/concessions', entity: 'concession', operation: 'list' },
  ],

  entityConfig: {
    movie: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'original_title', type: 'string' },
        { name: 'genre', type: 'json' },
        { name: 'duration_minutes', type: 'integer', required: true },
        { name: 'rating', type: 'string' },
        { name: 'release_date', type: 'date' },
        { name: 'description', type: 'text' },
        { name: 'director', type: 'string' },
        { name: 'cast', type: 'json' },
        { name: 'poster_url', type: 'image' },
        { name: 'trailer_url', type: 'url' },
        { name: 'language', type: 'string' },
        { name: 'subtitles', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [{ type: 'hasMany', target: 'screening' }],
    },
    screening: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'format', type: 'enum' },
        { name: 'language', type: 'string' },
        { name: 'subtitles', type: 'string' },
        { name: 'price_adult', type: 'decimal', required: true },
        { name: 'price_child', type: 'decimal' },
        { name: 'price_senior', type: 'decimal' },
        { name: 'total_seats', type: 'integer' },
        { name: 'sold_seats', type: 'integer' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'movie' },
        { type: 'belongsTo', target: 'theater' },
        { type: 'hasMany', target: 'ticket' },
      ],
    },
    theater: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'total_seats', type: 'integer', required: true },
        { name: 'rows', type: 'integer', required: true },
        { name: 'seats_per_row', type: 'integer', required: true },
        { name: 'features', type: 'json' },
        { name: 'seat_layout', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'screening' },
        { type: 'hasMany', target: 'seat' },
      ],
    },
    ticket: {
      defaultFields: [
        { name: 'ticket_number', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'seat_row', type: 'string', required: true },
        { name: 'seat_number', type: 'integer', required: true },
        { name: 'price', type: 'decimal', required: true },
        { name: 'customer_email', type: 'email' },
        { name: 'customer_name', type: 'string' },
        { name: 'status', type: 'enum', required: true },
        { name: 'qr_code', type: 'string' },
        { name: 'used_at', type: 'datetime' },
      ],
      relationships: [{ type: 'belongsTo', target: 'screening' }],
    },
    seat: {
      defaultFields: [
        { name: 'row', type: 'string', required: true },
        { name: 'number', type: 'integer', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'is_accessible', type: 'boolean' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'belongsTo', target: 'theater' }],
    },
    concession: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'sizes', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default cinemaBlueprint;
