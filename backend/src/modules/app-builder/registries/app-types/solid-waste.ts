/**
 * Solid Waste App Type Definition
 *
 * Complete definition for solid waste applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOLID_WASTE_APP_TYPE: AppTypeDefinition = {
  id: 'solid-waste',
  name: 'Solid Waste',
  category: 'services',
  description: 'Solid Waste platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "solid waste",
      "solid",
      "waste",
      "solid software",
      "solid app",
      "solid platform",
      "solid system",
      "solid management",
      "services solid"
  ],

  synonyms: [
      "Solid Waste platform",
      "Solid Waste software",
      "Solid Waste system",
      "solid solution",
      "solid service"
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
      "Build a solid waste platform",
      "Create a solid waste app",
      "I need a solid waste management system",
      "Build a solid waste solution",
      "Create a solid waste booking system"
  ],
};
