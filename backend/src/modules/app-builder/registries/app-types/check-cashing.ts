/**
 * Check Cashing App Type Definition
 *
 * Complete definition for check cashing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CHECK_CASHING_APP_TYPE: AppTypeDefinition = {
  id: 'check-cashing',
  name: 'Check Cashing',
  category: 'services',
  description: 'Check Cashing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "check cashing",
      "check",
      "cashing",
      "check software",
      "check app",
      "check platform",
      "check system",
      "check management",
      "services check"
  ],

  synonyms: [
      "Check Cashing platform",
      "Check Cashing software",
      "Check Cashing system",
      "check solution",
      "check service"
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
      "Build a check cashing platform",
      "Create a check cashing app",
      "I need a check cashing management system",
      "Build a check cashing solution",
      "Create a check cashing booking system"
  ],
};
