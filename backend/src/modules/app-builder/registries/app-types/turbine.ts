/**
 * Turbine App Type Definition
 *
 * Complete definition for turbine applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TURBINE_APP_TYPE: AppTypeDefinition = {
  id: 'turbine',
  name: 'Turbine',
  category: 'services',
  description: 'Turbine platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "turbine",
      "turbine software",
      "turbine app",
      "turbine platform",
      "turbine system",
      "turbine management",
      "services turbine"
  ],

  synonyms: [
      "Turbine platform",
      "Turbine software",
      "Turbine system",
      "turbine solution",
      "turbine service"
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
      "Build a turbine platform",
      "Create a turbine app",
      "I need a turbine management system",
      "Build a turbine solution",
      "Create a turbine booking system"
  ],
};
