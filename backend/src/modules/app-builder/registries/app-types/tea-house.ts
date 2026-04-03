/**
 * Tea House App Type Definition
 *
 * Complete definition for tea house applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TEA_HOUSE_APP_TYPE: AppTypeDefinition = {
  id: 'tea-house',
  name: 'Tea House',
  category: 'services',
  description: 'Tea House platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tea house",
      "tea",
      "house",
      "tea software",
      "tea app",
      "tea platform",
      "tea system",
      "tea management",
      "services tea"
  ],

  synonyms: [
      "Tea House platform",
      "Tea House software",
      "Tea House system",
      "tea solution",
      "tea service"
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
      "Build a tea house platform",
      "Create a tea house app",
      "I need a tea house management system",
      "Build a tea house solution",
      "Create a tea house booking system"
  ],
};
