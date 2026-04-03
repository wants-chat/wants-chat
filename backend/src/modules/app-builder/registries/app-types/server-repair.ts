/**
 * Server Repair App Type Definition
 *
 * Complete definition for server repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SERVER_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'server-repair',
  name: 'Server Repair',
  category: 'services',
  description: 'Server Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "server repair",
      "server",
      "repair",
      "server software",
      "server app",
      "server platform",
      "server system",
      "server management",
      "services server"
  ],

  synonyms: [
      "Server Repair platform",
      "Server Repair software",
      "Server Repair system",
      "server solution",
      "server service"
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
      "Build a server repair platform",
      "Create a server repair app",
      "I need a server repair management system",
      "Build a server repair solution",
      "Create a server repair booking system"
  ],
};
