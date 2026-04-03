/**
 * Jewelry Repair App Type Definition
 *
 * Complete definition for jewelry repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const JEWELRY_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'jewelry-repair',
  name: 'Jewelry Repair',
  category: 'services',
  description: 'Jewelry Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "jewelry repair",
      "jewelry",
      "repair",
      "jewelry software",
      "jewelry app",
      "jewelry platform",
      "jewelry system",
      "jewelry management",
      "services jewelry"
  ],

  synonyms: [
      "Jewelry Repair platform",
      "Jewelry Repair software",
      "Jewelry Repair system",
      "jewelry solution",
      "jewelry service"
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
      "Build a jewelry repair platform",
      "Create a jewelry repair app",
      "I need a jewelry repair management system",
      "Build a jewelry repair solution",
      "Create a jewelry repair booking system"
  ],
};
