/**
 * Reception Services App Type Definition
 *
 * Complete definition for reception services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RECEPTION_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'reception-services',
  name: 'Reception Services',
  category: 'services',
  description: 'Reception Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "reception services",
      "reception",
      "services",
      "reception software",
      "reception app",
      "reception platform",
      "reception system",
      "reception management",
      "services reception"
  ],

  synonyms: [
      "Reception Services platform",
      "Reception Services software",
      "Reception Services system",
      "reception solution",
      "reception service"
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
      "Build a reception services platform",
      "Create a reception services app",
      "I need a reception services management system",
      "Build a reception services solution",
      "Create a reception services booking system"
  ],
};
