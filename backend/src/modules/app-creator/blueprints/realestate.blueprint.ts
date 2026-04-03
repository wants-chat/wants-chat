import { Blueprint } from './blueprint.interface';

/**
 * Real Estate Blueprint
 *
 * Defines the structure for a real estate application:
 * - Property listings
 * - Agent profiles
 * - Search and filters
 * - Inquiry management
 * - Favorites/saved properties
 */
export const realestateBlueprint: Blueprint = {
  appType: 'realestate',
  description: 'Real estate platform with property listings, agents, and inquiries',

  coreEntities: ['property', 'agent', 'inquiry', 'favorite', 'viewing', 'review'],

  commonFields: {
    timestamps: true,
    softDelete: true,
    userOwnership: true,
  },

  pages: [
    // Home
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
            title: 'Find Your Dream Home',
            subtitle: 'Search thousands of properties for sale and rent',
            primaryCTA: 'Search Properties',
            primaryCTALink: '/properties',
          },
        },
        {
          id: 'search',
          component: 'property-search',
          entity: 'property',
          position: 'main',
        },
        {
          id: 'featured',
          component: 'property-grid',
          entity: 'property',
          position: 'main',
          props: {
            title: 'Featured Properties',
            limit: 6,
            featured: true,
          },
        },
        {
          id: 'agents',
          component: 'agent-grid',
          entity: 'agent',
          position: 'main',
          props: {
            title: 'Top Agents',
            limit: 4,
          },
        },
      ],
    },
    // Property Listings
    {
      path: '/properties',
      name: 'Properties',
      layout: 'two-column',
      sections: [
        {
          id: 'filters',
          component: 'property-filters',
          entity: 'property',
          position: 'sidebar',
          props: {
            filters: ['type', 'price_range', 'bedrooms', 'bathrooms', 'area', 'amenities'],
          },
        },
        {
          id: 'map-toggle',
          component: 'map-list-toggle',
          position: 'main',
        },
        {
          id: 'listings',
          component: 'property-grid',
          entity: 'property',
          position: 'main',
          props: {
            showPagination: true,
            showSort: true,
          },
        },
      ],
    },
    // Property Detail
    {
      path: '/properties/:id',
      name: 'Property Detail',
      layout: 'single-column',
      sections: [
        {
          id: 'gallery',
          component: 'property-gallery',
          entity: 'property',
          position: 'main',
        },
        {
          id: 'details',
          component: 'property-details',
          entity: 'property',
          position: 'main',
        },
        {
          id: 'contact-agent',
          component: 'inquiry-form',
          entity: 'inquiry',
          position: 'sidebar',
        },
        {
          id: 'similar',
          component: 'property-grid',
          entity: 'property',
          position: 'main',
          props: {
            title: 'Similar Properties',
            limit: 4,
            similar: true,
          },
        },
      ],
    },
    // Agents
    {
      path: '/agents',
      name: 'Agents',
      layout: 'single-column',
      sections: [
        {
          id: 'agents',
          component: 'agent-grid',
          entity: 'agent',
          position: 'main',
          props: {
            title: 'Our Agents',
            showPagination: true,
          },
        },
      ],
    },
    // Agent Profile
    {
      path: '/agents/:id',
      name: 'Agent Profile',
      layout: 'two-column',
      sections: [
        {
          id: 'agent-profile',
          component: 'agent-profile',
          entity: 'agent',
          position: 'main',
        },
        {
          id: 'contact-form',
          component: 'contact-form',
          position: 'sidebar',
        },
        {
          id: 'agent-listings',
          component: 'property-grid',
          entity: 'property',
          position: 'main',
          props: {
            title: 'Agent Listings',
          },
        },
        {
          id: 'reviews',
          component: 'review-list',
          entity: 'review',
          position: 'main',
        },
      ],
    },
    // Saved Properties
    {
      path: '/favorites',
      name: 'Saved Properties',
      layout: 'single-column',
      requiresAuth: true,
      sections: [
        {
          id: 'favorites',
          component: 'property-grid',
          entity: 'favorite',
          position: 'main',
          props: {
            title: 'Saved Properties',
            userScoped: true,
          },
        },
      ],
    },
    // My Inquiries
    {
      path: '/inquiries',
      name: 'My Inquiries',
      layout: 'single-column',
      requiresAuth: true,
      sections: [
        {
          id: 'inquiries',
          component: 'data-table',
          entity: 'inquiry',
          position: 'main',
          props: {
            title: 'My Inquiries',
            userScoped: true,
            columns: ['property', 'status', 'created_at'],
          },
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
              { label: 'Properties', path: '/admin/properties', icon: 'Home' },
              { label: 'Agents', path: '/admin/agents', icon: 'Users' },
              { label: 'Inquiries', path: '/admin/inquiries', icon: 'MessageSquare' },
              { label: 'Viewings', path: '/admin/viewings', icon: 'Calendar' },
            ],
          },
        },
        {
          id: 'stats',
          component: 'stats-cards',
          position: 'main',
          props: {
            stats: ['properties', 'inquiries', 'viewings', 'agents'],
          },
        },
        {
          id: 'recent-inquiries',
          component: 'data-table',
          entity: 'inquiry',
          position: 'main',
          props: {
            title: 'Recent Inquiries',
            limit: 10,
          },
        },
      ],
    },
    // Admin Properties
    {
      path: '/admin/properties',
      name: 'Manage Properties',
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
          id: 'properties-table',
          component: 'data-table',
          entity: 'property',
          position: 'main',
          props: {
            title: 'Properties',
            showCreate: true,
            showEdit: true,
            showDelete: true,
            columns: ['title', 'type', 'price', 'status', 'agent', 'created_at'],
          },
        },
      ],
    },
  ],

  endpoints: [
    // Properties
    { method: 'GET', path: '/properties', entity: 'property', operation: 'list' },
    { method: 'GET', path: '/properties/:id', entity: 'property', operation: 'get' },
    { method: 'POST', path: '/properties', entity: 'property', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/properties/:id', entity: 'property', operation: 'update', requiresAuth: true },
    { method: 'DELETE', path: '/properties/:id', entity: 'property', operation: 'delete', requiresAuth: true },

    // Agents
    { method: 'GET', path: '/agents', entity: 'agent', operation: 'list' },
    { method: 'GET', path: '/agents/:id', entity: 'agent', operation: 'get' },
    { method: 'GET', path: '/agents/:id/properties', entity: 'property', operation: 'list' },
    { method: 'POST', path: '/agents', entity: 'agent', operation: 'create', requiresAuth: true, adminOnly: true },

    // Inquiries
    { method: 'GET', path: '/inquiries', entity: 'inquiry', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/inquiries', entity: 'inquiry', operation: 'create', requiresAuth: true },
    { method: 'PATCH', path: '/inquiries/:id/status', entity: 'inquiry', operation: 'update', requiresAuth: true },

    // Favorites
    { method: 'GET', path: '/favorites', entity: 'favorite', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/properties/:id/favorite', entity: 'favorite', operation: 'create', requiresAuth: true },
    { method: 'DELETE', path: '/properties/:id/favorite', entity: 'favorite', operation: 'delete', requiresAuth: true },

    // Viewings
    { method: 'GET', path: '/viewings', entity: 'viewing', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/viewings', entity: 'viewing', operation: 'create', requiresAuth: true },
    { method: 'PATCH', path: '/viewings/:id/status', entity: 'viewing', operation: 'update', requiresAuth: true },

    // Reviews
    { method: 'GET', path: '/agents/:id/reviews', entity: 'review', operation: 'list' },
    { method: 'POST', path: '/reviews', entity: 'review', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    property: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'type', type: 'enum', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'price', type: 'decimal', required: true },
        { name: 'price_period', type: 'enum' },
        { name: 'bedrooms', type: 'integer' },
        { name: 'bathrooms', type: 'integer' },
        { name: 'area_sqft', type: 'integer' },
        { name: 'year_built', type: 'integer' },
        { name: 'address', type: 'json', required: true },
        { name: 'latitude', type: 'decimal' },
        { name: 'longitude', type: 'decimal' },
        { name: 'images', type: 'json' },
        { name: 'video_url', type: 'url' },
        { name: 'amenities', type: 'json' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'views_count', type: 'integer' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'agent' },
        { type: 'hasMany', target: 'inquiry' },
        { type: 'hasMany', target: 'viewing' },
        { type: 'hasMany', target: 'favorite' },
      ],
    },
    agent: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'bio', type: 'text' },
        { name: 'avatar_url', type: 'image' },
        { name: 'license_number', type: 'string' },
        { name: 'specializations', type: 'json' },
        { name: 'languages', type: 'json' },
        { name: 'rating', type: 'decimal' },
        { name: 'properties_sold', type: 'integer' },
        { name: 'is_verified', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'user' },
        { type: 'hasMany', target: 'property' },
        { type: 'hasMany', target: 'review' },
      ],
    },
    inquiry: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'message', type: 'text', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'source', type: 'string' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'property' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
    favorite: {
      defaultFields: [
        { name: 'favorited_at', type: 'datetime', required: true },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'property' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
    viewing: {
      defaultFields: [
        { name: 'scheduled_at', type: 'datetime', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'property' },
        { type: 'belongsTo', target: 'agent' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
    review: {
      defaultFields: [
        { name: 'rating', type: 'integer', required: true },
        { name: 'title', type: 'string' },
        { name: 'content', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'agent' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
  },
};

export default realestateBlueprint;
