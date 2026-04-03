/**
 * Virtual Reality App Type Definition
 *
 * Complete definition for virtual reality applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VIRTUAL_REALITY_APP_TYPE: AppTypeDefinition = {
  id: 'virtual-reality',
  name: 'Virtual Reality',
  category: 'services',
  description: 'Virtual Reality platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "virtual reality",
      "virtual",
      "reality",
      "virtual software",
      "virtual app",
      "virtual platform",
      "virtual system",
      "virtual management",
      "services virtual"
  ],

  synonyms: [
      "Virtual Reality platform",
      "Virtual Reality software",
      "Virtual Reality system",
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
      "Build a virtual reality platform",
      "Create a virtual reality app",
      "I need a virtual reality management system",
      "Build a virtual reality solution",
      "Create a virtual reality booking system"
  ],
};
