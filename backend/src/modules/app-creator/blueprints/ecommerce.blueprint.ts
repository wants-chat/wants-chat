import { Blueprint } from './blueprint.interface';

/**
 * Ecommerce App Blueprint
 *
 * Defines the structure for an ecommerce application:
 * - Product catalog with categories
 * - Shopping cart and checkout
 * - Order management
 * - User accounts
 */
export const ecommerceBlueprint: Blueprint = {
  appType: 'ecommerce',
  description: 'E-commerce store with products, categories, cart, and checkout',

  coreEntities: ['product', 'category', 'cart', 'order', 'order_item', 'review'],

  commonFields: {
    timestamps: true,
    softDelete: true,
    userOwnership: true,
  },

  pages: [
    // Public Pages
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
            title: 'Welcome to Our Store',
            subtitle: 'Discover Amazing Products',
            primaryCTA: 'Shop Now',
            primaryCTALink: '/products',
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
          id: 'categories',
          component: 'data-grid',
          entity: 'category',
          position: 'main',
          props: {
            title: 'Shop by Category',
            columns: 4,
          },
        },
      ],
    },
    {
      path: '/products',
      name: 'Products',
      layout: 'two-column',
      sections: [
        {
          id: 'product-filters',
          component: 'filter-form',
          entity: 'product',
          position: 'sidebar',
          props: {
            filters: ['category', 'price_range', 'in_stock'],
          },
        },
        {
          id: 'product-grid',
          component: 'product-grid',
          entity: 'product',
          position: 'main',
          props: {
            showPagination: true,
            itemsPerPage: 12,
          },
        },
      ],
    },
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
          id: 'product-reviews',
          component: 'comment-section',
          entity: 'review',
          position: 'main',
          props: {
            parentEntity: 'product',
          },
        },
        {
          id: 'related-products',
          component: 'product-grid',
          entity: 'product',
          position: 'main',
          props: {
            title: 'Related Products',
            limit: 4,
            related: true,
          },
        },
      ],
    },
    {
      path: '/categories/:id',
      name: 'Category Products',
      layout: 'two-column',
      sections: [
        {
          id: 'category-filters',
          component: 'filter-form',
          entity: 'product',
          position: 'sidebar',
          props: {
            filters: ['price_range', 'in_stock'],
          },
        },
        {
          id: 'category-products',
          component: 'product-grid',
          entity: 'product',
          position: 'main',
          props: {
            title: 'Category Products',
            filterByCategory: true,
          },
        },
      ],
    },
    {
      path: '/cart',
      name: 'Shopping Cart',
      layout: 'single-column',
      sections: [
        {
          id: 'cart',
          component: 'cart',
          entity: 'cart',
          position: 'main',
        },
      ],
    },
    {
      path: '/checkout',
      name: 'Checkout',
      layout: 'two-column',
      requiresAuth: true,
      sections: [
        {
          id: 'checkout-form',
          component: 'checkout',
          position: 'main',
        },
        {
          id: 'order-summary',
          component: 'order-summary',
          entity: 'cart',
          position: 'sidebar',
        },
      ],
    },

    // User Pages
    {
      path: '/orders',
      name: 'My Orders',
      layout: 'single-column',
      requiresAuth: true,
      sections: [
        {
          id: 'orders-list',
          component: 'data-table',
          entity: 'order',
          position: 'main',
          props: {
            columns: ['id', 'status', 'total', 'created_at'],
            userScoped: true,
          },
        },
      ],
    },
    {
      path: '/orders/:id',
      name: 'Order Detail',
      layout: 'single-column',
      requiresAuth: true,
      sections: [
        {
          id: 'order-detail',
          component: 'detail-view',
          entity: 'order',
          position: 'main',
        },
        {
          id: 'order-items',
          component: 'data-list',
          entity: 'order_item',
          position: 'main',
        },
      ],
    },

    // Admin Pages
    {
      path: '/admin/products',
      name: 'Manage Products',
      layout: 'dashboard',
      requiresAuth: true,
      adminOnly: true,
      sections: [
        {
          id: 'admin-sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            links: [
              { label: 'Products', path: '/admin/products' },
              { label: 'Categories', path: '/admin/categories' },
              { label: 'Orders', path: '/admin/orders' },
            ],
          },
        },
        {
          id: 'products-table',
          component: 'data-table',
          entity: 'product',
          position: 'main',
          props: {
            showCreate: true,
            showEdit: true,
            showDelete: true,
          },
        },
      ],
    },
    {
      path: '/admin/orders',
      name: 'Manage Orders',
      layout: 'dashboard',
      requiresAuth: true,
      adminOnly: true,
      sections: [
        {
          id: 'admin-sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            links: [
              { label: 'Products', path: '/admin/products' },
              { label: 'Categories', path: '/admin/categories' },
              { label: 'Orders', path: '/admin/orders' },
            ],
          },
        },
        {
          id: 'orders-table',
          component: 'data-table',
          entity: 'order',
          position: 'main',
          props: {
            showStatusDropdown: true,
            columns: ['id', 'user_email', 'status', 'total', 'created_at'],
          },
        },
      ],
    },
  ],

  endpoints: [
    // Product endpoints
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
    { method: 'GET', path: '/products/:id', entity: 'product', operation: 'get' },
    { method: 'POST', path: '/products', entity: 'product', operation: 'create', requiresAuth: true, adminOnly: true },
    { method: 'PUT', path: '/products/:id', entity: 'product', operation: 'update', requiresAuth: true, adminOnly: true },
    { method: 'DELETE', path: '/products/:id', entity: 'product', operation: 'delete', requiresAuth: true, adminOnly: true },

    // Category endpoints
    { method: 'GET', path: '/categories', entity: 'category', operation: 'list' },
    { method: 'GET', path: '/categories/:id', entity: 'category', operation: 'get' },
    { method: 'GET', path: '/categories/:id/products', entity: 'product', operation: 'list', description: 'Products in category' },

    // Cart endpoints
    { method: 'GET', path: '/cart', entity: 'cart', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/cart/items', entity: 'cart', operation: 'custom', requiresAuth: true, description: 'Add item to cart' },
    { method: 'PUT', path: '/cart/items/:id', entity: 'cart', operation: 'custom', requiresAuth: true, description: 'Update cart item' },
    { method: 'DELETE', path: '/cart/items/:id', entity: 'cart', operation: 'custom', requiresAuth: true, description: 'Remove from cart' },

    // Order endpoints
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/orders/:id', entity: 'order', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create', requiresAuth: true, description: 'Place order' },
    { method: 'PATCH', path: '/orders/:id/status', entity: 'order', operation: 'update', requiresAuth: true, adminOnly: true },

    // Review endpoints
    { method: 'GET', path: '/products/:id/reviews', entity: 'review', operation: 'list' },
    { method: 'POST', path: '/products/:id/reviews', entity: 'review', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    product: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'compare_at_price', type: 'decimal' },
        { name: 'sku', type: 'string' },
        { name: 'stock_quantity', type: 'integer' },
        { name: 'images', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'category' },
        { type: 'hasMany', target: 'review' },
        { type: 'hasMany', target: 'order_item' },
      ],
    },
    category: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'image_url', type: 'image' },
      ],
      relationships: [
        { type: 'hasMany', target: 'product' },
      ],
    },
    order: {
      defaultFields: [
        { name: 'status', type: 'enum' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'shipping_address', type: 'json' },
        { name: 'billing_address', type: 'json' },
        { name: 'payment_method', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'user' },
        { type: 'hasMany', target: 'order_item' },
      ],
    },
    order_item: {
      defaultFields: [
        { name: 'quantity', type: 'integer', required: true },
        { name: 'unit_price', type: 'decimal', required: true },
        { name: 'total_price', type: 'decimal', required: true },
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
        { name: 'content', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'product' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
  },
};

export default ecommerceBlueprint;
