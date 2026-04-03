/**
 * Auto Salvage App Type Definition
 *
 * Complete definition for auto salvage applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUTO_SALVAGE_APP_TYPE: AppTypeDefinition = {
  id: 'auto-salvage',
  name: 'Auto Salvage',
  category: 'automotive',
  description: 'Auto Salvage platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "auto salvage",
      "auto",
      "salvage",
      "auto software",
      "auto app",
      "auto platform",
      "auto system",
      "auto management",
      "automotive auto"
  ],

  synonyms: [
      "Auto Salvage platform",
      "Auto Salvage software",
      "Auto Salvage system",
      "auto solution",
      "auto service"
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
      "service-scheduling",
      "appointments",
      "parts-catalog",
      "invoicing",
      "notifications"
  ],

  optionalFeatures: [
      "vehicle-history",
      "payments",
      "reviews",
      "inventory",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'automotive',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
      "Build a auto salvage platform",
      "Create a auto salvage app",
      "I need a auto salvage management system",
      "Build a auto salvage solution",
      "Create a auto salvage booking system"
  ],
};
