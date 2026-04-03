/**
 * Transmission Repair App Type Definition
 *
 * Complete definition for transmission repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRANSMISSION_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'transmission-repair',
  name: 'Transmission Repair',
  category: 'services',
  description: 'Transmission Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "transmission repair",
      "transmission",
      "repair",
      "transmission software",
      "transmission app",
      "transmission platform",
      "transmission system",
      "transmission management",
      "services transmission"
  ],

  synonyms: [
      "Transmission Repair platform",
      "Transmission Repair software",
      "Transmission Repair system",
      "transmission solution",
      "transmission service"
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
      "Build a transmission repair platform",
      "Create a transmission repair app",
      "I need a transmission repair management system",
      "Build a transmission repair solution",
      "Create a transmission repair booking system"
  ],
};
