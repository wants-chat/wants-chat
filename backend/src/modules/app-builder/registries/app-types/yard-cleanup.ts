/**
 * Yard Cleanup App Type Definition
 *
 * Complete definition for yard cleanup applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YARD_CLEANUP_APP_TYPE: AppTypeDefinition = {
  id: 'yard-cleanup',
  name: 'Yard Cleanup',
  category: 'services',
  description: 'Yard Cleanup platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "yard cleanup",
      "yard",
      "cleanup",
      "yard software",
      "yard app",
      "yard platform",
      "yard system",
      "yard management",
      "services yard"
  ],

  synonyms: [
      "Yard Cleanup platform",
      "Yard Cleanup software",
      "Yard Cleanup system",
      "yard solution",
      "yard service"
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
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "clients",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a yard cleanup platform",
      "Create a yard cleanup app",
      "I need a yard cleanup management system",
      "Build a yard cleanup solution",
      "Create a yard cleanup booking system"
  ],
};
