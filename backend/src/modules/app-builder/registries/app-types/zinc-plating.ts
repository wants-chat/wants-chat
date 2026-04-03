/**
 * Zinc Plating App Type Definition
 *
 * Complete definition for zinc plating applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ZINC_PLATING_APP_TYPE: AppTypeDefinition = {
  id: 'zinc-plating',
  name: 'Zinc Plating',
  category: 'services',
  description: 'Zinc Plating platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "zinc plating",
      "zinc",
      "plating",
      "zinc software",
      "zinc app",
      "zinc platform",
      "zinc system",
      "zinc management",
      "services zinc"
  ],

  synonyms: [
      "Zinc Plating platform",
      "Zinc Plating software",
      "Zinc Plating system",
      "zinc solution",
      "zinc service"
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
      "Build a zinc plating platform",
      "Create a zinc plating app",
      "I need a zinc plating management system",
      "Build a zinc plating solution",
      "Create a zinc plating booking system"
  ],
};
