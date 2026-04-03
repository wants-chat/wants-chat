/**
 * Agricultural Equipment App Type Definition
 *
 * Complete definition for agricultural equipment applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AGRICULTURAL_EQUIPMENT_APP_TYPE: AppTypeDefinition = {
  id: 'agricultural-equipment',
  name: 'Agricultural Equipment',
  category: 'services',
  description: 'Agricultural Equipment platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "agricultural equipment",
      "agricultural",
      "equipment",
      "agricultural software",
      "agricultural app",
      "agricultural platform",
      "agricultural system",
      "agricultural management",
      "services agricultural"
  ],

  synonyms: [
      "Agricultural Equipment platform",
      "Agricultural Equipment software",
      "Agricultural Equipment system",
      "agricultural solution",
      "agricultural service"
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
      "Build a agricultural equipment platform",
      "Create a agricultural equipment app",
      "I need a agricultural equipment management system",
      "Build a agricultural equipment solution",
      "Create a agricultural equipment booking system"
  ],
};
