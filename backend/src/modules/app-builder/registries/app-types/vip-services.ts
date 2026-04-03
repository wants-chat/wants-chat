/**
 * Vip Services App Type Definition
 *
 * Complete definition for vip services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VIP_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'vip-services',
  name: 'Vip Services',
  category: 'services',
  description: 'Vip Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "vip services",
      "vip",
      "services",
      "vip software",
      "vip app",
      "vip platform",
      "vip system",
      "vip management",
      "services vip"
  ],

  synonyms: [
      "Vip Services platform",
      "Vip Services software",
      "Vip Services system",
      "vip solution",
      "vip service"
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
      "Build a vip services platform",
      "Create a vip services app",
      "I need a vip services management system",
      "Build a vip services solution",
      "Create a vip services booking system"
  ],
};
