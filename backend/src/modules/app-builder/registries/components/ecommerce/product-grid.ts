/**
 * Product Grid Component Definition
 *
 * This is a comprehensive example of the component-first approach.
 * The component defines all the data it needs, and the database
 * schema is derived from these field definitions.
 */

import { ComponentDefinition } from '../../../interfaces/component.interface';

export const PRODUCT_GRID_COMPONENT: ComponentDefinition = {
  id: 'product-grid',
  name: 'Product Grid',
  category: 'ecommerce',
  description: 'Displays products in a responsive grid layout with filtering and sorting',
  icon: 'grid',
  allowedIn: ['frontend', 'admin', 'vendor'],

  // ─────────────────────────────────────────────────────────────
  // REQUIRED FIELDS - These become required database columns
  // ─────────────────────────────────────────────────────────────
  requiredFields: [
    {
      name: 'id',
      label: 'Product ID',
      type: 'uuid',
      source: 'database',
      required: true,
    },
    {
      name: 'name',
      label: 'Product Name',
      type: 'string',
      source: 'database',
      required: true,
      validation: {
        minLength: 1,
        maxLength: 200,
      },
    },
    {
      name: 'price',
      label: 'Price',
      type: 'decimal',
      source: 'database',
      required: true,
      validation: {
        min: 0,
      },
    },
    {
      name: 'imageUrl',
      label: 'Product Image',
      type: 'image',
      source: 'database',
      required: true,
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // OPTIONAL FIELDS - These have fallback values
  // ─────────────────────────────────────────────────────────────
  optionalFields: [
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      source: 'database',
      required: false,
      default: '',
    },
    {
      name: 'categoryId',
      label: 'Category',
      type: 'uuid',
      source: 'database',
      required: false,
      relationTo: 'categories',
      relationDisplay: 'name',
    },
    {
      name: 'stock',
      label: 'Stock Quantity',
      type: 'integer',
      source: 'database',
      required: false,
      default: 0,
      validation: {
        min: 0,
      },
    },
    {
      name: 'rating',
      label: 'Average Rating',
      type: 'decimal',
      source: 'database',
      required: false,
      default: 0,
      validation: {
        min: 0,
        max: 5,
      },
    },
    {
      name: 'compareAtPrice',
      label: 'Compare At Price',
      type: 'decimal',
      source: 'database',
      required: false,
    },
    {
      name: 'sku',
      label: 'SKU',
      type: 'string',
      source: 'database',
      required: false,
    },
    {
      name: 'isActive',
      label: 'Is Active',
      type: 'boolean',
      source: 'database',
      required: false,
      default: true,
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FIELD SYNONYMS - For intelligent matching
  // ─────────────────────────────────────────────────────────────
  fieldSynonyms: {
    'name': ['title', 'productName', 'itemName', 'productTitle'],
    'price': ['cost', 'amount', 'unitPrice', 'salePrice'],
    'imageUrl': ['image', 'photo', 'thumbnail', 'picture', 'productImage'],
    'description': ['desc', 'details', 'productDescription', 'summary'],
    'stock': ['quantity', 'inventory', 'stockQuantity', 'available'],
    'categoryId': ['category', 'categoryRef', 'productCategory'],
    'compareAtPrice': ['originalPrice', 'wasPrice', 'regularPrice', 'mrp'],
    'sku': ['productCode', 'itemCode', 'barcode'],
  },

  // ─────────────────────────────────────────────────────────────
  // API ENDPOINTS - Auto-generated backend routes
  // ─────────────────────────────────────────────────────────────
  apiEndpoints: [
    {
      method: 'GET',
      path: '/products',
      auth: false,
      description: 'List all products with pagination and filtering',
    },
    {
      method: 'GET',
      path: '/products/:id',
      auth: false,
      description: 'Get single product by ID',
    },
    {
      method: 'GET',
      path: '/products/featured',
      auth: false,
      description: 'Get featured products',
    },
    {
      method: 'GET',
      path: '/products/category/:categoryId',
      auth: false,
      description: 'Get products by category',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // EVENTS - Inter-component communication
  // ─────────────────────────────────────────────────────────────
  events: [
    {
      name: 'onProductClick',
      trigger: 'click',
      payload: ['id', 'name'],
      defaultHandler: 'navigate',
    },
    {
      name: 'onAddToCart',
      trigger: 'click',
      payload: ['id', 'name', 'price'],
      defaultHandler: 'api-call',
    },
    {
      name: 'onQuickView',
      trigger: 'click',
      payload: ['id'],
      defaultHandler: 'modal',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // RENDERING CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultProps: {
    columns: 3,
    showFilters: true,
    showSorting: true,
    showPagination: true,
    pageSize: 12,
    showAddToCart: true,
    showQuickView: false,
    showRating: true,
    showStock: false,
  },

  cssClasses: [
    'grid',
    'gap-4',
  ],

  variants: [
    {
      id: 'compact',
      name: 'Compact Grid',
      cssClasses: ['grid-cols-4', 'gap-2'],
      props: { columns: 4, showFilters: false },
    },
    {
      id: 'large',
      name: 'Large Cards',
      cssClasses: ['grid-cols-2', 'gap-6'],
      props: { columns: 2, showQuickView: true },
    },
    {
      id: 'list',
      name: 'List View',
      cssClasses: ['flex', 'flex-col', 'gap-4'],
      props: { columns: 1 },
    },
  ],

  templatePath: 'ecommerce/ProductGrid.tsx',
};
