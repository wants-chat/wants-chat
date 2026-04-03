/**
 * Astronomy App Type Definition
 *
 * Complete definition for astronomy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ASTRONOMY_APP_TYPE: AppTypeDefinition = {
  id: 'astronomy',
  name: 'Astronomy',
  category: 'services',
  description: 'Astronomy platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "astronomy",
      "astronomy software",
      "astronomy app",
      "astronomy platform",
      "astronomy system",
      "astronomy management",
      "services astronomy"
  ],

  synonyms: [
      "Astronomy platform",
      "Astronomy software",
      "Astronomy system",
      "astronomy solution",
      "astronomy service"
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
      "Build a astronomy platform",
      "Create a astronomy app",
      "I need a astronomy management system",
      "Build a astronomy solution",
      "Create a astronomy booking system"
  ],
};
