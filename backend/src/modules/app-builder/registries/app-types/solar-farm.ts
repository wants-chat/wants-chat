/**
 * Solar Farm App Type Definition
 *
 * Complete definition for solar farm applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOLAR_FARM_APP_TYPE: AppTypeDefinition = {
  id: 'solar-farm',
  name: 'Solar Farm',
  category: 'services',
  description: 'Solar Farm platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "solar farm",
      "solar",
      "farm",
      "solar software",
      "solar app",
      "solar platform",
      "solar system",
      "solar management",
      "services solar"
  ],

  synonyms: [
      "Solar Farm platform",
      "Solar Farm software",
      "Solar Farm system",
      "solar solution",
      "solar service"
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
      "Build a solar farm platform",
      "Create a solar farm app",
      "I need a solar farm management system",
      "Build a solar farm solution",
      "Create a solar farm booking system"
  ],
};
