/**
 * Retirement Planning App Type Definition
 *
 * Complete definition for retirement planning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RETIREMENT_PLANNING_APP_TYPE: AppTypeDefinition = {
  id: 'retirement-planning',
  name: 'Retirement Planning',
  category: 'automotive',
  description: 'Retirement Planning platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "retirement planning",
      "retirement",
      "planning",
      "retirement software",
      "retirement app",
      "retirement platform",
      "retirement system",
      "retirement management",
      "automotive retirement"
  ],

  synonyms: [
      "Retirement Planning platform",
      "Retirement Planning software",
      "Retirement Planning system",
      "retirement solution",
      "retirement service"
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
      "vehicle-inventory",
      "appointments",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "service-scheduling",
      "parts-catalog",
      "invoicing",
      "payments",
      "reviews"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'automotive',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
      "Build a retirement planning platform",
      "Create a retirement planning app",
      "I need a retirement planning management system",
      "Build a retirement planning solution",
      "Create a retirement planning booking system"
  ],
};
