/**
 * Warehouse Storage App Type Definition
 *
 * Complete definition for warehouse storage applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WAREHOUSE_STORAGE_APP_TYPE: AppTypeDefinition = {
  id: 'warehouse-storage',
  name: 'Warehouse Storage',
  category: 'services',
  description: 'Warehouse Storage platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "warehouse storage",
      "warehouse",
      "storage",
      "warehouse software",
      "warehouse app",
      "warehouse platform",
      "warehouse system",
      "warehouse management",
      "services warehouse"
  ],

  synonyms: [
      "Warehouse Storage platform",
      "Warehouse Storage software",
      "Warehouse Storage system",
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
      "Build a warehouse storage platform",
      "Create a warehouse storage app",
      "I need a warehouse storage management system",
      "Build a warehouse storage solution",
      "Create a warehouse storage booking system"
  ],
};
