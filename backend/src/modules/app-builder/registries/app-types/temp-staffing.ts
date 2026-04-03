/**
 * Temp Staffing App Type Definition
 *
 * Complete definition for temp staffing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TEMP_STAFFING_APP_TYPE: AppTypeDefinition = {
  id: 'temp-staffing',
  name: 'Temp Staffing',
  category: 'services',
  description: 'Temp Staffing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "temp staffing",
      "temp",
      "staffing",
      "temp software",
      "temp app",
      "temp platform",
      "temp system",
      "temp management",
      "services temp"
  ],

  synonyms: [
      "Temp Staffing platform",
      "Temp Staffing software",
      "Temp Staffing system",
      "temp solution",
      "temp service"
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
      "Build a temp staffing platform",
      "Create a temp staffing app",
      "I need a temp staffing management system",
      "Build a temp staffing solution",
      "Create a temp staffing booking system"
  ],
};
