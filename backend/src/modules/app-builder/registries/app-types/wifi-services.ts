/**
 * Wifi Services App Type Definition
 *
 * Complete definition for wifi services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WIFI_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'wifi-services',
  name: 'Wifi Services',
  category: 'services',
  description: 'Wifi Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "wifi services",
      "wifi",
      "services",
      "wifi software",
      "wifi app",
      "wifi platform",
      "wifi system",
      "wifi management",
      "services wifi"
  ],

  synonyms: [
      "Wifi Services platform",
      "Wifi Services software",
      "Wifi Services system",
      "wifi solution",
      "wifi service"
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
      "Build a wifi services platform",
      "Create a wifi services app",
      "I need a wifi services management system",
      "Build a wifi services solution",
      "Create a wifi services booking system"
  ],
};
