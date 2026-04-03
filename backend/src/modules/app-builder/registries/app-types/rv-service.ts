/**
 * Rv Service App Type Definition
 *
 * Complete definition for rv service applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RV_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'rv-service',
  name: 'Rv Service',
  category: 'services',
  description: 'Rv Service platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "rv service",
      "service",
      "rv software",
      "rv app",
      "rv platform",
      "rv system",
      "rv management",
      "services rv"
  ],

  synonyms: [
      "Rv Service platform",
      "Rv Service software",
      "Rv Service system",
      "rv solution",
      "rv service"
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
      "Build a rv service platform",
      "Create a rv service app",
      "I need a rv service management system",
      "Build a rv service solution",
      "Create a rv service booking system"
  ],
};
