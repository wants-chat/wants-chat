/**
 * Network Services App Type Definition
 *
 * Complete definition for network service providers and IT infrastructure.
 * Essential for network installers, cabling companies, and infrastructure providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NETWORK_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'network-services',
  name: 'Network Services',
  category: 'technology',
  description: 'Network services platform with project scheduling, equipment inventory, network diagrams, and maintenance contracts',
  icon: 'network',

  keywords: [
    'network services',
    'it infrastructure',
    'network services software',
    'network installation',
    'cabling services',
    'network services management',
    'project scheduling',
    'network services practice',
    'network services scheduling',
    'equipment inventory',
    'network services crm',
    'wifi installation',
    'network services business',
    'fiber optics',
    'network services pos',
    'structured cabling',
    'network services operations',
    'network security',
    'network services platform',
    'lan wan',
  ],

  synonyms: [
    'network services platform',
    'network services software',
    'it infrastructure software',
    'network installation software',
    'cabling services software',
    'project scheduling software',
    'network services practice software',
    'equipment inventory software',
    'wifi installation software',
    'structured cabling software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food', 'social', 'community', 'social network'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Projects and contracts' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Projects and equipment' },
  ],

  roles: [
    { id: 'admin', name: 'Operations Manager', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'engineer', name: 'Network Engineer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'technician', name: 'Field Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
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
    'team-management',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'technology',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a network services platform',
    'Create an IT infrastructure portal',
    'I need a cabling company management system',
    'Build a network installation platform',
    'Create a project and equipment tracking app',
  ],
};
