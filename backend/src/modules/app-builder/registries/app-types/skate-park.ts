/**
 * Skate Park App Type Definition
 *
 * Complete definition for skate park applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SKATE_PARK_APP_TYPE: AppTypeDefinition = {
  id: 'skate-park',
  name: 'Skate Park',
  category: 'services',
  description: 'Skate Park platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "skate park",
      "skate",
      "park",
      "skate software",
      "skate app",
      "skate platform",
      "skate system",
      "skate management",
      "services skate"
  ],

  synonyms: [
      "Skate Park platform",
      "Skate Park software",
      "Skate Park system",
      "skate solution",
      "skate service"
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
      "Build a skate park platform",
      "Create a skate park app",
      "I need a skate park management system",
      "Build a skate park solution",
      "Create a skate park booking system"
  ],
};
