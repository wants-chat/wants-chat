/**
 * Shopping Cart Component Definition
 *
 * Example of a component that requires authentication
 * and creates user-specific data.
 */

import { ComponentDefinition } from '../../../interfaces/component.interface';

export const SHOPPING_CART_COMPONENT: ComponentDefinition = {
  id: 'shopping-cart',
  name: 'Shopping Cart',
  category: 'ecommerce',
  description: 'Shopping cart with item management, quantity controls, and checkout',
  icon: 'shopping-cart',
  allowedIn: ['frontend'],

  // ─────────────────────────────────────────────────────────────
  // REQUIRED FIELDS - Cart item fields
  // ─────────────────────────────────────────────────────────────
  requiredFields: [
    {
      name: 'id',
      label: 'Cart Item ID',
      type: 'uuid',
      source: 'database',
      required: true,
    },
    {
      name: 'userId',
      label: 'User ID',
      type: 'uuid',
      source: 'user',
      required: true,
      relationTo: 'users',
    },
    {
      name: 'productId',
      label: 'Product ID',
      type: 'uuid',
      source: 'database',
      required: true,
      relationTo: 'products',
      relationDisplay: 'name',
    },
    {
      name: 'quantity',
      label: 'Quantity',
      type: 'integer',
      source: 'database',
      required: true,
      default: 1,
      validation: {
        min: 1,
        max: 100,
      },
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // OPTIONAL FIELDS
  // ─────────────────────────────────────────────────────────────
  optionalFields: [
    {
      name: 'price',
      label: 'Price at Time of Adding',
      type: 'decimal',
      source: 'database',
      required: false,
    },
    {
      name: 'notes',
      label: 'Item Notes',
      type: 'text',
      source: 'database',
      required: false,
      default: '',
    },
    {
      name: 'variantId',
      label: 'Product Variant',
      type: 'uuid',
      source: 'database',
      required: false,
      relationTo: 'product_variants',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FIELD SYNONYMS
  // ─────────────────────────────────────────────────────────────
  fieldSynonyms: {
    'productId': ['product', 'itemId', 'item'],
    'quantity': ['qty', 'count', 'amount'],
    'price': ['unitPrice', 'itemPrice'],
  },

  // ─────────────────────────────────────────────────────────────
  // API ENDPOINTS - All require authentication
  // ─────────────────────────────────────────────────────────────
  apiEndpoints: [
    {
      method: 'GET',
      path: '/cart',
      auth: true,
      description: 'Get current user\'s cart items',
    },
    {
      method: 'POST',
      path: '/cart/items',
      auth: true,
      description: 'Add item to cart',
    },
    {
      method: 'PUT',
      path: '/cart/items/:id',
      auth: true,
      description: 'Update cart item quantity',
    },
    {
      method: 'DELETE',
      path: '/cart/items/:id',
      auth: true,
      description: 'Remove item from cart',
    },
    {
      method: 'DELETE',
      path: '/cart',
      auth: true,
      description: 'Clear entire cart',
    },
    {
      method: 'GET',
      path: '/cart/count',
      auth: true,
      description: 'Get cart item count',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // EVENTS
  // ─────────────────────────────────────────────────────────────
  events: [
    {
      name: 'onQuantityChange',
      trigger: 'change',
      payload: ['id', 'quantity'],
      defaultHandler: 'api-call',
    },
    {
      name: 'onRemoveItem',
      trigger: 'click',
      payload: ['id'],
      defaultHandler: 'api-call',
    },
    {
      name: 'onCheckout',
      trigger: 'click',
      payload: [],
      defaultHandler: 'navigate',
    },
    {
      name: 'onContinueShopping',
      trigger: 'click',
      payload: [],
      defaultHandler: 'navigate',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // RENDERING CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultProps: {
    showProductImage: true,
    showProductName: true,
    showUnitPrice: true,
    showSubtotal: true,
    showRemoveButton: true,
    showQuantityControls: true,
    showEmptyCartMessage: true,
    emptyCartMessage: 'Your cart is empty',
    checkoutButtonText: 'Proceed to Checkout',
    continueShoppingText: 'Continue Shopping',
  },

  cssClasses: [
    'flex',
    'flex-col',
    'gap-4',
  ],

  variants: [
    {
      id: 'mini',
      name: 'Mini Cart (Dropdown)',
      cssClasses: ['w-80', 'max-h-96', 'overflow-y-auto'],
      props: { showQuantityControls: false },
    },
    {
      id: 'full',
      name: 'Full Page Cart',
      cssClasses: ['w-full', 'max-w-4xl'],
      props: { showQuantityControls: true },
    },
    {
      id: 'sidebar',
      name: 'Sidebar Cart',
      cssClasses: ['w-96', 'h-screen', 'fixed', 'right-0'],
      props: {},
    },
  ],

  templatePath: 'ecommerce/ShoppingCart.tsx',
};
