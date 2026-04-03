/**
 * Toddler Program App Type Definition
 *
 * Complete definition for toddler program applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TODDLER_PROGRAM_APP_TYPE: AppTypeDefinition = {
  id: 'toddler-program',
  name: 'Toddler Program',
  category: 'services',
  description: 'Toddler Program platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "toddler program",
      "toddler",
      "program",
      "toddler software",
      "toddler app",
      "toddler platform",
      "toddler system",
      "toddler management",
      "services toddler"
  ],

  synonyms: [
      "Toddler Program platform",
      "Toddler Program software",
      "Toddler Program system",
      "toddler solution",
      "toddler service"
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
      "Build a toddler program platform",
      "Create a toddler program app",
      "I need a toddler program management system",
      "Build a toddler program solution",
      "Create a toddler program booking system"
  ],
};
