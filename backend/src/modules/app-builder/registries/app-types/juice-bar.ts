/**
 * Juice Bar App Type Definition
 *
 * Complete definition for juice bar and smoothie shop applications.
 * Essential for juice bars, smoothie shops, and acai bowl cafes.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const JUICE_BAR_APP_TYPE: AppTypeDefinition = {
  id: 'juice-bar',
  name: 'Juice Bar',
  category: 'food-beverage',
  description: 'Juice bar platform with menu customization, mobile ordering, cleanse programs, and loyalty rewards',
  icon: 'lemon',

  keywords: [
    'juice bar',
    'smoothie shop',
    'juice shop',
    'acai bowl',
    'fresh juice',
    'cold pressed juice',
    'juice cleanse',
    'smoothie bar',
    'healthy drinks',
    'juice ordering',
    'juice menu',
    'superfood',
    'wellness drinks',
    'juice subscription',
    'protein smoothie',
    'green juice',
    'detox juice',
    'juice delivery',
    'healthy cafe',
    'juice bar app',
  ],

  synonyms: [
    'juice bar platform',
    'juice bar software',
    'smoothie shop software',
    'juice ordering software',
    'juice bar pos',
    'smoothie bar software',
    'cold pressed juice software',
    'juice cleanse software',
    'wellness drink software',
    'juice bar management',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness gym', 'bar alcohol'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Order and customize drinks' },
    { id: 'admin', name: 'Juice Bar Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Orders and menu' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Shop Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'barista', name: 'Juice Barista', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/queue' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'menu-management',
    'food-ordering',
    'pos-system',
    'payments',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'kitchen-display',
    'reviews',
    'inventory',
    'analytics',
  ],

  incompatibleFeatures: ['vehicle-tracking', 'medical-records', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'food-beverage',

  defaultColorScheme: 'lime',
  defaultDesignVariant: 'fresh',

  examplePrompts: [
    'Build a juice bar ordering app',
    'Create a smoothie shop platform',
    'I need a juice cleanse subscription system',
    'Build a healthy drinks ordering app',
    'Create a juice bar with loyalty rewards',
  ],
};
