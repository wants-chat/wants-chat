/**
 * Special Effects App Type Definition
 *
 * Complete definition for special effects applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPECIAL_EFFECTS_APP_TYPE: AppTypeDefinition = {
  id: 'special-effects',
  name: 'Special Effects',
  category: 'services',
  description: 'Special Effects platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "special effects",
      "special",
      "effects",
      "special software",
      "special app",
      "special platform",
      "special system",
      "special management",
      "services special"
  ],

  synonyms: [
      "Special Effects platform",
      "Special Effects software",
      "Special Effects system",
      "special solution",
      "special service"
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
      "Build a special effects platform",
      "Create a special effects app",
      "I need a special effects management system",
      "Build a special effects solution",
      "Create a special effects booking system"
  ],
};
