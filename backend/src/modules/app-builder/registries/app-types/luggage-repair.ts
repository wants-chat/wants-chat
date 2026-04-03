/**
 * Luggage Repair App Type Definition
 *
 * Complete definition for luggage repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LUGGAGE_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'luggage-repair',
  name: 'Luggage Repair',
  category: 'services',
  description: 'Luggage Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "luggage repair",
      "luggage",
      "repair",
      "luggage software",
      "luggage app",
      "luggage platform",
      "luggage system",
      "luggage management",
      "services luggage"
  ],

  synonyms: [
      "Luggage Repair platform",
      "Luggage Repair software",
      "Luggage Repair system",
      "luggage solution",
      "luggage service"
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
      "Build a luggage repair platform",
      "Create a luggage repair app",
      "I need a luggage repair management system",
      "Build a luggage repair solution",
      "Create a luggage repair booking system"
  ],
};
