/**
 * Workforce Management App Type Definition
 *
 * Complete definition for workforce management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WORKFORCE_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'workforce-management',
  name: 'Workforce Management',
  category: 'services',
  description: 'Workforce Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "workforce management",
      "workforce",
      "management",
      "workforce software",
      "workforce app",
      "workforce platform",
      "workforce system",
      "services workforce"
  ],

  synonyms: [
      "Workforce Management platform",
      "Workforce Management software",
      "Workforce Management system",
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
      "Build a workforce management platform",
      "Create a workforce management app",
      "I need a workforce management management system",
      "Build a workforce management solution",
      "Create a workforce management booking system"
  ],
};
