/**
 * Senior Nutrition App Type Definition
 *
 * Complete definition for senior nutrition applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SENIOR_NUTRITION_APP_TYPE: AppTypeDefinition = {
  id: 'senior-nutrition',
  name: 'Senior Nutrition',
  category: 'services',
  description: 'Senior Nutrition platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "senior nutrition",
      "senior",
      "nutrition",
      "senior software",
      "senior app",
      "senior platform",
      "senior system",
      "senior management",
      "services senior"
  ],

  synonyms: [
      "Senior Nutrition platform",
      "Senior Nutrition software",
      "Senior Nutrition system",
      "senior solution",
      "senior service"
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
      "Build a senior nutrition platform",
      "Create a senior nutrition app",
      "I need a senior nutrition management system",
      "Build a senior nutrition solution",
      "Create a senior nutrition booking system"
  ],
};
