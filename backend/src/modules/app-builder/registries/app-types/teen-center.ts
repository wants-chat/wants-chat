/**
 * Teen Center App Type Definition
 *
 * Complete definition for teen center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TEEN_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'teen-center',
  name: 'Teen Center',
  category: 'services',
  description: 'Teen Center platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "teen center",
      "teen",
      "center",
      "teen software",
      "teen app",
      "teen platform",
      "teen system",
      "teen management",
      "services teen"
  ],

  synonyms: [
      "Teen Center platform",
      "Teen Center software",
      "Teen Center system",
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
      "Build a teen center platform",
      "Create a teen center app",
      "I need a teen center management system",
      "Build a teen center solution",
      "Create a teen center booking system"
  ],
};
