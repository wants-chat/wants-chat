/**
 * Auto Financing App Type Definition
 *
 * Complete definition for auto financing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUTO_FINANCING_APP_TYPE: AppTypeDefinition = {
  id: 'auto-financing',
  name: 'Auto Financing',
  category: 'automotive',
  description: 'Auto Financing platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "auto financing",
      "auto",
      "financing",
      "auto software",
      "auto app",
      "auto platform",
      "auto system",
      "auto management",
      "automotive auto"
  ],

  synonyms: [
      "Auto Financing platform",
      "Auto Financing software",
      "Auto Financing system",
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
      "Build a auto financing platform",
      "Create a auto financing app",
      "I need a auto financing management system",
      "Build a auto financing solution",
      "Create a auto financing booking system"
  ],
};
