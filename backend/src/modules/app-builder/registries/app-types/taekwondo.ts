/**
 * Taekwondo App Type Definition
 *
 * Complete definition for taekwondo applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TAEKWONDO_APP_TYPE: AppTypeDefinition = {
  id: 'taekwondo',
  name: 'Taekwondo',
  category: 'services',
  description: 'Taekwondo platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "taekwondo",
      "taekwondo software",
      "taekwondo app",
      "taekwondo platform",
      "taekwondo system",
      "taekwondo management",
      "services taekwondo"
  ],

  synonyms: [
      "Taekwondo platform",
      "Taekwondo software",
      "Taekwondo system",
      "taekwondo solution",
      "taekwondo service"
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
      "Build a taekwondo platform",
      "Create a taekwondo app",
      "I need a taekwondo management system",
      "Build a taekwondo solution",
      "Create a taekwondo booking system"
  ],
};
