/**
 * Top Soil App Type Definition
 *
 * Complete definition for top soil applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOP_SOIL_APP_TYPE: AppTypeDefinition = {
  id: 'top-soil',
  name: 'Top Soil',
  category: 'services',
  description: 'Top Soil platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "top soil",
      "top",
      "soil",
      "top software",
      "top app",
      "top platform",
      "top system",
      "top management",
      "services top"
  ],

  synonyms: [
      "Top Soil platform",
      "Top Soil software",
      "Top Soil system",
      "top solution",
      "top service"
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
      "Build a top soil platform",
      "Create a top soil app",
      "I need a top soil management system",
      "Build a top soil solution",
      "Create a top soil booking system"
  ],
};
