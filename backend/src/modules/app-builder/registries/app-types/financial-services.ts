/**
 * Financial Services App Type Definition
 *
 * Complete definition for financial services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FINANCIAL_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'financial-services',
  name: 'Financial Services',
  category: 'services',
  description: 'Financial Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "financial services",
      "financial",
      "services",
      "financial software",
      "financial app",
      "financial platform",
      "financial system",
      "financial management",
      "services financial"
  ],

  synonyms: [
      "Financial Services platform",
      "Financial Services software",
      "Financial Services system",
      "financial solution",
      "financial service"
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
      "Build a financial services platform",
      "Create a financial services app",
      "I need a financial services management system",
      "Build a financial services solution",
      "Create a financial services booking system"
  ],
};
