/**
 * Automotive Services App Type Definition
 *
 * Complete definition for automotive services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUTOMOTIVE_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'automotive-services',
  name: 'Automotive Services',
  category: 'automotive',
  description: 'Automotive Services platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "automotive services",
      "automotive",
      "services",
      "automotive software",
      "automotive app",
      "automotive platform",
      "automotive system",
      "automotive management",
      "automotive automotive"
  ],

  synonyms: [
      "Automotive Services platform",
      "Automotive Services software",
      "Automotive Services system",
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
      "Build a automotive services platform",
      "Create a automotive services app",
      "I need a automotive services management system",
      "Build a automotive services solution",
      "Create a automotive services booking system"
  ],
};
