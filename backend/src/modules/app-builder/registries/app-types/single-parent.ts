/**
 * Single Parent App Type Definition
 *
 * Complete definition for single parent applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SINGLE_PARENT_APP_TYPE: AppTypeDefinition = {
  id: 'single-parent',
  name: 'Single Parent',
  category: 'services',
  description: 'Single Parent platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "single parent",
      "single",
      "parent",
      "single software",
      "single app",
      "single platform",
      "single system",
      "single management",
      "services single"
  ],

  synonyms: [
      "Single Parent platform",
      "Single Parent software",
      "Single Parent system",
      "single solution",
      "single service"
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
      "Build a single parent platform",
      "Create a single parent app",
      "I need a single parent management system",
      "Build a single parent solution",
      "Create a single parent booking system"
  ],
};
