/**
 * Portable Toilet App Type Definition
 *
 * Complete definition for portable toilet applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PORTABLE_TOILET_APP_TYPE: AppTypeDefinition = {
  id: 'portable-toilet',
  name: 'Portable Toilet',
  category: 'services',
  description: 'Portable Toilet platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "portable toilet",
      "portable",
      "toilet",
      "portable software",
      "portable app",
      "portable platform",
      "portable system",
      "portable management",
      "services portable"
  ],

  synonyms: [
      "Portable Toilet platform",
      "Portable Toilet software",
      "Portable Toilet system",
      "portable solution",
      "portable service"
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
      "Build a portable toilet platform",
      "Create a portable toilet app",
      "I need a portable toilet management system",
      "Build a portable toilet solution",
      "Create a portable toilet booking system"
  ],
};
