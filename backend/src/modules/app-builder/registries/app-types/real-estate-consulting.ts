/**
 * Real Estate Consulting App Type Definition
 *
 * Complete definition for real estate consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REAL_ESTATE_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'real-estate-consulting',
  name: 'Real Estate Consulting',
  category: 'professional-services',
  description: 'Real Estate Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "real estate consulting",
      "real",
      "estate",
      "consulting",
      "real software",
      "real app",
      "real platform",
      "real system",
      "real management",
      "consulting real"
  ],

  synonyms: [
      "Real Estate Consulting platform",
      "Real Estate Consulting software",
      "Real Estate Consulting system",
      "real solution",
      "real service"
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
      "Build a real estate consulting platform",
      "Create a real estate consulting app",
      "I need a real estate consulting management system",
      "Build a real estate consulting solution",
      "Create a real estate consulting booking system"
  ],
};
