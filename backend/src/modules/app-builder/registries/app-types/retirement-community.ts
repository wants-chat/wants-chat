/**
 * Retirement Community App Type Definition
 *
 * Complete definition for retirement community applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RETIREMENT_COMMUNITY_APP_TYPE: AppTypeDefinition = {
  id: 'retirement-community',
  name: 'Retirement Community',
  category: 'community',
  description: 'Retirement Community platform with comprehensive management features',
  icon: 'users',

  keywords: [
      "retirement community",
      "retirement",
      "community",
      "retirement software",
      "retirement app",
      "retirement platform",
      "retirement system",
      "retirement management",
      "community retirement"
  ],

  synonyms: [
      "Retirement Community platform",
      "Retirement Community software",
      "Retirement Community system",
      "retirement solution",
      "retirement service"
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
      "announcements",
      "calendar",
      "messaging",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "blog",
      "gallery",
      "feedback",
      "documents"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'medium',
  industry: 'community',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
      "Build a retirement community platform",
      "Create a retirement community app",
      "I need a retirement community management system",
      "Build a retirement community solution",
      "Create a retirement community booking system"
  ],
};
