import { Blueprint } from './blueprint.interface';

/**
 * Bookstore Blueprint
 */
export const bookstoreBlueprint: Blueprint = {
  appType: 'bookstore',
  description: 'Bookstore app with books, orders, events, book clubs, and customer management',

  coreEntities: ['book', 'order', 'event', 'book_club', 'customer', 'author'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Books', path: '/books', icon: 'BookOpen' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingCart' },
        { label: 'Events', path: '/events', icon: 'Calendar' },
        { label: 'Book Clubs', path: '/book-clubs', icon: 'Users' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Authors', path: '/authors', icon: 'Pen' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-events', component: 'appointment-list', entity: 'event', position: 'main' },
    ]},
    { path: '/books', name: 'Books', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'book', position: 'main' },
      { id: 'book-grid', component: 'product-grid', entity: 'book', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-table', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/events', name: 'Events', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-calendar', component: 'appointment-calendar', entity: 'event', position: 'main' },
      { id: 'event-table', component: 'data-table', entity: 'event', position: 'main' },
    ]},
    { path: '/book-clubs', name: 'Book Clubs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'club-table', component: 'data-table', entity: 'book_club', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/authors', name: 'Authors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'author-grid', component: 'staff-grid', entity: 'author', position: 'main' },
    ]},
    { path: '/shop', name: 'Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'book', position: 'main' },
      { id: 'book-display', component: 'product-grid', entity: 'book', position: 'main' },
    ]},
    { path: '/join-club', name: 'Join Book Club', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'club-display', component: 'product-grid', entity: 'book_club', position: 'main' },
      { id: 'join-form', component: 'booking-wizard', entity: 'book_club', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/books', entity: 'book', operation: 'list' },
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
    { method: 'GET', path: '/events', entity: 'event', operation: 'list' },
    { method: 'GET', path: '/book-clubs', entity: 'book_club', operation: 'list' },
    { method: 'POST', path: '/book-clubs/join', entity: 'book_club', operation: 'update' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/authors', entity: 'author', operation: 'list' },
  ],

  entityConfig: {
    book: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'isbn', type: 'string', required: true },
        { name: 'author', type: 'string', required: true },
        { name: 'publisher', type: 'string' },
        { name: 'publication_date', type: 'date' },
        { name: 'genre', type: 'enum' },
        { name: 'subgenre', type: 'string' },
        { name: 'format', type: 'enum' },
        { name: 'pages', type: 'integer' },
        { name: 'language', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'cost', type: 'decimal' },
        { name: 'quantity', type: 'integer' },
        { name: 'location', type: 'string' },
        { name: 'is_bestseller', type: 'boolean' },
        { name: 'staff_pick', type: 'boolean' },
        { name: 'cover_image', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'author' },
      ],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'fulfillment_type', type: 'enum' },
        { name: 'special_order', type: 'boolean' },
        { name: 'gift_wrap', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    event: {
      defaultFields: [
        { name: 'event_name', type: 'string', required: true },
        { name: 'event_type', type: 'enum', required: true },
        { name: 'event_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'description', type: 'text' },
        { name: 'featured_author', type: 'string' },
        { name: 'featured_book', type: 'string' },
        { name: 'capacity', type: 'integer' },
        { name: 'registered', type: 'integer' },
        { name: 'price', type: 'decimal' },
        { name: 'location', type: 'string' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    book_club: {
      defaultFields: [
        { name: 'club_name', type: 'string', required: true },
        { name: 'genre_focus', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'meeting_schedule', type: 'json' },
        { name: 'current_book', type: 'string' },
        { name: 'past_books', type: 'json' },
        { name: 'upcoming_books', type: 'json' },
        { name: 'leader', type: 'string' },
        { name: 'members', type: 'json' },
        { name: 'max_members', type: 'integer' },
        { name: 'membership_fee', type: 'decimal' },
        { name: 'is_open', type: 'boolean' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'reading_preferences', type: 'json' },
        { name: 'favorite_authors', type: 'json' },
        { name: 'wish_list', type: 'json' },
        { name: 'loyalty_points', type: 'integer' },
        { name: 'total_purchases', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'order' },
      ],
    },
    author: {
      defaultFields: [
        { name: 'author_name', type: 'string', required: true },
        { name: 'bio', type: 'text' },
        { name: 'genres', type: 'json' },
        { name: 'website', type: 'string' },
        { name: 'social_media', type: 'json' },
        { name: 'books_in_store', type: 'json' },
        { name: 'is_local', type: 'boolean' },
        { name: 'available_for_events', type: 'boolean' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'book' },
      ],
    },
  },
};

export default bookstoreBlueprint;
