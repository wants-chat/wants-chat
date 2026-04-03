/**
 * Track And Field App Type Definition
 *
 * Complete definition for track and field applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRACK_AND_FIELD_APP_TYPE: AppTypeDefinition = {
  id: 'track-and-field',
  name: 'Track And Field',
  category: 'services',
  description: 'Track And Field platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "track and field",
      "track",
      "and",
      "field",
      "track software",
      "track app",
      "track platform",
      "track system",
      "track management",
      "services track"
  ],

  synonyms: [
      "Track And Field platform",
      "Track And Field software",
      "Track And Field system",
      "track solution",
      "track service"
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
      "Build a track and field platform",
      "Create a track and field app",
      "I need a track and field management system",
      "Build a track and field solution",
      "Create a track and field booking system"
  ],
};
