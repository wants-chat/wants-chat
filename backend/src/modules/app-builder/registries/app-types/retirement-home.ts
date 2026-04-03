/**
 * Retirement Home App Type Definition
 *
 * Complete definition for retirement home applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RETIREMENT_HOME_APP_TYPE: AppTypeDefinition = {
  id: 'retirement-home',
  name: 'Retirement Home',
  category: 'automotive',
  description: 'Retirement Home platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "retirement home",
      "retirement",
      "home",
      "retirement software",
      "retirement app",
      "retirement platform",
      "retirement system",
      "retirement management",
      "automotive retirement"
  ],

  synonyms: [
      "Retirement Home platform",
      "Retirement Home software",
      "Retirement Home system",
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
      "Build a retirement home platform",
      "Create a retirement home app",
      "I need a retirement home management system",
      "Build a retirement home solution",
      "Create a retirement home booking system"
  ],
};
