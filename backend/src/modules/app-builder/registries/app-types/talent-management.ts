/**
 * Talent Management App Type Definition
 *
 * Complete definition for talent management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TALENT_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'talent-management',
  name: 'Talent Management',
  category: 'services',
  description: 'Talent Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "talent management",
      "talent",
      "management",
      "talent software",
      "talent app",
      "talent platform",
      "talent system",
      "services talent"
  ],

  synonyms: [
      "Talent Management platform",
      "Talent Management software",
      "Talent Management system",
      "talent solution",
      "talent service"
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
      "Build a talent management platform",
      "Create a talent management app",
      "I need a talent management management system",
      "Build a talent management solution",
      "Create a talent management booking system"
  ],
};
