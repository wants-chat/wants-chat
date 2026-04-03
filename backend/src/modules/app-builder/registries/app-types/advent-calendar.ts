/**
 * Advent Calendar App Type Definition
 *
 * Complete definition for advent calendar applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ADVENT_CALENDAR_APP_TYPE: AppTypeDefinition = {
  id: 'advent-calendar',
  name: 'Advent Calendar',
  category: 'services',
  description: 'Advent Calendar platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "advent calendar",
      "advent",
      "calendar",
      "advent software",
      "advent app",
      "advent platform",
      "advent system",
      "advent management",
      "services advent"
  ],

  synonyms: [
      "Advent Calendar platform",
      "Advent Calendar software",
      "Advent Calendar system",
      "advent solution",
      "advent service"
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
      "Build a advent calendar platform",
      "Create a advent calendar app",
      "I need a advent calendar management system",
      "Build a advent calendar solution",
      "Create a advent calendar booking system"
  ],
};
