/**
 * Home Automation App Type Definition
 *
 * Complete definition for home automation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOME_AUTOMATION_APP_TYPE: AppTypeDefinition = {
  id: 'home-automation',
  name: 'Home Automation',
  category: 'automotive',
  description: 'Home Automation platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "home automation",
      "home",
      "automation",
      "home software",
      "home app",
      "home platform",
      "home system",
      "home management",
      "automotive home"
  ],

  synonyms: [
      "Home Automation platform",
      "Home Automation software",
      "Home Automation system",
      "home solution",
      "home service"
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
      "Build a home automation platform",
      "Create a home automation app",
      "I need a home automation management system",
      "Build a home automation solution",
      "Create a home automation booking system"
  ],
};
