/**
 * Shower Door App Type Definition
 *
 * Complete definition for shower door applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SHOWER_DOOR_APP_TYPE: AppTypeDefinition = {
  id: 'shower-door',
  name: 'Shower Door',
  category: 'services',
  description: 'Shower Door platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "shower door",
      "shower",
      "door",
      "shower software",
      "shower app",
      "shower platform",
      "shower system",
      "shower management",
      "services shower"
  ],

  synonyms: [
      "Shower Door platform",
      "Shower Door software",
      "Shower Door system",
      "shower solution",
      "shower service"
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
      "Build a shower door platform",
      "Create a shower door app",
      "I need a shower door management system",
      "Build a shower door solution",
      "Create a shower door booking system"
  ],
};
