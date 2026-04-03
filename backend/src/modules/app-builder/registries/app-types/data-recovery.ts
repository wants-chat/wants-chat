/**
 * Data Recovery App Type Definition
 *
 * Complete definition for data recovery services and digital forensics.
 * Essential for data recovery labs, forensics companies, and backup services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DATA_RECOVERY_APP_TYPE: AppTypeDefinition = {
  id: 'data-recovery',
  name: 'Data Recovery Service',
  category: 'technology',
  description: 'Data recovery platform with case management, device tracking, recovery status, and secure file delivery',
  icon: 'hard-drive',

  keywords: [
    'data recovery',
    'digital forensics',
    'data recovery software',
    'hard drive recovery',
    'file recovery',
    'data recovery management',
    'case management',
    'data recovery practice',
    'data recovery scheduling',
    'device tracking',
    'data recovery crm',
    'raid recovery',
    'data recovery business',
    'ssd recovery',
    'data recovery pos',
    'phone recovery',
    'data recovery operations',
    'tape recovery',
    'data recovery services',
    'backup recovery',
  ],

  synonyms: [
    'data recovery platform',
    'data recovery software',
    'digital forensics software',
    'hard drive recovery software',
    'file recovery software',
    'case management software',
    'data recovery practice software',
    'device tracking software',
    'raid recovery software',
    'backup recovery software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Cases and recovery' },
    { id: 'admin', name: 'Lab Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Devices and cases' },
  ],

  roles: [
    { id: 'admin', name: 'Lab Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'engineer', name: 'Recovery Engineer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/cases' },
    { id: 'technician', name: 'Lab Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/devices' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
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
  complexity: 'complex',
  industry: 'technology',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a data recovery service platform',
    'Create a digital forensics portal',
    'I need a data recovery lab management system',
    'Build a hard drive recovery platform',
    'Create a case management and recovery tracking app',
  ],
};
