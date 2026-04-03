/**
 * Cell Phone Repair App Type Definition
 *
 * Complete definition for cell phone repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CELL_PHONE_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'cell-phone-repair',
  name: 'Cell Phone Repair',
  category: 'services',
  description: 'Cell Phone Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "cell phone repair",
      "cell",
      "phone",
      "repair",
      "cell software",
      "cell app",
      "cell platform",
      "cell system",
      "cell management",
      "services cell"
  ],

  synonyms: [
      "Cell Phone Repair platform",
      "Cell Phone Repair software",
      "Cell Phone Repair system",
      "cell solution",
      "cell service"
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
      "Build a cell phone repair platform",
      "Create a cell phone repair app",
      "I need a cell phone repair management system",
      "Build a cell phone repair solution",
      "Create a cell phone repair booking system"
  ],
};
