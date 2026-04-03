/**
 * Smartphone Repair App Type Definition
 *
 * Complete definition for smartphone repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SMARTPHONE_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'smartphone-repair',
  name: 'Smartphone Repair',
  category: 'services',
  description: 'Smartphone Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "smartphone repair",
      "smartphone",
      "repair",
      "smartphone software",
      "smartphone app",
      "smartphone platform",
      "smartphone system",
      "smartphone management",
      "services smartphone"
  ],

  synonyms: [
      "Smartphone Repair platform",
      "Smartphone Repair software",
      "Smartphone Repair system",
      "smartphone solution",
      "smartphone service"
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
      "Build a smartphone repair platform",
      "Create a smartphone repair app",
      "I need a smartphone repair management system",
      "Build a smartphone repair solution",
      "Create a smartphone repair booking system"
  ],
};
