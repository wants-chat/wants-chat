/**
 * Automotive Parts App Type Definition
 *
 * Complete definition for automotive parts applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUTOMOTIVE_PARTS_APP_TYPE: AppTypeDefinition = {
  id: 'automotive-parts',
  name: 'Automotive Parts',
  category: 'automotive',
  description: 'Automotive Parts platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "automotive parts",
      "automotive",
      "parts",
      "automotive software",
      "automotive app",
      "automotive platform",
      "automotive system",
      "automotive management",
      "automotive automotive"
  ],

  synonyms: [
      "Automotive Parts platform",
      "Automotive Parts software",
      "Automotive Parts system",
      "automotive solution",
      "automotive service"
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
      "Build a automotive parts platform",
      "Create a automotive parts app",
      "I need a automotive parts management system",
      "Build a automotive parts solution",
      "Create a automotive parts booking system"
  ],
};
