/**
 * Auto Customization App Type Definition
 *
 * Complete definition for auto customization applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUTO_CUSTOMIZATION_APP_TYPE: AppTypeDefinition = {
  id: 'auto-customization',
  name: 'Auto Customization',
  category: 'automotive',
  description: 'Auto Customization platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "auto customization",
      "auto",
      "customization",
      "auto software",
      "auto app",
      "auto platform",
      "auto system",
      "auto management",
      "automotive auto"
  ],

  synonyms: [
      "Auto Customization platform",
      "Auto Customization software",
      "Auto Customization system",
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
      "Build a auto customization platform",
      "Create a auto customization app",
      "I need a auto customization management system",
      "Build a auto customization solution",
      "Create a auto customization booking system"
  ],
};
