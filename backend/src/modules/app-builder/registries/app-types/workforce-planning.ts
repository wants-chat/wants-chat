/**
 * Workforce Planning App Type Definition
 *
 * Complete definition for workforce planning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WORKFORCE_PLANNING_APP_TYPE: AppTypeDefinition = {
  id: 'workforce-planning',
  name: 'Workforce Planning',
  category: 'services',
  description: 'Workforce Planning platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "workforce planning",
      "workforce",
      "planning",
      "workforce software",
      "workforce app",
      "workforce platform",
      "workforce system",
      "workforce management",
      "services workforce"
  ],

  synonyms: [
      "Workforce Planning platform",
      "Workforce Planning software",
      "Workforce Planning system",
      "workforce solution",
      "workforce service"
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
      "Build a workforce planning platform",
      "Create a workforce planning app",
      "I need a workforce planning management system",
      "Build a workforce planning solution",
      "Create a workforce planning booking system"
  ],
};
