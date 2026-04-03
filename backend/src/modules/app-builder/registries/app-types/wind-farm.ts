/**
 * Wind Farm App Type Definition
 *
 * Complete definition for wind farm applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WIND_FARM_APP_TYPE: AppTypeDefinition = {
  id: 'wind-farm',
  name: 'Wind Farm',
  category: 'services',
  description: 'Wind Farm platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wind farm",
      "wind",
      "farm",
      "wind software",
      "wind app",
      "wind platform",
      "wind system",
      "wind management",
      "services wind"
  ],

  synonyms: [
      "Wind Farm platform",
      "Wind Farm software",
      "Wind Farm system",
      "wind solution",
      "wind service"
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
      "Build a wind farm platform",
      "Create a wind farm app",
      "I need a wind farm management system",
      "Build a wind farm solution",
      "Create a wind farm booking system"
  ],
};
