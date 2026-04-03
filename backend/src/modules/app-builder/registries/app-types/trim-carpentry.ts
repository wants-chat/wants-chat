/**
 * Trim Carpentry App Type Definition
 *
 * Complete definition for trim carpentry applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRIM_CARPENTRY_APP_TYPE: AppTypeDefinition = {
  id: 'trim-carpentry',
  name: 'Trim Carpentry',
  category: 'automotive',
  description: 'Trim Carpentry platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "trim carpentry",
      "trim",
      "carpentry",
      "trim software",
      "trim app",
      "trim platform",
      "trim system",
      "trim management",
      "automotive trim"
  ],

  synonyms: [
      "Trim Carpentry platform",
      "Trim Carpentry software",
      "Trim Carpentry system",
      "trim solution",
      "trim service"
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
      "vehicle-inventory",
      "appointments",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "service-scheduling",
      "parts-catalog",
      "invoicing",
      "payments",
      "reviews"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'automotive',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
      "Build a trim carpentry platform",
      "Create a trim carpentry app",
      "I need a trim carpentry management system",
      "Build a trim carpentry solution",
      "Create a trim carpentry booking system"
  ],
};
