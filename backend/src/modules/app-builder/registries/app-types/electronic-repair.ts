/**
 * Electronic Repair App Type Definition
 *
 * Complete definition for electronic repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ELECTRONIC_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'electronic-repair',
  name: 'Electronic Repair',
  category: 'services',
  description: 'Electronic Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "electronic repair",
      "electronic",
      "repair",
      "electronic software",
      "electronic app",
      "electronic platform",
      "electronic system",
      "electronic management",
      "services electronic"
  ],

  synonyms: [
      "Electronic Repair platform",
      "Electronic Repair software",
      "Electronic Repair system",
      "electronic solution",
      "electronic service"
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
      "Build a electronic repair platform",
      "Create a electronic repair app",
      "I need a electronic repair management system",
      "Build a electronic repair solution",
      "Create a electronic repair booking system"
  ],
};
