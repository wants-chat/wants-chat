import { Blueprint } from './blueprint.interface';

/**
 * Marketplace Blueprint
 *
 * Defines the structure for a multi-vendor marketplace application:
 * - Vendors/Sellers
 * - Products/Services
 * - Orders
 * - Reviews
 * - Transactions
 * - Messaging
 */
export const marketplaceBlueprint: Blueprint = {
  appType: 'marketplace',
  description: 'Multi-vendor marketplace with sellers, products, orders, and transactions',

  coreEntities: ['vendor', 'product', 'order', 'order_item', 'review', 'category', 'message', 'transaction'],

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
            title: 'Find Everything You Need',
            subtitle: 'Shop from thousands of trusted sellers worldwide',
            primaryCTA: 'Start Shopping',
            primaryCTALink: '/products',
            secondaryCTA: 'Become a Seller',
            secondaryCTALink: '/sell',
          },
        },
        {
          id: 'categories',
          component: 'category-grid',
          entity: 'category',
          position: 'main',
          props: {
            title: 'Shop by Category',
          },
        },
        {
          id: 'featured-products',
          component: 'product-grid',
          entity: 'product',
          position: 'main',
          props: {
            title: 'Featured Products',
            limit: 8,
            featured: true,
          },
        },
        {
          id: 'top-sellers',
          component: 'vendor-grid',
          entity: 'vendor',
          position: 'main',
          props: {
            title: 'Top Sellers',
            limit: 6,
          },
        },
      ],
    },
    // Products
    {
      path: '/products',
      name: 'Products',
      layout: 'two-column',
      sections: [
        {
          id: 'product-filters',
          component: 'product-filters',
          position: 'sidebar',
        },
        {
          id: 'product-grid',
          component: 'product-grid',
          entity: 'product',
          position: 'main',
        },
      ],
    },
    // Category Products
    {
      path: '/category/:slug',
      name: 'Category',
      layout: 'two-column',
      sections: [
        {
          id: 'product-filters',
          component: 'product-filters',
          position: 'sidebar',
        },
        {
          id: 'category-header',
          component: 'category-header',
          entity: 'category',
          position: 'main',
        },
        {
          id: 'product-grid',
          component: 'product-grid',
          entity: 'product',
          position: 'main',
        },
      ],
    },
    // Product Detail
    {
      path: '/products/:id',
      name: 'Product Detail',
      layout: 'single-column',
      sections: [
        {
          id: 'product-detail',
          component: 'product-detail',
          entity: 'product',
          position: 'main',
        },
        {
          id: 'vendor-info',
          component: 'vendor-card',
          entity: 'vendor',
          position: 'main',
        },
        {
          id: 'product-reviews',
          component: 'review-list',
          entity: 'review',
          position: 'main',
          props: {
            title: 'Customer Reviews',
          },
        },
        {
          id: 'related-products',
          component: 'product-grid',
          entity: 'product',
          position: 'main',
          props: {
            title: 'You May Also Like',
            limit: 4,
          },
        },
      ],
    },
    // Vendors
    {
      path: '/sellers',
      name: 'Sellers',
      layout: 'single-column',
      sections: [
        {
          id: 'vendor-grid',
          component: 'vendor-grid',
          entity: 'vendor',
          position: 'main',
          props: {
            title: 'All Sellers',
          },
        },
      ],
    },
    // Vendor Store
    {
      path: '/sellers/:id',
      name: 'Seller Store',
      layout: 'single-column',
      sections: [
        {
          id: 'vendor-header',
          component: 'vendor-header',
          entity: 'vendor',
          position: 'main',
        },
        {
          id: 'vendor-products',
          component: 'product-grid',
          entity: 'product',
          position: 'main',
          props: {
            title: 'Products',
          },
        },
        {
          id: 'vendor-reviews',
          component: 'review-list',
          entity: 'review',
          position: 'main',
          props: {
            title: 'Seller Reviews',
          },
        },
      ],
    },
    // Cart
    {
      path: '/cart',
      name: 'Cart',
      layout: 'single-column',
      sections: [
        {
          id: 'cart',
          component: 'cart',
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
          id: 'checkout',
          component: 'checkout',
          position: 'main',
        },
      ],
    },
    // Buyer Dashboard
    {
      path: '/dashboard',
      name: 'My Account',
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
              { label: 'Orders', path: '/dashboard/orders', icon: 'Package' },
              { label: 'Messages', path: '/dashboard/messages', icon: 'MessageSquare' },
              { label: 'Wishlist', path: '/dashboard/wishlist', icon: 'Heart' },
              { label: 'Profile', path: '/dashboard/profile', icon: 'User' },
            ],
          },
        },
        {
          id: 'recent-orders',
          component: 'order-list',
          entity: 'order',
          position: 'main',
          props: {
            title: 'Recent Orders',
            limit: 5,
          },
        },
      ],
    },
    // Buyer Orders
    {
      path: '/dashboard/orders',
      name: 'My Orders',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'order-list',
          component: 'order-list',
          entity: 'order',
          position: 'main',
          props: {
            title: 'All Orders',
          },
        },
      ],
    },
    // Order Detail
    {
      path: '/dashboard/orders/:id',
      name: 'Order Detail',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'order-detail',
          component: 'order-detail',
          entity: 'order',
          position: 'main',
        },
      ],
    },
    // Messages
    {
      path: '/dashboard/messages',
      name: 'Messages',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'message-list',
          component: 'message-list',
          entity: 'message',
          position: 'main',
        },
      ],
    },
    // Become a Seller
    {
      path: '/sell',
      name: 'Become a Seller',
      layout: 'single-column',
      sections: [
        {
          id: 'seller-signup',
          component: 'vendor-signup',
          position: 'main',
        },
      ],
    },
    // Seller Dashboard
    {
      path: '/seller',
      name: 'Seller Dashboard',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            links: [
              { label: 'Dashboard', path: '/seller', icon: 'LayoutDashboard' },
              { label: 'Products', path: '/seller/products', icon: 'Package' },
              { label: 'Orders', path: '/seller/orders', icon: 'ShoppingBag' },
              { label: 'Earnings', path: '/seller/earnings', icon: 'DollarSign' },
              { label: 'Reviews', path: '/seller/reviews', icon: 'Star' },
              { label: 'Settings', path: '/seller/settings', icon: 'Settings' },
            ],
          },
        },
        {
          id: 'stats',
          component: 'stats-cards',
          position: 'main',
          props: {
            stats: ['total_sales', 'pending_orders', 'products_listed', 'total_earnings'],
          },
        },
        {
          id: 'recent-orders',
          component: 'seller-orders',
          entity: 'order',
          position: 'main',
          props: {
            title: 'Recent Orders',
            limit: 5,
          },
        },
        {
          id: 'sales-chart',
          component: 'sales-chart',
          position: 'main',
        },
      ],
    },
    // Seller Products
    {
      path: '/seller/products',
      name: 'My Products',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'product-table',
          component: 'data-table',
          entity: 'product',
          position: 'main',
          props: {
            title: 'My Products',
            showCreate: true,
            columns: ['image', 'name', 'price', 'stock', 'status', 'sales'],
          },
        },
      ],
    },
    // Add/Edit Product
    {
      path: '/seller/products/new',
      name: 'Add Product',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'product-form',
          component: 'product-form',
          entity: 'product',
          position: 'main',
        },
      ],
    },
    // Seller Orders
    {
      path: '/seller/orders',
      name: 'Orders',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'order-table',
          component: 'data-table',
          entity: 'order',
          position: 'main',
          props: {
            title: 'Orders',
            columns: ['order_number', 'customer', 'items', 'total', 'status', 'date'],
          },
        },
      ],
    },
    // Seller Earnings
    {
      path: '/seller/earnings',
      name: 'Earnings',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'earnings-summary',
          component: 'earnings-summary',
          position: 'main',
        },
        {
          id: 'transaction-list',
          component: 'transaction-list',
          entity: 'transaction',
          position: 'main',
          props: {
            title: 'Transaction History',
          },
        },
      ],
    },
  ],

  endpoints: [
    // Products
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
    { method: 'GET', path: '/products/:id', entity: 'product', operation: 'get' },
    { method: 'POST', path: '/products', entity: 'product', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/products/:id', entity: 'product', operation: 'update', requiresAuth: true },
    { method: 'DELETE', path: '/products/:id', entity: 'product', operation: 'delete', requiresAuth: true },

    // Categories
    { method: 'GET', path: '/categories', entity: 'category', operation: 'list' },
    { method: 'GET', path: '/categories/:slug', entity: 'category', operation: 'get' },
    { method: 'GET', path: '/categories/:slug/products', entity: 'product', operation: 'list' },

    // Vendors
    { method: 'GET', path: '/vendors', entity: 'vendor', operation: 'list' },
    { method: 'GET', path: '/vendors/:id', entity: 'vendor', operation: 'get' },
    { method: 'GET', path: '/vendors/:id/products', entity: 'product', operation: 'list' },
    { method: 'POST', path: '/vendors/register', entity: 'vendor', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/vendors/:id', entity: 'vendor', operation: 'update', requiresAuth: true },

    // Orders
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/orders/:id', entity: 'order', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create', requiresAuth: true },
    { method: 'PATCH', path: '/orders/:id/status', entity: 'order', operation: 'update', requiresAuth: true },

    // Reviews
    { method: 'GET', path: '/products/:id/reviews', entity: 'review', operation: 'list' },
    { method: 'POST', path: '/reviews', entity: 'review', operation: 'create', requiresAuth: true },

    // Messages
    { method: 'GET', path: '/messages', entity: 'message', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/messages/:id', entity: 'message', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/messages', entity: 'message', operation: 'create', requiresAuth: true },

    // Seller endpoints
    { method: 'GET', path: '/seller/products', entity: 'product', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/seller/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/seller/stats', entity: 'vendor', operation: 'custom', requiresAuth: true },
    { method: 'GET', path: '/seller/earnings', entity: 'transaction', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    vendor: {
      defaultFields: [
        { name: 'store_name', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'logo_url', type: 'image' },
        { name: 'banner_url', type: 'image' },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'status', type: 'enum', required: true },
        { name: 'commission_rate', type: 'decimal' },
        { name: 'rating', type: 'decimal' },
        { name: 'review_count', type: 'integer' },
        { name: 'total_sales', type: 'integer' },
        { name: 'total_earnings', type: 'decimal' },
        { name: 'payout_info', type: 'json' },
        { name: 'policies', type: 'json' },
        { name: 'social_links', type: 'json' },
        { name: 'is_verified', type: 'boolean' },
        { name: 'is_featured', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'user' },
        { type: 'hasMany', target: 'product' },
        { type: 'hasMany', target: 'order' },
        { type: 'hasMany', target: 'review' },
        { type: 'hasMany', target: 'transaction' },
      ],
    },
    product: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'short_description', type: 'string' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'compare_price', type: 'decimal' },
        { name: 'cost_price', type: 'decimal' },
        { name: 'sku', type: 'string' },
        { name: 'barcode', type: 'string' },
        { name: 'quantity', type: 'integer', required: true },
        { name: 'low_stock_threshold', type: 'integer' },
        { name: 'status', type: 'enum', required: true },
        { name: 'image_url', type: 'image' },
        { name: 'gallery', type: 'json' },
        { name: 'attributes', type: 'json' },
        { name: 'variants', type: 'json' },
        { name: 'specifications', type: 'json' },
        { name: 'shipping_info', type: 'json' },
        { name: 'rating', type: 'decimal' },
        { name: 'review_count', type: 'integer' },
        { name: 'sales_count', type: 'integer' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'is_digital', type: 'boolean' },
        { name: 'digital_file_url', type: 'url' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'vendor' },
        { type: 'belongsTo', target: 'category' },
        { type: 'hasMany', target: 'review' },
        { type: 'hasMany', target: 'order_item' },
      ],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'subtotal', type: 'decimal', required: true },
        { name: 'shipping_cost', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'discount', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_method', type: 'string' },
        { name: 'payment_status', type: 'enum' },
        { name: 'shipping_address', type: 'json' },
        { name: 'billing_address', type: 'json' },
        { name: 'tracking_number', type: 'string' },
        { name: 'shipped_at', type: 'datetime' },
        { name: 'delivered_at', type: 'datetime' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'user' },
        { type: 'belongsTo', target: 'vendor' },
        { type: 'hasMany', target: 'order_item' },
      ],
    },
    order_item: {
      defaultFields: [
        { name: 'quantity', type: 'integer', required: true },
        { name: 'unit_price', type: 'decimal', required: true },
        { name: 'total_price', type: 'decimal', required: true },
        { name: 'variant_info', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'order' },
        { type: 'belongsTo', target: 'product' },
      ],
    },
    review: {
      defaultFields: [
        { name: 'rating', type: 'integer', required: true },
        { name: 'title', type: 'string' },
        { name: 'content', type: 'text', required: true },
        { name: 'photos', type: 'json' },
        { name: 'is_verified_purchase', type: 'boolean' },
        { name: 'helpful_count', type: 'integer' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'user' },
        { type: 'belongsTo', target: 'product' },
        { type: 'belongsTo', target: 'vendor' },
        { type: 'belongsTo', target: 'order' },
      ],
    },
    category: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'image_url', type: 'image' },
        { name: 'icon', type: 'string' },
        { name: 'order', type: 'integer' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'product_count', type: 'integer' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'category' },
        { type: 'hasMany', target: 'category' },
        { type: 'hasMany', target: 'product' },
      ],
    },
    message: {
      defaultFields: [
        { name: 'subject', type: 'string' },
        { name: 'content', type: 'text', required: true },
        { name: 'is_read', type: 'boolean' },
        { name: 'attachments', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'user' },
        { type: 'belongsTo', target: 'vendor' },
        { type: 'belongsTo', target: 'order' },
        { type: 'belongsTo', target: 'product' },
      ],
    },
    transaction: {
      defaultFields: [
        { name: 'type', type: 'enum', required: true },
        { name: 'amount', type: 'decimal', required: true },
        { name: 'fee', type: 'decimal' },
        { name: 'net_amount', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'reference', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'payout_method', type: 'string' },
        { name: 'processed_at', type: 'datetime' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'vendor' },
        { type: 'belongsTo', target: 'order' },
      ],
    },
  },
};

export default marketplaceBlueprint;
