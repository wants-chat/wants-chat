/**
 * Apostille Service App Type Definition
 *
 * Complete definition for apostille service applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const APOSTILLE_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'apostille-service',
  name: 'Apostille Service',
  category: 'services',
  description: 'Apostille Service platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "apostille service",
      "apostille",
      "service",
      "apostille software",
      "apostille app",
      "apostille platform",
      "apostille system",
      "apostille management",
      "services apostille"
  ],

  synonyms: [
      "Apostille Service platform",
      "Apostille Service software",
      "Apostille Service system",
      "apostille solution",
      "apostille service"
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
      "Build a apostille service platform",
      "Create a apostille service app",
      "I need a apostille service management system",
      "Build a apostille service solution",
      "Create a apostille service booking system"
  ],
};
