/**
 * Kindergarten App Type Definition
 *
 * Complete definition for kindergarten applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const KINDERGARTEN_APP_TYPE: AppTypeDefinition = {
  id: 'kindergarten',
  name: 'Kindergarten',
  category: 'services',
  description: 'Kindergarten platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "kindergarten",
      "kindergarten software",
      "kindergarten app",
      "kindergarten platform",
      "kindergarten system",
      "kindergarten management",
      "services kindergarten"
  ],

  synonyms: [
      "Kindergarten platform",
      "Kindergarten software",
      "Kindergarten system",
      "kindergarten solution",
      "kindergarten service"
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
      "Build a kindergarten platform",
      "Create a kindergarten app",
      "I need a kindergarten management system",
      "Build a kindergarten solution",
      "Create a kindergarten booking system"
  ],
};
