/**
 * Suspension Repair App Type Definition
 *
 * Complete definition for suspension repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SUSPENSION_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'suspension-repair',
  name: 'Suspension Repair',
  category: 'services',
  description: 'Suspension Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "suspension repair",
      "suspension",
      "repair",
      "suspension software",
      "suspension app",
      "suspension platform",
      "suspension system",
      "suspension management",
      "services suspension"
  ],

  synonyms: [
      "Suspension Repair platform",
      "Suspension Repair software",
      "Suspension Repair system",
      "suspension solution",
      "suspension service"
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
      "Build a suspension repair platform",
      "Create a suspension repair app",
      "I need a suspension repair management system",
      "Build a suspension repair solution",
      "Create a suspension repair booking system"
  ],
};
