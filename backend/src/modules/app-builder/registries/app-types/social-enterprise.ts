/**
 * Social Enterprise App Type Definition
 *
 * Complete definition for social enterprise applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOCIAL_ENTERPRISE_APP_TYPE: AppTypeDefinition = {
  id: 'social-enterprise',
  name: 'Social Enterprise',
  category: 'services',
  description: 'Social Enterprise platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "social enterprise",
      "social",
      "enterprise",
      "social software",
      "social app",
      "social platform",
      "social system",
      "social management",
      "services social"
  ],

  synonyms: [
      "Social Enterprise platform",
      "Social Enterprise software",
      "Social Enterprise system",
      "social solution",
      "social service"
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
      "Build a social enterprise platform",
      "Create a social enterprise app",
      "I need a social enterprise management system",
      "Build a social enterprise solution",
      "Create a social enterprise booking system"
  ],
};
