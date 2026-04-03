/**
 * Pancake House App Type Definition
 *
 * Complete definition for pancake house applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PANCAKE_HOUSE_APP_TYPE: AppTypeDefinition = {
  id: 'pancake-house',
  name: 'Pancake House',
  category: 'services',
  description: 'Pancake House platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "pancake house",
      "pancake",
      "house",
      "pancake software",
      "pancake app",
      "pancake platform",
      "pancake system",
      "pancake management",
      "services pancake"
  ],

  synonyms: [
      "Pancake House platform",
      "Pancake House software",
      "Pancake House system",
      "pancake solution",
      "pancake service"
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
      "Build a pancake house platform",
      "Create a pancake house app",
      "I need a pancake house management system",
      "Build a pancake house solution",
      "Create a pancake house booking system"
  ],
};
