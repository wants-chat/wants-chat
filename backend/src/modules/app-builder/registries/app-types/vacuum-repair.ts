/**
 * Vacuum Repair App Type Definition
 *
 * Complete definition for vacuum repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VACUUM_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'vacuum-repair',
  name: 'Vacuum Repair',
  category: 'services',
  description: 'Vacuum Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "vacuum repair",
      "vacuum",
      "repair",
      "vacuum software",
      "vacuum app",
      "vacuum platform",
      "vacuum system",
      "vacuum management",
      "services vacuum"
  ],

  synonyms: [
      "Vacuum Repair platform",
      "Vacuum Repair software",
      "Vacuum Repair system",
      "vacuum solution",
      "vacuum service"
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
      "Build a vacuum repair platform",
      "Create a vacuum repair app",
      "I need a vacuum repair management system",
      "Build a vacuum repair solution",
      "Create a vacuum repair booking system"
  ],
};
