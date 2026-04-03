/**
 * Gastroenterology App Type Definition
 *
 * Complete definition for gastroenterology practices and GI centers.
 * Essential for GI doctors, endoscopy centers, and digestive health services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GASTROENTEROLOGY_APP_TYPE: AppTypeDefinition = {
  id: 'gastroenterology',
  name: 'Gastroenterology',
  category: 'healthcare',
  description: 'Gastroenterology platform with procedure scheduling, bowel prep tracking, pathology integration, and follow-up management',
  icon: 'activity',

  keywords: [
    'gastroenterology',
    'GI doctor',
    'gastroenterology software',
    'digestive health',
    'colonoscopy',
    'gastroenterology management',
    'endoscopy',
    'gastroenterology practice',
    'gastroenterology scheduling',
    'IBD',
    'gastroenterology crm',
    'GERD',
    'gastroenterology business',
    'liver',
    'gastroenterology pos',
    'hepatology',
    'gastroenterology operations',
    'bowel prep',
    'gastroenterology services',
    'colon screening',
  ],

  synonyms: [
    'gastroenterology platform',
    'gastroenterology software',
    'GI doctor software',
    'digestive health software',
    'colonoscopy software',
    'endoscopy software',
    'gastroenterology practice software',
    'IBD software',
    'hepatology software',
    'colon screening software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'general practice'],

  sections: [
    { id: 'frontend', name: 'Patient Portal', enabled: true, basePath: '/', layout: 'public', description: 'Procedures and prep' },
    { id: 'admin', name: 'Practice Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Patients and procedures' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Administrator', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'physician', name: 'Gastroenterologist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
    { id: 'staff', name: 'Endoscopy Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/procedures' },
    { id: 'patient', name: 'Patient', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['table-reservations', 'property-listings', 'inventory-retail'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'medical',

  examplePrompts: [
    'Build a gastroenterology practice platform',
    'Create an endoscopy center patient portal',
    'I need a colonoscopy scheduling system',
    'Build a GI doctor practice platform',
    'Create a digestive health app',
  ],
};
