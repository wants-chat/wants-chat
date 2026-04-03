/**
 * Urban Planning App Type Definition
 *
 * Complete definition for urban planning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const URBAN_PLANNING_APP_TYPE: AppTypeDefinition = {
  id: 'urban-planning',
  name: 'Urban Planning',
  category: 'services',
  description: 'Urban Planning platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "urban planning",
      "urban",
      "planning",
      "urban software",
      "urban app",
      "urban platform",
      "urban system",
      "urban management",
      "services urban"
  ],

  synonyms: [
      "Urban Planning platform",
      "Urban Planning software",
      "Urban Planning system",
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
      "Build a urban planning platform",
      "Create a urban planning app",
      "I need a urban planning management system",
      "Build a urban planning solution",
      "Create a urban planning booking system"
  ],
};
