/**
 * Vpn Services App Type Definition
 *
 * Complete definition for vpn services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VPN_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'vpn-services',
  name: 'Vpn Services',
  category: 'services',
  description: 'Vpn Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "vpn services",
      "vpn",
      "services",
      "vpn software",
      "vpn app",
      "vpn platform",
      "vpn system",
      "vpn management",
      "services vpn"
  ],

  synonyms: [
      "Vpn Services platform",
      "Vpn Services software",
      "Vpn Services system",
      "vpn solution",
      "vpn service"
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
      "Build a vpn services platform",
      "Create a vpn services app",
      "I need a vpn services management system",
      "Build a vpn services solution",
      "Create a vpn services booking system"
  ],
};
