/**
 * Automotive Engineering App Type Definition
 *
 * Complete definition for automotive engineering applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUTOMOTIVE_ENGINEERING_APP_TYPE: AppTypeDefinition = {
  id: 'automotive-engineering',
  name: 'Automotive Engineering',
  category: 'automotive',
  description: 'Automotive Engineering platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "automotive engineering",
      "automotive",
      "engineering",
      "automotive software",
      "automotive app",
      "automotive platform",
      "automotive system",
      "automotive management",
      "automotive automotive"
  ],

  synonyms: [
      "Automotive Engineering platform",
      "Automotive Engineering software",
      "Automotive Engineering system",
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
      "Build a automotive engineering platform",
      "Create a automotive engineering app",
      "I need a automotive engineering management system",
      "Build a automotive engineering solution",
      "Create a automotive engineering booking system"
  ],
};
