/**
 * Inventory Management App Type Definition
 *
 * Complete definition for inventory and stock management applications.
 * Essential for warehouses, retail, and manufacturing businesses.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INVENTORY_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'inventory-management',
  name: 'Inventory Management',
  category: 'business',
  description: 'Stock and inventory tracking with warehouses, products, orders, and supplier management',
  icon: 'warehouse',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'inventory',
    'inventory management',
    'stock',
    'stock management',
    'warehouse',
    'warehouse management',
    'wms',
    'inventory tracking',
    'stock tracking',
    'inventory control',
    'stock control',
    'supply chain',
    'product inventory',
    'sku',
    'barcode',
    'stock levels',
    'reorder',
    'stocktake',
    'inventory count',
    'goods',
    'materials',
  ],

  synonyms: [
    'stock system',
    'warehouse system',
    'inventory tracker',
    'stock tracker',
    'goods management',
    'material management',
    'asset tracking',
    'product tracking',
  ],

  negativeKeywords: [
    'blog',
    'portfolio',
    'landing page',
    'social media',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Inventory Dashboard',
      enabled: true,
      basePath: '/',
      layout: 'admin',
      description: 'Main inventory management interface',
    },
    {
      id: 'admin',
      name: 'Admin Panel',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'admin',
      layout: 'admin',
      description: 'System administration and settings',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Administrator',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/dashboard',
    },
    {
      id: 'manager',
      name: 'Inventory Manager',
      level: 70,
      isDefault: false,
      accessibleSections: ['frontend'],
      defaultRoute: '/dashboard',
    },
    {
      id: 'staff',
      name: 'Warehouse Staff',
      level: 30,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/products',
    },
    {
      id: 'viewer',
      name: 'Viewer',
      level: 10,
      isDefault: false,
      accessibleSections: ['frontend'],
      defaultRoute: '/dashboard',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'product-catalog',
    'search',
    'reporting',
  ],

  optionalFeatures: [
    'analytics',
  ],

  incompatibleFeatures: [
    'appointments',
    'course-management',
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'logistics',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'green',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an inventory management system',
    'Create a warehouse management application',
    'I need a stock tracking system',
    'Build an app to manage product inventory',
    'Create an inventory control system for my warehouse',
    'I want to track stock levels and reorders',
    'Build a WMS for my business',
  ],
};
