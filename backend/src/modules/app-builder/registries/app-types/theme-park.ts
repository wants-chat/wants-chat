/**
 * Theme Park App Type Definition
 *
 * Complete definition for theme park applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const THEME_PARK_APP_TYPE: AppTypeDefinition = {
  id: 'theme-park',
  name: 'Theme Park',
  category: 'services',
  description: 'Theme Park platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "theme park",
      "theme",
      "park",
      "theme software",
      "theme app",
      "theme platform",
      "theme system",
      "theme management",
      "services theme"
  ],

  synonyms: [
      "Theme Park platform",
      "Theme Park software",
      "Theme Park system",
      "theme solution",
      "theme service"
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
      "Build a theme park platform",
      "Create a theme park app",
      "I need a theme park management system",
      "Build a theme park solution",
      "Create a theme park booking system"
  ],
};
