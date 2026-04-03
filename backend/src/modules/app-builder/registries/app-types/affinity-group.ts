/**
 * Affinity Group App Type Definition
 *
 * Complete definition for affinity group applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AFFINITY_GROUP_APP_TYPE: AppTypeDefinition = {
  id: 'affinity-group',
  name: 'Affinity Group',
  category: 'services',
  description: 'Affinity Group platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "affinity group",
      "affinity",
      "group",
      "affinity software",
      "affinity app",
      "affinity platform",
      "affinity system",
      "affinity management",
      "services affinity"
  ],

  synonyms: [
      "Affinity Group platform",
      "Affinity Group software",
      "Affinity Group system",
      "affinity solution",
      "affinity service"
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
      "Build a affinity group platform",
      "Create a affinity group app",
      "I need a affinity group management system",
      "Build a affinity group solution",
      "Create a affinity group booking system"
  ],
};
