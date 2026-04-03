/**
 * Window Replacement App Type Definition
 *
 * Complete definition for window replacement applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WINDOW_REPLACEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'window-replacement',
  name: 'Window Replacement',
  category: 'services',
  description: 'Window Replacement platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "window replacement",
      "window",
      "replacement",
      "window software",
      "window app",
      "window platform",
      "window system",
      "window management",
      "services window"
  ],

  synonyms: [
      "Window Replacement platform",
      "Window Replacement software",
      "Window Replacement system",
      "window solution",
      "window service"
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
      "Build a window replacement platform",
      "Create a window replacement app",
      "I need a window replacement management system",
      "Build a window replacement solution",
      "Create a window replacement booking system"
  ],
};
