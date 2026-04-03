/**
 * Well Pump App Type Definition
 *
 * Complete definition for well pump applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WELL_PUMP_APP_TYPE: AppTypeDefinition = {
  id: 'well-pump',
  name: 'Well Pump',
  category: 'services',
  description: 'Well Pump platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "well pump",
      "well",
      "pump",
      "well software",
      "well app",
      "well platform",
      "well system",
      "well management",
      "services well"
  ],

  synonyms: [
      "Well Pump platform",
      "Well Pump software",
      "Well Pump system",
      "well solution",
      "well service"
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
      "Build a well pump platform",
      "Create a well pump app",
      "I need a well pump management system",
      "Build a well pump solution",
      "Create a well pump booking system"
  ],
};
