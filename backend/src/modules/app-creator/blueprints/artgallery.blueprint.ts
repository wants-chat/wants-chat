import { Blueprint } from './blueprint.interface';

/**
 * Art Gallery Blueprint
 */
export const artgalleryBlueprint: Blueprint = {
  appType: 'artgallery',
  description: 'Art gallery app with artworks, artists, exhibitions, and sales',

  coreEntities: ['artwork', 'artist', 'exhibition', 'sale', 'collection', 'visitor'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Artworks', path: '/artworks', icon: 'Palette' },
        { label: 'Artists', path: '/artists', icon: 'User' },
        { label: 'Exhibitions', path: '/exhibitions', icon: 'Frame' },
        { label: 'Sales', path: '/sales', icon: 'DollarSign' },
        { label: 'Collections', path: '/collections', icon: 'FolderOpen' },
      ]}},
      { id: 'gallery-stats', component: 'gallery-stats', position: 'main' },
      { id: 'current-exhibitions', component: 'exhibition-list', entity: 'exhibition', position: 'main' },
      { id: 'recent-sales', component: 'sales-list', entity: 'sale', position: 'main' },
    ]},
    { path: '/artworks', name: 'Artworks', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'artwork-filters', component: 'artwork-filters', entity: 'artwork', position: 'main' },
      { id: 'artwork-grid', component: 'artwork-grid', entity: 'artwork', position: 'main' },
    ]},
    { path: '/artworks/:id', name: 'Artwork Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'artwork-detail', component: 'artwork-detail', entity: 'artwork', position: 'main' },
    ]},
    { path: '/artists', name: 'Artists', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'artist-grid', component: 'artist-grid-gallery', entity: 'artist', position: 'main' },
    ]},
    { path: '/artists/:id', name: 'Artist Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'artist-profile', component: 'artist-profile-gallery', entity: 'artist', position: 'main' },
      { id: 'artist-works', component: 'artist-works', entity: 'artwork', position: 'main' },
    ]},
    { path: '/exhibitions', name: 'Exhibitions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'exhibition-grid', component: 'exhibition-grid', entity: 'exhibition', position: 'main' },
    ]},
    { path: '/exhibitions/:id', name: 'Exhibition Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'exhibition-header', component: 'exhibition-header', entity: 'exhibition', position: 'main' },
      { id: 'exhibition-artworks', component: 'exhibition-artworks', entity: 'artwork', position: 'main' },
    ]},
    { path: '/sales', name: 'Sales', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'sales-stats', component: 'sales-stats-gallery', position: 'main' },
      { id: 'sales-table', component: 'sales-table', entity: 'sale', position: 'main' },
    ]},
    { path: '/collections', name: 'Collections', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'collection-grid', component: 'collection-grid', entity: 'collection', position: 'main' },
    ]},
    { path: '/gallery', name: 'Public Gallery', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-gallery', component: 'public-gallery', entity: 'artwork', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/artworks', entity: 'artwork', operation: 'list' },
    { method: 'GET', path: '/artworks/:id', entity: 'artwork', operation: 'get' },
    { method: 'POST', path: '/artworks', entity: 'artwork', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/artists', entity: 'artist', operation: 'list' },
    { method: 'GET', path: '/artists/:id', entity: 'artist', operation: 'get' },
    { method: 'GET', path: '/exhibitions', entity: 'exhibition', operation: 'list' },
    { method: 'GET', path: '/exhibitions/:id', entity: 'exhibition', operation: 'get' },
    { method: 'GET', path: '/sales', entity: 'sale', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/sales', entity: 'sale', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    artwork: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'year', type: 'integer' },
        { name: 'medium', type: 'string' },
        { name: 'dimensions', type: 'json' },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'image_url', type: 'image', required: true },
        { name: 'images', type: 'json' },
        { name: 'provenance', type: 'text' },
        { name: 'edition', type: 'string' },
        { name: 'is_featured', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'artist' },
        { type: 'belongsTo', target: 'collection' },
      ],
    },
    artist: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'birth_year', type: 'integer' },
        { name: 'nationality', type: 'string' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'website', type: 'url' },
        { name: 'represented', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'artwork' }],
    },
    exhibition: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date', required: true },
        { name: 'curator', type: 'string' },
        { name: 'location', type: 'string' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [{ type: 'hasMany', target: 'artwork' }],
    },
    sale: {
      defaultFields: [
        { name: 'sale_date', type: 'date', required: true },
        { name: 'price', type: 'decimal', required: true },
        { name: 'buyer_name', type: 'string' },
        { name: 'buyer_email', type: 'email' },
        { name: 'commission', type: 'decimal' },
        { name: 'payment_status', type: 'enum' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'belongsTo', target: 'artwork' }],
    },
    collection: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'image_url', type: 'image' },
        { name: 'is_public', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'artwork' }],
    },
  },
};

export default artgalleryBlueprint;
