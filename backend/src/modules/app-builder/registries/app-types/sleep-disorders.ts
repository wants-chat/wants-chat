/**
 * Sleep Disorders App Type Definition
 *
 * Complete definition for sleep disorders applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SLEEP_DISORDERS_APP_TYPE: AppTypeDefinition = {
  id: 'sleep-disorders',
  name: 'Sleep Disorders',
  category: 'services',
  description: 'Sleep Disorders platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "sleep disorders",
      "sleep",
      "disorders",
      "sleep software",
      "sleep app",
      "sleep platform",
      "sleep system",
      "sleep management",
      "services sleep"
  ],

  synonyms: [
      "Sleep Disorders platform",
      "Sleep Disorders software",
      "Sleep Disorders system",
      "sleep solution",
      "sleep service"
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
      "Build a sleep disorders platform",
      "Create a sleep disorders app",
      "I need a sleep disorders management system",
      "Build a sleep disorders solution",
      "Create a sleep disorders booking system"
  ],
};
