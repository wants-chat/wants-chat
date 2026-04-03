/**
 * Shoe Shine App Type Definition
 *
 * Complete definition for shoe shine applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SHOE_SHINE_APP_TYPE: AppTypeDefinition = {
  id: 'shoe-shine',
  name: 'Shoe Shine',
  category: 'services',
  description: 'Shoe Shine platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "shoe shine",
      "shoe",
      "shine",
      "shoe software",
      "shoe app",
      "shoe platform",
      "shoe system",
      "shoe management",
      "services shoe"
  ],

  synonyms: [
      "Shoe Shine platform",
      "Shoe Shine software",
      "Shoe Shine system",
      "shoe solution",
      "shoe service"
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
      "Build a shoe shine platform",
      "Create a shoe shine app",
      "I need a shoe shine management system",
      "Build a shoe shine solution",
      "Create a shoe shine booking system"
  ],
};
