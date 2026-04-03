/**
 * Computer Repair App Type Definition
 *
 * Complete definition for computer repair shop operations.
 * Essential for PC repair shops, laptop service centers, and tech support businesses.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COMPUTER_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'computer-repair',
  name: 'Computer Repair',
  category: 'services',
  description: 'Computer repair platform with ticket management, diagnostic tracking, parts inventory, and customer communication',
  icon: 'laptop',

  keywords: [
    'computer repair',
    'pc repair',
    'computer repair software',
    'laptop service',
    'tech support',
    'computer repair management',
    'ticket management',
    'computer repair practice',
    'computer repair scheduling',
    'diagnostic tracking',
    'computer repair crm',
    'parts inventory',
    'computer repair business',
    'customer communication',
    'computer repair pos',
    'virus removal',
    'computer repair operations',
    'hardware repair',
    'computer repair platform',
    'data backup',
  ],

  synonyms: [
    'computer repair platform',
    'computer repair software',
    'pc repair software',
    'laptop service software',
    'tech support software',
    'ticket management software',
    'computer repair practice software',
    'diagnostic tracking software',
    'parts inventory software',
    'hardware repair software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Tickets and status' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Repairs and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'technician', name: 'Lead Technician', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/tickets' },
    { id: 'staff', name: 'Bench Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/repairs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'inventory',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'technical',

  examplePrompts: [
    'Build a computer repair platform',
    'Create a PC repair shop portal',
    'I need a computer repair management system',
    'Build a ticket management platform',
    'Create a diagnostic and parts tracking app',
  ],
};
