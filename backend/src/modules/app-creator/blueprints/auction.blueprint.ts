import { Blueprint } from './blueprint.interface';

/**
 * Auction Blueprint
 */
export const auctionBlueprint: Blueprint = {
  appType: 'auction',
  description: 'Auction platform with listings, bids, watchlist, and live auctions',

  coreEntities: ['listing', 'bid', 'category', 'seller', 'watchlist'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Auctions', layout: 'dashboard', requiresAuth: false, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Auctions', path: '/', icon: 'Gavel' },
        { label: 'Categories', path: '/categories', icon: 'Grid' },
        { label: 'My Bids', path: '/bids', icon: 'TrendingUp' },
        { label: 'Watchlist', path: '/watchlist', icon: 'Eye' },
        { label: 'My Listings', path: '/my-listings', icon: 'Package' },
      ]}},
      { id: 'featured', component: 'featured-auctions', entity: 'listing', position: 'main' },
      { id: 'ending-soon', component: 'auction-grid', entity: 'listing', position: 'main', props: { title: 'Ending Soon' }},
    ]},
    { path: '/listings/:id', name: 'Auction Detail', layout: 'dashboard', requiresAuth: false, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'auction-detail', component: 'auction-detail', entity: 'listing', position: 'main' },
      { id: 'bid-history', component: 'bid-history', entity: 'bid', position: 'main' },
      { id: 'bid-form', component: 'bid-form', entity: 'bid', position: 'main' },
    ]},
    { path: '/categories', name: 'Categories', layout: 'dashboard', requiresAuth: false, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'category-grid', component: 'category-grid', entity: 'category', position: 'main' },
    ]},
    { path: '/bids', name: 'My Bids', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'my-bids', component: 'my-bids-list', entity: 'bid', position: 'main' },
    ]},
    { path: '/watchlist', name: 'Watchlist', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'watchlist', component: 'auction-grid', entity: 'listing', position: 'main', props: { title: 'Watchlist' }},
    ]},
    { path: '/sell', name: 'Create Listing', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'listing-form', component: 'listing-form', entity: 'listing', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/listings', entity: 'listing', operation: 'list' },
    { method: 'GET', path: '/listings/:id', entity: 'listing', operation: 'get' },
    { method: 'POST', path: '/listings', entity: 'listing', operation: 'create', requiresAuth: true },
    { method: 'POST', path: '/listings/:id/bids', entity: 'bid', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/listings/:id/bids', entity: 'bid', operation: 'list' },
    { method: 'GET', path: '/my-bids', entity: 'bid', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/watchlist', entity: 'watchlist', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/categories', entity: 'category', operation: 'list' },
  ],

  entityConfig: {
    listing: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'images', type: 'json' },
        { name: 'starting_price', type: 'decimal', required: true },
        { name: 'current_price', type: 'decimal' },
        { name: 'reserve_price', type: 'decimal' },
        { name: 'buy_now_price', type: 'decimal' },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'bid_count', type: 'integer' },
        { name: 'condition', type: 'enum' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'seller' },
        { type: 'belongsTo', target: 'category' },
        { type: 'hasMany', target: 'bid' },
      ],
    },
    bid: {
      defaultFields: [
        { name: 'amount', type: 'decimal', required: true },
        { name: 'is_winning', type: 'boolean' },
        { name: 'is_auto_bid', type: 'boolean' },
        { name: 'max_bid', type: 'decimal' },
      ],
      relationships: [{ type: 'belongsTo', target: 'listing' }],
    },
  },
};

export default auctionBlueprint;
