/**
 * Stand Up Comedy App Type Definition
 *
 * Complete definition for stand up comedy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STAND_UP_COMEDY_APP_TYPE: AppTypeDefinition = {
  id: 'stand-up-comedy',
  name: 'Stand Up Comedy',
  category: 'services',
  description: 'Stand Up Comedy platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "stand up comedy",
      "stand",
      "comedy",
      "stand software",
      "stand app",
      "stand platform",
      "stand system",
      "stand management",
      "services stand"
  ],

  synonyms: [
      "Stand Up Comedy platform",
      "Stand Up Comedy software",
      "Stand Up Comedy system",
      "stand solution",
      "stand service"
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
      "Build a stand up comedy platform",
      "Create a stand up comedy app",
      "I need a stand up comedy management system",
      "Build a stand up comedy solution",
      "Create a stand up comedy booking system"
  ],
};
