/**
 * Vinegar Production App Type Definition
 *
 * Complete definition for vinegar production applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VINEGAR_PRODUCTION_APP_TYPE: AppTypeDefinition = {
  id: 'vinegar-production',
  name: 'Vinegar Production',
  category: 'services',
  description: 'Vinegar Production platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "vinegar production",
      "vinegar",
      "production",
      "vinegar software",
      "vinegar app",
      "vinegar platform",
      "vinegar system",
      "vinegar management",
      "services vinegar"
  ],

  synonyms: [
      "Vinegar Production platform",
      "Vinegar Production software",
      "Vinegar Production system",
      "vinegar solution",
      "vinegar service"
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
      "Build a vinegar production platform",
      "Create a vinegar production app",
      "I need a vinegar production management system",
      "Build a vinegar production solution",
      "Create a vinegar production booking system"
  ],
};
