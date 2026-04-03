/**
 * Stress Management App Type Definition
 *
 * Complete definition for stress management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STRESS_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'stress-management',
  name: 'Stress Management',
  category: 'services',
  description: 'Stress Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "stress management",
      "stress",
      "management",
      "stress software",
      "stress app",
      "stress platform",
      "stress system",
      "services stress"
  ],

  synonyms: [
      "Stress Management platform",
      "Stress Management software",
      "Stress Management system",
      "stress solution",
      "stress service"
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
      "Build a stress management platform",
      "Create a stress management app",
      "I need a stress management management system",
      "Build a stress management solution",
      "Create a stress management booking system"
  ],
};
