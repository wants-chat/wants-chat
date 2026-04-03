/**
 * Product Form Component Definition
 *
 * Admin form for creating/editing products.
 */

import { ComponentDefinition } from '../../../interfaces/component.interface';

export const PRODUCT_FORM_COMPONENT: ComponentDefinition = {
  id: 'product-form',
  name: 'Product Form',
  category: 'form',
  description: 'Product creation and editing form',
  icon: 'package',

  allowedIn: ['admin', 'vendor'],

  requiredFields: [
    {
      name: 'name',
      type: 'text',
      label: 'Product Name',
      placeholder: 'Enter product name',
      validation: { required: true, minLength: 2 },
    },
    {
      name: 'price',
      type: 'currency',
      label: 'Price',
      placeholder: '0.00',
      validation: { required: true, min: 0 },
    },
    {
      name: 'description',
      type: 'richtext',
      label: 'Description',
      placeholder: 'Describe your product',
      validation: { required: true },
    },
  ],

  optionalFields: [
    {
      name: 'images',
      type: 'images',
      label: 'Product Images',
      validation: { maxFiles: 10 },
    },
    {
      name: 'sku',
      type: 'text',
      label: 'SKU',
      placeholder: 'Product SKU',
    },
    {
      name: 'category_id',
      type: 'relation',
      label: 'Category',
      relationTo: 'categories',
    },
    {
      name: 'stock',
      type: 'number',
      label: 'Stock Quantity',
      default: 0,
      validation: { min: 0 },
    },
    {
      name: 'comparePrice',
      type: 'currency',
      label: 'Compare at Price',
      placeholder: '0.00',
    },
    {
      name: 'status',
      type: 'enum',
      label: 'Status',
      options: ['draft', 'active', 'archived'],
      default: 'draft',
    },
    {
      name: 'isFeatured',
      type: 'boolean',
      label: 'Featured Product',
      default: false,
    },
    {
      name: 'tags',
      type: 'tags',
      label: 'Tags',
    },
    {
      name: 'weight',
      type: 'number',
      label: 'Weight (kg)',
    },
    {
      name: 'dimensions',
      type: 'json',
      label: 'Dimensions',
    },
  ],

  fieldSynonyms: {
    name: ['title', 'productName', 'product_name'],
    price: ['cost', 'amount', 'value'],
    description: ['details', 'content', 'body', 'info'],
    images: ['photos', 'pictures', 'gallery'],
    sku: ['productCode', 'itemNumber', 'partNumber'],
    stock: ['quantity', 'inventory', 'available'],
    category_id: ['category', 'categoryId'],
  },

  apiEndpoints: [
    {
      method: 'GET',
      path: '/admin/products/:id',
      purpose: 'read',
      responseFields: ['id', 'name', 'price', 'description', 'images', 'sku', 'category_id', 'stock', 'status'],
    },
    {
      method: 'POST',
      path: '/admin/products',
      purpose: 'create',
      requestFields: ['name', 'price', 'description', 'images', 'sku', 'category_id', 'stock', 'status', 'isFeatured'],
      responseFields: ['id', 'name'],
    },
    {
      method: 'PUT',
      path: '/admin/products/:id',
      purpose: 'update',
      requestFields: ['name', 'price', 'description', 'images', 'sku', 'category_id', 'stock', 'status', 'isFeatured'],
      responseFields: ['id', 'name'],
    },
  ],

  events: [
    { name: 'onSubmit', description: 'Triggered when form is submitted' },
    { name: 'onSuccess', description: 'Triggered on successful save' },
    { name: 'onError', description: 'Triggered on save failure' },
    { name: 'onImageUpload', description: 'Triggered when images are uploaded' },
  ],

  templatePath: 'templates/components/forms/product-form',
};
