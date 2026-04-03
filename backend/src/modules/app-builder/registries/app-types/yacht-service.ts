/**
 * Yacht Service App Type Definition
 *
 * Complete definition for yacht service applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YACHT_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'yacht-service',
  name: 'Yacht Service',
  category: 'services',
  description: 'Yacht Service platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "yacht service",
      "yacht",
      "service",
      "yacht software",
      "yacht app",
      "yacht platform",
      "yacht system",
      "yacht management",
      "services yacht"
  ],

  synonyms: [
      "Yacht Service platform",
      "Yacht Service software",
      "Yacht Service system",
      "yacht solution",
      "yacht service"
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
      "Build a yacht service platform",
      "Create a yacht service app",
      "I need a yacht service management system",
      "Build a yacht service solution",
      "Create a yacht service booking system"
  ],
};
