/**
 * Multimedia App Type Definition
 *
 * Complete definition for multimedia applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MULTIMEDIA_APP_TYPE: AppTypeDefinition = {
  id: 'multimedia',
  name: 'Multimedia',
  category: 'services',
  description: 'Multimedia platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "multimedia",
      "multimedia software",
      "multimedia app",
      "multimedia platform",
      "multimedia system",
      "multimedia management",
      "services multimedia"
  ],

  synonyms: [
      "Multimedia platform",
      "Multimedia software",
      "Multimedia system",
      "multimedia solution",
      "multimedia service"
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
      "Build a multimedia platform",
      "Create a multimedia app",
      "I need a multimedia management system",
      "Build a multimedia solution",
      "Create a multimedia booking system"
  ],
};
