import { Blueprint } from './blueprint.interface';

/**
 * Library Blueprint
 */
export const libraryBlueprint: Blueprint = {
  appType: 'library',
  description: 'Library management app with books, members, loans, and reservations',

  coreEntities: ['book', 'member', 'loan', 'reservation', 'category', 'author'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Catalog', path: '/catalog', icon: 'BookOpen' },
        { label: 'Members', path: '/members', icon: 'Users' },
        { label: 'Loans', path: '/loans', icon: 'ArrowLeftRight' },
        { label: 'Reservations', path: '/reservations', icon: 'Clock' },
        { label: 'Reports', path: '/reports', icon: 'BarChart' },
      ]}},
      { id: 'library-stats', component: 'library-stats', position: 'main' },
      { id: 'overdue-loans', component: 'overdue-loans', entity: 'loan', position: 'main' },
      { id: 'recent-activity', component: 'library-activity', entity: 'loan', position: 'main' },
    ]},
    { path: '/catalog', name: 'Catalog', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'book-search', component: 'book-search', entity: 'book', position: 'main' },
      { id: 'book-grid', component: 'book-grid', entity: 'book', position: 'main' },
    ]},
    { path: '/catalog/:id', name: 'Book Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'book-detail', component: 'book-detail-library', entity: 'book', position: 'main' },
      { id: 'book-copies', component: 'book-copies', entity: 'book', position: 'main' },
    ]},
    { path: '/members', name: 'Members', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-table', component: 'member-table-library', entity: 'member', position: 'main' },
    ]},
    { path: '/members/:id', name: 'Member Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-profile', component: 'member-profile-library', entity: 'member', position: 'main' },
      { id: 'member-loans', component: 'member-loans', entity: 'loan', position: 'main' },
    ]},
    { path: '/loans', name: 'Loans', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'loan-filters', component: 'loan-filters', entity: 'loan', position: 'main' },
      { id: 'loan-table', component: 'loan-table', entity: 'loan', position: 'main' },
    ]},
    { path: '/loans/checkout', name: 'Checkout', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'checkout-form', component: 'checkout-form-library', entity: 'loan', position: 'main' },
    ]},
    { path: '/loans/return', name: 'Return', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'return-form', component: 'return-form', entity: 'loan', position: 'main' },
    ]},
    { path: '/reservations', name: 'Reservations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'reservation-table', component: 'reservation-table', entity: 'reservation', position: 'main' },
    ]},
    { path: '/search', name: 'Search Catalog', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-catalog', component: 'public-catalog', entity: 'book', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/books', entity: 'book', operation: 'list' },
    { method: 'GET', path: '/books/:id', entity: 'book', operation: 'get' },
    { method: 'POST', path: '/books', entity: 'book', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/members', entity: 'member', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/members/:id', entity: 'member', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/members', entity: 'member', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/loans', entity: 'loan', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/loans', entity: 'loan', operation: 'create', requiresAuth: true },
    { method: 'PATCH', path: '/loans/:id/return', entity: 'loan', operation: 'update', requiresAuth: true },
    { method: 'GET', path: '/reservations', entity: 'reservation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/reservations', entity: 'reservation', operation: 'create' },
  ],

  entityConfig: {
    book: {
      defaultFields: [
        { name: 'isbn', type: 'string', required: true },
        { name: 'title', type: 'string', required: true },
        { name: 'subtitle', type: 'string' },
        { name: 'publisher', type: 'string' },
        { name: 'publication_year', type: 'integer' },
        { name: 'edition', type: 'string' },
        { name: 'pages', type: 'integer' },
        { name: 'language', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'cover_image', type: 'image' },
        { name: 'total_copies', type: 'integer' },
        { name: 'available_copies', type: 'integer' },
        { name: 'location', type: 'string' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'category' },
        { type: 'belongsTo', target: 'author' },
        { type: 'hasMany', target: 'loan' },
      ],
    },
    member: {
      defaultFields: [
        { name: 'member_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'membership_type', type: 'enum' },
        { name: 'join_date', type: 'date' },
        { name: 'expiry_date', type: 'date' },
        { name: 'status', type: 'enum' },
        { name: 'books_limit', type: 'integer' },
        { name: 'current_loans', type: 'integer' },
      ],
      relationships: [{ type: 'hasMany', target: 'loan' }],
    },
    loan: {
      defaultFields: [
        { name: 'checkout_date', type: 'date', required: true },
        { name: 'due_date', type: 'date', required: true },
        { name: 'return_date', type: 'date' },
        { name: 'status', type: 'enum', required: true },
        { name: 'renewals', type: 'integer' },
        { name: 'fine_amount', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'book' },
        { type: 'belongsTo', target: 'member' },
      ],
    },
    reservation: {
      defaultFields: [
        { name: 'reservation_date', type: 'date', required: true },
        { name: 'expiry_date', type: 'date' },
        { name: 'status', type: 'enum', required: true },
        { name: 'queue_position', type: 'integer' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'book' },
        { type: 'belongsTo', target: 'member' },
      ],
    },
  },
};

export default libraryBlueprint;
