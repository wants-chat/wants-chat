/**
 * Horse Trainer App Type Definition
 *
 * Complete definition for horse training operations.
 * Essential for horse trainers, equine behaviorists, and professional horse training facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HORSE_TRAINER_APP_TYPE: AppTypeDefinition = {
  id: 'horse-trainer',
  name: 'Horse Trainer',
  category: 'services',
  description: 'Horse trainer platform with training programs, progress tracking, client management, and show preparation',
  icon: 'award',

  keywords: [
    'horse trainer',
    'equine training',
    'horse trainer software',
    'horse training',
    'colt starting',
    'horse trainer management',
    'training programs',
    'horse trainer practice',
    'horse trainer scheduling',
    'progress tracking',
    'horse trainer crm',
    'client management',
    'horse trainer business',
    'show preparation',
    'horse trainer pos',
    'reining training',
    'horse trainer operations',
    'dressage training',
    'horse trainer platform',
    'western training',
  ],

  synonyms: [
    'horse trainer platform',
    'horse trainer software',
    'equine training software',
    'horse training software',
    'colt starting software',
    'training programs software',
    'horse trainer practice software',
    'progress tracking software',
    'client management software',
    'reining training software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Owner Portal', enabled: true, basePath: '/', layout: 'public', description: 'Training and progress' },
    { id: 'admin', name: 'Trainer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Horses and programs' },
  ],

  roles: [
    { id: 'admin', name: 'Head Trainer', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'trainer', name: 'Associate Trainer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/horses' },
    { id: 'assistant', name: 'Training Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'owner', name: 'Horse Owner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'analytics',
    'clients',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'services',

  defaultColorScheme: 'brown',
  defaultDesignVariant: 'equestrian',

  examplePrompts: [
    'Build a horse trainer platform',
    'Create an equine training app',
    'I need a horse training management system',
    'Build a professional horse trainer app',
    'Create a horse trainer portal',
  ],
};
