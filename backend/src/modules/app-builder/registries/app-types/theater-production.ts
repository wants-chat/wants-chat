/**
 * Theater Production App Type Definition
 *
 * Complete definition for theater production applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const THEATER_PRODUCTION_APP_TYPE: AppTypeDefinition = {
  id: 'theater-production',
  name: 'Theater Production',
  category: 'entertainment',
  description: 'Theater Production platform with comprehensive management features',
  icon: 'theater',

  keywords: [
      "theater production",
      "theater",
      "production",
      "theater software",
      "theater app",
      "theater platform",
      "theater system",
      "theater management",
      "entertainment theater"
  ],

  synonyms: [
      "Theater Production platform",
      "Theater Production software",
      "Theater Production system",
      "theater solution",
      "theater service"
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
      "ticket-sales",
      "show-scheduling",
      "seating-charts",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "season-passes",
      "payments",
      "reviews",
      "gallery",
      "box-office"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'dramatic',

  examplePrompts: [
      "Build a theater production platform",
      "Create a theater production app",
      "I need a theater production management system",
      "Build a theater production solution",
      "Create a theater production booking system"
  ],
};
