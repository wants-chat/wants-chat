/**
 * Urban Agriculture App Type Definition
 *
 * Complete definition for urban agriculture applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const URBAN_AGRICULTURE_APP_TYPE: AppTypeDefinition = {
  id: 'urban-agriculture',
  name: 'Urban Agriculture',
  category: 'services',
  description: 'Urban Agriculture platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "urban agriculture",
      "urban",
      "agriculture",
      "urban software",
      "urban app",
      "urban platform",
      "urban system",
      "urban management",
      "services urban"
  ],

  synonyms: [
      "Urban Agriculture platform",
      "Urban Agriculture software",
      "Urban Agriculture system",
      "urban solution",
      "urban service"
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
      "Build a urban agriculture platform",
      "Create a urban agriculture app",
      "I need a urban agriculture management system",
      "Build a urban agriculture solution",
      "Create a urban agriculture booking system"
  ],
};
