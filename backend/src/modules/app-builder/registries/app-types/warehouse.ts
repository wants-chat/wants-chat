/**
 * Warehouse App Type Definition
 *
 * Complete definition for warehouse applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WAREHOUSE_APP_TYPE: AppTypeDefinition = {
  id: 'warehouse',
  name: 'Warehouse',
  category: 'services',
  description: 'Warehouse platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "warehouse",
      "warehouse software",
      "warehouse app",
      "warehouse platform",
      "warehouse system",
      "warehouse management",
      "services warehouse"
  ],

  synonyms: [
      "Warehouse platform",
      "Warehouse software",
      "Warehouse system",
      "warehouse solution",
      "warehouse service"
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
      "Build a warehouse platform",
      "Create a warehouse app",
      "I need a warehouse management system",
      "Build a warehouse solution",
      "Create a warehouse booking system"
  ],
};
