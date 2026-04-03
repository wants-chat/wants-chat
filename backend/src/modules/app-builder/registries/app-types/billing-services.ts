/**
 * Billing Services App Type Definition
 *
 * Complete definition for billing services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BILLING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'billing-services',
  name: 'Billing Services',
  category: 'services',
  description: 'Billing Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "billing services",
      "billing",
      "services",
      "billing software",
      "billing app",
      "billing platform",
      "billing system",
      "billing management",
      "services billing"
  ],

  synonyms: [
      "Billing Services platform",
      "Billing Services software",
      "Billing Services system",
      "billing solution",
      "billing service"
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
      "Build a billing services platform",
      "Create a billing services app",
      "I need a billing services management system",
      "Build a billing services solution",
      "Create a billing services booking system"
  ],
};
