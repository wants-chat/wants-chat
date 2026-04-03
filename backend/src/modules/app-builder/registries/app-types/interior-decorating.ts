/**
 * Interior Decorating App Type Definition
 *
 * Complete definition for interior decorating applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INTERIOR_DECORATING_APP_TYPE: AppTypeDefinition = {
  id: 'interior-decorating',
  name: 'Interior Decorating',
  category: 'services',
  description: 'Interior Decorating platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "interior decorating",
      "interior",
      "decorating",
      "interior software",
      "interior app",
      "interior platform",
      "interior system",
      "interior management",
      "services interior"
  ],

  synonyms: [
      "Interior Decorating platform",
      "Interior Decorating software",
      "Interior Decorating system",
      "interior solution",
      "interior service"
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
      "Build a interior decorating platform",
      "Create a interior decorating app",
      "I need a interior decorating management system",
      "Build a interior decorating solution",
      "Create a interior decorating booking system"
  ],
};
