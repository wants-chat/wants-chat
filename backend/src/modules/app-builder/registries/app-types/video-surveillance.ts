/**
 * Video Surveillance App Type Definition
 *
 * Complete definition for video surveillance and CCTV management applications.
 * Essential for surveillance providers, CCTV installers, and monitoring services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VIDEO_SURVEILLANCE_APP_TYPE: AppTypeDefinition = {
  id: 'video-surveillance',
  name: 'Video Surveillance',
  category: 'security',
  description: 'Video surveillance platform with camera management, live monitoring, recording playback, and event alerts',
  icon: 'video',

  keywords: [
    'video surveillance',
    'cctv',
    'security cameras',
    'video monitoring',
    'surveillance software',
    'camera management',
    'video recording',
    'live monitoring',
    'video analytics',
    'surveillance system',
    'security video',
    'ip cameras',
    'video playback',
    'surveillance business',
    'video security',
    'cctv management',
    'remote viewing',
    'video alerts',
    'surveillance monitoring',
    'nvr management',
  ],

  synonyms: [
    'video surveillance platform',
    'video surveillance software',
    'cctv software',
    'camera management software',
    'video monitoring software',
    'surveillance management software',
    'security camera software',
    'video recording software',
    'live monitoring software',
    'video analytics software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'video editing'],

  sections: [
    { id: 'frontend', name: 'Viewer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Live view and playback' },
    { id: 'admin', name: 'Surveillance Dashboard', enabled: true, basePath: '/admin', requiredRole: 'operator', layout: 'admin', description: 'Cameras and recordings' },
  ],

  roles: [
    { id: 'admin', name: 'System Admin', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/cameras' },
    { id: 'operator', name: 'Monitoring Operator', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/live' },
    { id: 'technician', name: 'Technician', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/health' },
    { id: 'viewer', name: 'Viewer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'manufacturing'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'security',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a video surveillance platform',
    'Create a CCTV management app',
    'I need a camera monitoring system',
    'Build a security video app',
    'Create a surveillance recording platform',
  ],
};
