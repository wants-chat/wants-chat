/**
 * Automotive Marketing App Type Definition
 *
 * Complete definition for automotive marketing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUTOMOTIVE_MARKETING_APP_TYPE: AppTypeDefinition = {
  id: 'automotive-marketing',
  name: 'Automotive Marketing',
  category: 'automotive',
  description: 'Automotive Marketing platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "automotive marketing",
      "automotive",
      "marketing",
      "automotive software",
      "automotive app",
      "automotive platform",
      "automotive system",
      "automotive management",
      "automotive automotive"
  ],

  synonyms: [
      "Automotive Marketing platform",
      "Automotive Marketing software",
      "Automotive Marketing system",
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
      "Build a automotive marketing platform",
      "Create a automotive marketing app",
      "I need a automotive marketing management system",
      "Build a automotive marketing solution",
      "Create a automotive marketing booking system"
  ],
};
