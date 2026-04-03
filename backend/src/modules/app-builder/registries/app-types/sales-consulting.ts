/**
 * Sales Consulting App Type Definition
 *
 * Complete definition for sales consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SALES_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'sales-consulting',
  name: 'Sales Consulting',
  category: 'professional-services',
  description: 'Sales Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "sales consulting",
      "sales",
      "consulting",
      "sales software",
      "sales app",
      "sales platform",
      "sales system",
      "sales management",
      "consulting sales"
  ],

  synonyms: [
      "Sales Consulting platform",
      "Sales Consulting software",
      "Sales Consulting system",
      "sales solution",
      "sales service"
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
      "Build a sales consulting platform",
      "Create a sales consulting app",
      "I need a sales consulting management system",
      "Build a sales consulting solution",
      "Create a sales consulting booking system"
  ],
};
