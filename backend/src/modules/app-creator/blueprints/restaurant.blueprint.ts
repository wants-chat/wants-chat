import { Blueprint } from './blueprint.interface';

/**
 * Restaurant/Food Ordering Blueprint
 *
 * Defines the structure for a restaurant/food ordering application:
 * - Menu management
 * - Online ordering
 * - Table reservations
 * - Order tracking
 * - Reviews
 */
export const restaurantBlueprint: Blueprint = {
  appType: 'restaurant',
  description: 'Restaurant with menu, online ordering, and reservations',

  coreEntities: ['menu_item', 'category', 'order', 'order_item', 'reservation', 'review'],

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
            title: 'Delicious Food Delivered',
            subtitle: 'Order your favorite dishes online',
            primaryCTA: 'Order Now',
            primaryCTALink: '/menu',
            secondaryCTA: 'Reserve Table',
            secondaryCTALink: '/reservations',
          },
        },
        {
          id: 'specials',
          component: 'menu-grid',
          entity: 'menu_item',
          position: 'main',
          props: {
            title: "Today's Specials",
            limit: 4,
            featured: true,
          },
        },
        {
          id: 'categories',
          component: 'data-grid',
          entity: 'category',
          position: 'main',
          props: {
            title: 'Browse Menu',
            columns: 4,
          },
        },
        {
          id: 'reviews',
          component: 'review-carousel',
          entity: 'review',
          position: 'main',
          props: {
            title: 'What Our Customers Say',
          },
        },
      ],
    },
    // Menu
    {
      path: '/menu',
      name: 'Menu',
      layout: 'two-column',
      sections: [
        {
          id: 'categories',
          component: 'menu-categories',
          entity: 'category',
          position: 'sidebar',
        },
        {
          id: 'menu-items',
          component: 'menu-grid',
          entity: 'menu_item',
          position: 'main',
          props: {
            showAddToCart: true,
          },
        },
        {
          id: 'cart-preview',
          component: 'cart-preview',
          position: 'sidebar',
        },
      ],
    },
    // Category Page
    {
      path: '/menu/:categoryId',
      name: 'Category',
      layout: 'two-column',
      sections: [
        {
          id: 'categories',
          component: 'menu-categories',
          entity: 'category',
          position: 'sidebar',
        },
        {
          id: 'category-items',
          component: 'menu-grid',
          entity: 'menu_item',
          position: 'main',
          props: {
            filterByCategory: true,
            showAddToCart: true,
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
          entity: 'order',
          position: 'main',
        },
      ],
    },
    // Checkout
    {
      path: '/checkout',
      name: 'Checkout',
      layout: 'two-column',
      requiresAuth: true,
      sections: [
        {
          id: 'checkout-form',
          component: 'checkout-form',
          position: 'main',
          props: {
            fields: ['delivery_address', 'delivery_time', 'payment_method', 'notes'],
          },
        },
        {
          id: 'order-summary',
          component: 'order-summary',
          position: 'sidebar',
        },
      ],
    },
    // Order Confirmation
    {
      path: '/orders/:id/confirmation',
      name: 'Order Confirmation',
      layout: 'single-column',
      requiresAuth: true,
      sections: [
        {
          id: 'confirmation',
          component: 'order-confirmation',
          entity: 'order',
          position: 'main',
        },
      ],
    },
    // Order Tracking
    {
      path: '/orders/:id',
      name: 'Track Order',
      layout: 'single-column',
      requiresAuth: true,
      sections: [
        {
          id: 'order-tracking',
          component: 'order-tracking',
          entity: 'order',
          position: 'main',
        },
      ],
    },
    // My Orders
    {
      path: '/orders',
      name: 'My Orders',
      layout: 'single-column',
      requiresAuth: true,
      sections: [
        {
          id: 'orders-list',
          component: 'order-list',
          entity: 'order',
          position: 'main',
          props: {
            title: 'Order History',
            userScoped: true,
          },
        },
      ],
    },
    // Reservations
    {
      path: '/reservations',
      name: 'Reservations',
      layout: 'two-column',
      sections: [
        {
          id: 'reservation-form',
          component: 'reservation-form',
          entity: 'reservation',
          position: 'main',
          props: {
            title: 'Book a Table',
          },
        },
        {
          id: 'info',
          component: 'restaurant-info',
          position: 'sidebar',
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
              { label: 'Orders', path: '/admin/orders', icon: 'ShoppingBag' },
              { label: 'Menu', path: '/admin/menu', icon: 'UtensilsCrossed' },
              { label: 'Reservations', path: '/admin/reservations', icon: 'Calendar' },
              { label: 'Reviews', path: '/admin/reviews', icon: 'Star' },
            ],
          },
        },
        {
          id: 'stats',
          component: 'stats-cards',
          position: 'main',
          props: {
            stats: ['orders_today', 'revenue_today', 'pending_orders', 'reservations_today'],
          },
        },
        {
          id: 'pending-orders',
          component: 'order-queue',
          entity: 'order',
          position: 'main',
          props: {
            title: 'Pending Orders',
            status: 'pending',
          },
        },
      ],
    },
    // Admin Orders
    {
      path: '/admin/orders',
      name: 'Manage Orders',
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
          id: 'orders-table',
          component: 'data-table',
          entity: 'order',
          position: 'main',
          props: {
            title: 'Orders',
            showStatusDropdown: true,
            columns: ['id', 'customer', 'items_count', 'total', 'status', 'created_at'],
          },
        },
      ],
    },
    // Admin Menu
    {
      path: '/admin/menu',
      name: 'Manage Menu',
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
          id: 'menu-table',
          component: 'data-table',
          entity: 'menu_item',
          position: 'main',
          props: {
            title: 'Menu Items',
            showCreate: true,
            showEdit: true,
            showDelete: true,
            columns: ['name', 'category', 'price', 'is_available'],
          },
        },
      ],
    },
  ],

  endpoints: [
    // Menu Items
    { method: 'GET', path: '/menu', entity: 'menu_item', operation: 'list' },
    { method: 'GET', path: '/menu/:id', entity: 'menu_item', operation: 'get' },
    { method: 'POST', path: '/menu', entity: 'menu_item', operation: 'create', requiresAuth: true, adminOnly: true },
    { method: 'PUT', path: '/menu/:id', entity: 'menu_item', operation: 'update', requiresAuth: true, adminOnly: true },
    { method: 'DELETE', path: '/menu/:id', entity: 'menu_item', operation: 'delete', requiresAuth: true, adminOnly: true },

    // Categories
    { method: 'GET', path: '/categories', entity: 'category', operation: 'list' },
    { method: 'GET', path: '/categories/:id', entity: 'category', operation: 'get' },
    { method: 'GET', path: '/categories/:id/items', entity: 'menu_item', operation: 'list' },

    // Orders
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/orders/:id', entity: 'order', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create', requiresAuth: true },
    { method: 'PATCH', path: '/orders/:id/status', entity: 'order', operation: 'update', requiresAuth: true, adminOnly: true },

    // Reservations
    { method: 'GET', path: '/reservations', entity: 'reservation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/reservations', entity: 'reservation', operation: 'create', requiresAuth: true },
    { method: 'PATCH', path: '/reservations/:id/status', entity: 'reservation', operation: 'update', requiresAuth: true },
    { method: 'DELETE', path: '/reservations/:id', entity: 'reservation', operation: 'delete', requiresAuth: true },

    // Reviews
    { method: 'GET', path: '/reviews', entity: 'review', operation: 'list' },
    { method: 'POST', path: '/reviews', entity: 'review', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    menu_item: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'image_url', type: 'image' },
        { name: 'calories', type: 'integer' },
        { name: 'prep_time_minutes', type: 'integer' },
        { name: 'ingredients', type: 'json' },
        { name: 'allergens', type: 'json' },
        { name: 'is_vegetarian', type: 'boolean' },
        { name: 'is_vegan', type: 'boolean' },
        { name: 'is_gluten_free', type: 'boolean' },
        { name: 'is_spicy', type: 'boolean' },
        { name: 'is_available', type: 'boolean' },
        { name: 'is_featured', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'category' },
        { type: 'hasMany', target: 'order_item' },
      ],
    },
    category: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'image_url', type: 'image' },
        { name: 'position', type: 'integer' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'menu_item' },
      ],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'subtotal', type: 'decimal', required: true },
        { name: 'tax', type: 'decimal' },
        { name: 'delivery_fee', type: 'decimal' },
        { name: 'tip', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'delivery_address', type: 'json' },
        { name: 'delivery_instructions', type: 'text' },
        { name: 'scheduled_time', type: 'datetime' },
        { name: 'payment_method', type: 'string' },
        { name: 'payment_status', type: 'enum' },
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
        { name: 'special_instructions', type: 'text' },
        { name: 'modifiers', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'order' },
        { type: 'belongsTo', target: 'menu_item' },
      ],
    },
    reservation: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'time', type: 'string', required: true },
        { name: 'party_size', type: 'integer', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'special_requests', type: 'text' },
        { name: 'table_number', type: 'string' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'user' },
      ],
    },
    review: {
      defaultFields: [
        { name: 'rating', type: 'integer', required: true },
        { name: 'title', type: 'string' },
        { name: 'content', type: 'text' },
        { name: 'food_rating', type: 'integer' },
        { name: 'service_rating', type: 'integer' },
        { name: 'ambiance_rating', type: 'integer' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'order' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
  },
};

export default restaurantBlueprint;
