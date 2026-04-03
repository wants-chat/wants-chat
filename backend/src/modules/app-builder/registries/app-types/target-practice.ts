/**
 * Target Practice App Type Definition
 *
 * Complete definition for target practice applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TARGET_PRACTICE_APP_TYPE: AppTypeDefinition = {
  id: 'target-practice',
  name: 'Target Practice',
  category: 'services',
  description: 'Target Practice platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "target practice",
      "target",
      "practice",
      "target software",
      "target app",
      "target platform",
      "target system",
      "target management",
      "services target"
  ],

  synonyms: [
      "Target Practice platform",
      "Target Practice software",
      "Target Practice system",
      "target solution",
      "target service"
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
      "Build a target practice platform",
      "Create a target practice app",
      "I need a target practice management system",
      "Build a target practice solution",
      "Create a target practice booking system"
  ],
};
