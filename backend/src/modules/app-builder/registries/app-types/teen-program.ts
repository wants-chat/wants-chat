/**
 * Teen Program App Type Definition
 *
 * Complete definition for teen program applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TEEN_PROGRAM_APP_TYPE: AppTypeDefinition = {
  id: 'teen-program',
  name: 'Teen Program',
  category: 'services',
  description: 'Teen Program platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "teen program",
      "teen",
      "program",
      "teen software",
      "teen app",
      "teen platform",
      "teen system",
      "teen management",
      "services teen"
  ],

  synonyms: [
      "Teen Program platform",
      "Teen Program software",
      "Teen Program system",
      "teen solution",
      "teen service"
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
      "Build a teen program platform",
      "Create a teen program app",
      "I need a teen program management system",
      "Build a teen program solution",
      "Create a teen program booking system"
  ],
};
