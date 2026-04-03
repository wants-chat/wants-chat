/**
 * Window Treatment App Type Definition
 *
 * Complete definition for window treatment applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WINDOW_TREATMENT_APP_TYPE: AppTypeDefinition = {
  id: 'window-treatment',
  name: 'Window Treatment',
  category: 'services',
  description: 'Window Treatment platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "window treatment",
      "window",
      "treatment",
      "window software",
      "window app",
      "window platform",
      "window system",
      "window management",
      "services window"
  ],

  synonyms: [
      "Window Treatment platform",
      "Window Treatment software",
      "Window Treatment system",
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
      "Build a window treatment platform",
      "Create a window treatment app",
      "I need a window treatment management system",
      "Build a window treatment solution",
      "Create a window treatment booking system"
  ],
};
