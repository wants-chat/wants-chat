/**
 * Credit Repair App Type Definition
 *
 * Complete definition for credit repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CREDIT_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'credit-repair',
  name: 'Credit Repair',
  category: 'services',
  description: 'Credit Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "credit repair",
      "credit",
      "repair",
      "credit software",
      "credit app",
      "credit platform",
      "credit system",
      "credit management",
      "services credit"
  ],

  synonyms: [
      "Credit Repair platform",
      "Credit Repair software",
      "Credit Repair system",
      "credit solution",
      "credit service"
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
      "Build a credit repair platform",
      "Create a credit repair app",
      "I need a credit repair management system",
      "Build a credit repair solution",
      "Create a credit repair booking system"
  ],
};
