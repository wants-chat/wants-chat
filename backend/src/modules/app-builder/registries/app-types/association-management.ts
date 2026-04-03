/**
 * Association Management App Type Definition
 *
 * Complete definition for association management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ASSOCIATION_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'association-management',
  name: 'Association Management',
  category: 'services',
  description: 'Association Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "association management",
      "association",
      "management",
      "association software",
      "association app",
      "association platform",
      "association system",
      "services association"
  ],

  synonyms: [
      "Association Management platform",
      "Association Management software",
      "Association Management system",
      "association solution",
      "association service"
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
      "Build a association management platform",
      "Create a association management app",
      "I need a association management management system",
      "Build a association management solution",
      "Create a association management booking system"
  ],
};
