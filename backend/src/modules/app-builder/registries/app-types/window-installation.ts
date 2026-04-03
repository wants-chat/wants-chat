/**
 * Window Installation App Type Definition
 *
 * Complete definition for window installation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WINDOW_INSTALLATION_APP_TYPE: AppTypeDefinition = {
  id: 'window-installation',
  name: 'Window Installation',
  category: 'services',
  description: 'Window Installation platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "window installation",
      "window",
      "installation",
      "window software",
      "window app",
      "window platform",
      "window system",
      "window management",
      "services window"
  ],

  synonyms: [
      "Window Installation platform",
      "Window Installation software",
      "Window Installation system",
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
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "clients",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a window installation platform",
      "Create a window installation app",
      "I need a window installation management system",
      "Build a window installation solution",
      "Create a window installation booking system"
  ],
};
