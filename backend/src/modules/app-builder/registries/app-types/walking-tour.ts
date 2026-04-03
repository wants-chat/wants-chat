/**
 * Walking Tour App Type Definition
 *
 * Complete definition for walking tour applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WALKING_TOUR_APP_TYPE: AppTypeDefinition = {
  id: 'walking-tour',
  name: 'Walking Tour',
  category: 'services',
  description: 'Walking Tour platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "walking tour",
      "walking",
      "tour",
      "walking software",
      "walking app",
      "walking platform",
      "walking system",
      "walking management",
      "services walking"
  ],

  synonyms: [
      "Walking Tour platform",
      "Walking Tour software",
      "Walking Tour system",
      "walking solution",
      "walking service"
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
      "Build a walking tour platform",
      "Create a walking tour app",
      "I need a walking tour management system",
      "Build a walking tour solution",
      "Create a walking tour booking system"
  ],
};
