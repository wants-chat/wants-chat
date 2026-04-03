/**
 * Television Repair App Type Definition
 *
 * Complete definition for television repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TELEVISION_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'television-repair',
  name: 'Television Repair',
  category: 'services',
  description: 'Television Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "television repair",
      "television",
      "repair",
      "television software",
      "television app",
      "television platform",
      "television system",
      "television management",
      "services television"
  ],

  synonyms: [
      "Television Repair platform",
      "Television Repair software",
      "Television Repair system",
      "television solution",
      "television service"
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
      "Build a television repair platform",
      "Create a television repair app",
      "I need a television repair management system",
      "Build a television repair solution",
      "Create a television repair booking system"
  ],
};
