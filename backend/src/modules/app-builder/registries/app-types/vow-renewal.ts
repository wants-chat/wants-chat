/**
 * Vow Renewal App Type Definition
 *
 * Complete definition for vow renewal applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VOW_RENEWAL_APP_TYPE: AppTypeDefinition = {
  id: 'vow-renewal',
  name: 'Vow Renewal',
  category: 'services',
  description: 'Vow Renewal platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "vow renewal",
      "vow",
      "renewal",
      "vow software",
      "vow app",
      "vow platform",
      "vow system",
      "vow management",
      "services vow"
  ],

  synonyms: [
      "Vow Renewal platform",
      "Vow Renewal software",
      "Vow Renewal system",
      "vow solution",
      "vow service"
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
      "Build a vow renewal platform",
      "Create a vow renewal app",
      "I need a vow renewal management system",
      "Build a vow renewal solution",
      "Create a vow renewal booking system"
  ],
};
