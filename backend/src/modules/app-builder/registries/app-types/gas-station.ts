/**
 * Gas Station App Type Definition
 *
 * Complete definition for gas station applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GAS_STATION_APP_TYPE: AppTypeDefinition = {
  id: 'gas-station',
  name: 'Gas Station',
  category: 'services',
  description: 'Gas Station platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "gas station",
      "gas",
      "station",
      "gas software",
      "gas app",
      "gas platform",
      "gas system",
      "gas management",
      "services gas"
  ],

  synonyms: [
      "Gas Station platform",
      "Gas Station software",
      "Gas Station system",
      "gas solution",
      "gas service"
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
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a gas station platform",
      "Create a gas station app",
      "I need a gas station management system",
      "Build a gas station solution",
      "Create a gas station booking system"
  ],
};
