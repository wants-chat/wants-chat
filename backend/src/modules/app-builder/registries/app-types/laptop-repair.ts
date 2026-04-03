/**
 * Laptop Repair App Type Definition
 *
 * Complete definition for laptop repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LAPTOP_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'laptop-repair',
  name: 'Laptop Repair',
  category: 'services',
  description: 'Laptop Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "laptop repair",
      "laptop",
      "repair",
      "laptop software",
      "laptop app",
      "laptop platform",
      "laptop system",
      "laptop management",
      "services laptop"
  ],

  synonyms: [
      "Laptop Repair platform",
      "Laptop Repair software",
      "Laptop Repair system",
      "laptop solution",
      "laptop service"
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
      "Build a laptop repair platform",
      "Create a laptop repair app",
      "I need a laptop repair management system",
      "Build a laptop repair solution",
      "Create a laptop repair booking system"
  ],
};
