/**
 * Mirror Installation App Type Definition
 *
 * Complete definition for mirror installation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MIRROR_INSTALLATION_APP_TYPE: AppTypeDefinition = {
  id: 'mirror-installation',
  name: 'Mirror Installation',
  category: 'services',
  description: 'Mirror Installation platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "mirror installation",
      "mirror",
      "installation",
      "mirror software",
      "mirror app",
      "mirror platform",
      "mirror system",
      "mirror management",
      "services mirror"
  ],

  synonyms: [
      "Mirror Installation platform",
      "Mirror Installation software",
      "Mirror Installation system",
      "mirror solution",
      "mirror service"
  ],

  negativeKeywords: ['blog', 'portfolio'],

  sections: [
      {
          "id": "frontend",
          "name": "Public Portal",
          "enabled": true,
          "basePath": "/",
          "layout": "public",
          "description": "Public-facing interface"
      },
      {
          "id": "admin",
          "name": "Admin Dashboard",
          "enabled": true,
          "basePath": "/admin",
          "requiredRole": "staff",
          "layout": "admin",
          "description": "Administrative interface"
      }
  ],

  roles: [
      {
          "id": "admin",
          "name": "Administrator",
          "level": 100,
          "isDefault": false,
          "accessibleSections": [
              "frontend",
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "staff",
          "name": "Staff",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "User",
          "level": 10,
          "isDefault": true,
          "accessibleSections": [
              "frontend"
          ],
          "defaultRoute": "/"
      }
  ],

  defaultFeatures: [
      "user-auth",
      "appointments",
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "clients",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a mirror installation platform",
      "Create a mirror installation app",
      "I need a mirror installation management system",
      "Build a mirror installation solution",
      "Create a mirror installation booking system"
  ],
};
