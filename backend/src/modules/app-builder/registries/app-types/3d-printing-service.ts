/**
 * 3d Printing Service App Type Definition
 *
 * Complete definition for 3d printing service applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const THREE_D_PRINTING_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: '3d-printing-service',
  name: '3d Printing Service',
  category: 'services',
  description: '3d Printing Service platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "3d printing service",
      "printing",
      "service",
      "3d software",
      "3d app",
      "3d platform",
      "3d system",
      "3d management",
      "services 3d"
  ],

  synonyms: [
      "3d Printing Service platform",
      "3d Printing Service software",
      "3d Printing Service system",
      "3d solution",
      "3d service"
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
      "Build a 3d printing service platform",
      "Create a 3d printing service app",
      "I need a 3d printing service management system",
      "Build a 3d printing service solution",
      "Create a 3d printing service booking system"
  ],
};
