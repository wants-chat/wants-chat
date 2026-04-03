/**
 * Valve Repair App Type Definition
 *
 * Complete definition for valve repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VALVE_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'valve-repair',
  name: 'Valve Repair',
  category: 'services',
  description: 'Valve Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "valve repair",
      "valve",
      "repair",
      "valve software",
      "valve app",
      "valve platform",
      "valve system",
      "valve management",
      "services valve"
  ],

  synonyms: [
      "Valve Repair platform",
      "Valve Repair software",
      "Valve Repair system",
      "valve solution",
      "valve service"
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
      "Build a valve repair platform",
      "Create a valve repair app",
      "I need a valve repair management system",
      "Build a valve repair solution",
      "Create a valve repair booking system"
  ],
};
