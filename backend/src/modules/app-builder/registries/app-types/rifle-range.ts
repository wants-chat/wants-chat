/**
 * Rifle Range App Type Definition
 *
 * Complete definition for rifle range applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RIFLE_RANGE_APP_TYPE: AppTypeDefinition = {
  id: 'rifle-range',
  name: 'Rifle Range',
  category: 'services',
  description: 'Rifle Range platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "rifle range",
      "rifle",
      "range",
      "rifle software",
      "rifle app",
      "rifle platform",
      "rifle system",
      "rifle management",
      "services rifle"
  ],

  synonyms: [
      "Rifle Range platform",
      "Rifle Range software",
      "Rifle Range system",
      "rifle solution",
      "rifle service"
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
      "Build a rifle range platform",
      "Create a rifle range app",
      "I need a rifle range management system",
      "Build a rifle range solution",
      "Create a rifle range booking system"
  ],
};
