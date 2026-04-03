/**
 * Agricultural Consulting App Type Definition
 *
 * Complete definition for agricultural consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AGRICULTURAL_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'agricultural-consulting',
  name: 'Agricultural Consulting',
  category: 'professional-services',
  description: 'Agricultural Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "agricultural consulting",
      "agricultural",
      "consulting",
      "agricultural software",
      "agricultural app",
      "agricultural platform",
      "agricultural system",
      "agricultural management",
      "consulting agricultural"
  ],

  synonyms: [
      "Agricultural Consulting platform",
      "Agricultural Consulting software",
      "Agricultural Consulting system",
      "agricultural solution",
      "agricultural service"
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
      "Build a agricultural consulting platform",
      "Create a agricultural consulting app",
      "I need a agricultural consulting management system",
      "Build a agricultural consulting solution",
      "Create a agricultural consulting booking system"
  ],
};
