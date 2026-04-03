/**
 * Screen Repair App Type Definition
 *
 * Complete definition for screen repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SCREEN_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'screen-repair',
  name: 'Screen Repair',
  category: 'services',
  description: 'Screen Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "screen repair",
      "screen",
      "repair",
      "screen software",
      "screen app",
      "screen platform",
      "screen system",
      "screen management",
      "services screen"
  ],

  synonyms: [
      "Screen Repair platform",
      "Screen Repair software",
      "Screen Repair system",
      "screen solution",
      "screen service"
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
      "Build a screen repair platform",
      "Create a screen repair app",
      "I need a screen repair management system",
      "Build a screen repair solution",
      "Create a screen repair booking system"
  ],
};
