/**
 * River Cruise App Type Definition
 *
 * Complete definition for river cruise applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RIVER_CRUISE_APP_TYPE: AppTypeDefinition = {
  id: 'river-cruise',
  name: 'River Cruise',
  category: 'services',
  description: 'River Cruise platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "river cruise",
      "river",
      "cruise",
      "river software",
      "river app",
      "river platform",
      "river system",
      "river management",
      "services river"
  ],

  synonyms: [
      "River Cruise platform",
      "River Cruise software",
      "River Cruise system",
      "river solution",
      "river service"
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
      "Build a river cruise platform",
      "Create a river cruise app",
      "I need a river cruise management system",
      "Build a river cruise solution",
      "Create a river cruise booking system"
  ],
};
