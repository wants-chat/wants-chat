/**
 * Financial Consulting App Type Definition
 *
 * Complete definition for financial consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FINANCIAL_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'financial-consulting',
  name: 'Financial Consulting',
  category: 'professional-services',
  description: 'Financial Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "financial consulting",
      "financial",
      "consulting",
      "financial software",
      "financial app",
      "financial platform",
      "financial system",
      "financial management",
      "consulting financial"
  ],

  synonyms: [
      "Financial Consulting platform",
      "Financial Consulting software",
      "Financial Consulting system",
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
      "clients",
      "projects",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "invoicing",
      "contracts",
      "documents",
      "time-tracking",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'consulting',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a financial consulting platform",
      "Create a financial consulting app",
      "I need a financial consulting management system",
      "Build a financial consulting solution",
      "Create a financial consulting booking system"
  ],
};
