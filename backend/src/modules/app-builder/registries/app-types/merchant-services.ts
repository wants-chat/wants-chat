/**
 * Merchant Services App Type Definition
 *
 * Complete definition for merchant services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MERCHANT_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'merchant-services',
  name: 'Merchant Services',
  category: 'services',
  description: 'Merchant Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "merchant services",
      "merchant",
      "services",
      "merchant software",
      "merchant app",
      "merchant platform",
      "merchant system",
      "merchant management",
      "services merchant"
  ],

  synonyms: [
      "Merchant Services platform",
      "Merchant Services software",
      "Merchant Services system",
      "merchant solution",
      "merchant service"
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
      "Build a merchant services platform",
      "Create a merchant services app",
      "I need a merchant services management system",
      "Build a merchant services solution",
      "Create a merchant services booking system"
  ],
};
