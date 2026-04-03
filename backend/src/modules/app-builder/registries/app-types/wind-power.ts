/**
 * Wind Power App Type Definition
 *
 * Complete definition for wind power applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WIND_POWER_APP_TYPE: AppTypeDefinition = {
  id: 'wind-power',
  name: 'Wind Power',
  category: 'services',
  description: 'Wind Power platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wind power",
      "wind",
      "power",
      "wind software",
      "wind app",
      "wind platform",
      "wind system",
      "wind management",
      "services wind"
  ],

  synonyms: [
      "Wind Power platform",
      "Wind Power software",
      "Wind Power system",
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
      "Build a wind power platform",
      "Create a wind power app",
      "I need a wind power management system",
      "Build a wind power solution",
      "Create a wind power booking system"
  ],
};
