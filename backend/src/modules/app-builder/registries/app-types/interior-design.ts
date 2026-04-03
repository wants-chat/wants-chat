/**
 * Interior Design App Type Definition
 *
 * Complete definition for interior design applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INTERIOR_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'interior-design',
  name: 'Interior Design',
  category: 'services',
  description: 'Interior Design platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "interior design",
      "interior",
      "design",
      "interior software",
      "interior app",
      "interior platform",
      "interior system",
      "interior management",
      "services interior"
  ],

  synonyms: [
      "Interior Design platform",
      "Interior Design software",
      "Interior Design system",
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
      "Build a interior design platform",
      "Create a interior design app",
      "I need a interior design management system",
      "Build a interior design solution",
      "Create a interior design booking system"
  ],
};
