/**
 * Textile Manufacturing App Type Definition
 *
 * Complete definition for textile manufacturing and apparel production applications.
 * Essential for textile mills, garment factories, and fashion production.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TEXTILE_MANUFACTURING_APP_TYPE: AppTypeDefinition = {
  id: 'textile-manufacturing',
  name: 'Textile Manufacturing',
  category: 'manufacturing',
  description: 'Textile manufacturing platform with production planning, fabric tracking, cut & sew management, and quality control',
  icon: 'shirt',

  keywords: [
    'textile manufacturing',
    'garment manufacturing',
    'apparel production',
    'textile factory',
    'garment factory',
    'cut and sew',
    'fabric production',
    'textile software',
    'garment software',
    'fashion production',
    'textile erp',
    'apparel erp',
    'fabric tracking',
    'textile quality',
    'pattern making',
    'marker making',
    'sewing production',
    'textile planning',
    'clothing manufacturing',
    'apparel manufacturing',
  ],

  synonyms: [
    'textile manufacturing platform',
    'textile manufacturing software',
    'garment manufacturing software',
    'apparel production software',
    'textile erp software',
    'garment factory software',
    'cut sew software',
    'fashion production software',
    'textile planning software',
    'apparel erp software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'textile design only'],

  sections: [
    { id: 'frontend', name: 'Production Portal', enabled: true, basePath: '/', layout: 'public', description: 'Order status' },
    { id: 'admin', name: 'Factory Dashboard', enabled: true, basePath: '/admin', requiredRole: 'supervisor', layout: 'admin', description: 'Production and quality' },
  ],

  roles: [
    { id: 'admin', name: 'Factory Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Production Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'supervisor', name: 'Line Supervisor', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/production' },
    { id: 'quality', name: 'QC Inspector', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/quality' },
    { id: 'operator', name: 'Operator', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'buyer', name: 'Buyer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'orders',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'course-management'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'manufacturing',

  defaultColorScheme: 'rose',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a textile manufacturing system',
    'Create a garment factory platform',
    'I need an apparel production app',
    'Build a cut and sew management system',
    'Create a textile ERP',
  ],
};
