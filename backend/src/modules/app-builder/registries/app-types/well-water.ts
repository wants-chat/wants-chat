/**
 * Well Water App Type Definition
 *
 * Complete definition for well water applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WELL_WATER_APP_TYPE: AppTypeDefinition = {
  id: 'well-water',
  name: 'Well Water',
  category: 'services',
  description: 'Well Water platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "well water",
      "well",
      "water",
      "well software",
      "well app",
      "well platform",
      "well system",
      "well management",
      "services well"
  ],

  synonyms: [
      "Well Water platform",
      "Well Water software",
      "Well Water system",
      "well solution",
      "well service"
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
      "Build a well water platform",
      "Create a well water app",
      "I need a well water management system",
      "Build a well water solution",
      "Create a well water booking system"
  ],
};
