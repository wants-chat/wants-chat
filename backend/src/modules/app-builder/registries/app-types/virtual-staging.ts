/**
 * Virtual Staging App Type Definition
 *
 * Complete definition for virtual staging applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VIRTUAL_STAGING_APP_TYPE: AppTypeDefinition = {
  id: 'virtual-staging',
  name: 'Virtual Staging',
  category: 'services',
  description: 'Virtual Staging platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "virtual staging",
      "virtual",
      "staging",
      "virtual software",
      "virtual app",
      "virtual platform",
      "virtual system",
      "virtual management",
      "services virtual"
  ],

  synonyms: [
      "Virtual Staging platform",
      "Virtual Staging software",
      "Virtual Staging system",
      "virtual solution",
      "virtual service"
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
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a virtual staging platform",
      "Create a virtual staging app",
      "I need a virtual staging management system",
      "Build a virtual staging solution",
      "Create a virtual staging booking system"
  ],
};
