/**
 * Youth Theater App Type Definition
 *
 * Complete definition for youth theater applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YOUTH_THEATER_APP_TYPE: AppTypeDefinition = {
  id: 'youth-theater',
  name: 'Youth Theater',
  category: 'entertainment',
  description: 'Youth Theater platform with comprehensive management features',
  icon: 'theater',

  keywords: [
      "youth theater",
      "youth",
      "theater",
      "youth software",
      "youth app",
      "youth platform",
      "youth system",
      "youth management",
      "entertainment youth"
  ],

  synonyms: [
      "Youth Theater platform",
      "Youth Theater software",
      "Youth Theater system",
      "youth solution",
      "youth service"
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
      "Build a youth theater platform",
      "Create a youth theater app",
      "I need a youth theater management system",
      "Build a youth theater solution",
      "Create a youth theater booking system"
  ],
};
