/**
 * Race Track App Type Definition
 *
 * Complete definition for race track applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RACE_TRACK_APP_TYPE: AppTypeDefinition = {
  id: 'race-track',
  name: 'Race Track',
  category: 'services',
  description: 'Race Track platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "race track",
      "race",
      "track",
      "race software",
      "race app",
      "race platform",
      "race system",
      "race management",
      "services race"
  ],

  synonyms: [
      "Race Track platform",
      "Race Track software",
      "Race Track system",
      "race solution",
      "race service"
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
      "Build a race track platform",
      "Create a race track app",
      "I need a race track management system",
      "Build a race track solution",
      "Create a race track booking system"
  ],
};
