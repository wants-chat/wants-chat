/**
 * Dance Club App Type Definition
 *
 * Complete definition for dance club applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DANCE_CLUB_APP_TYPE: AppTypeDefinition = {
  id: 'dance-club',
  name: 'Dance Club',
  category: 'services',
  description: 'Dance Club platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "dance club",
      "dance",
      "club",
      "dance software",
      "dance app",
      "dance platform",
      "dance system",
      "dance management",
      "services dance"
  ],

  synonyms: [
      "Dance Club platform",
      "Dance Club software",
      "Dance Club system",
      "dance solution",
      "dance service"
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
      "Build a dance club platform",
      "Create a dance club app",
      "I need a dance club management system",
      "Build a dance club solution",
      "Create a dance club booking system"
  ],
};
