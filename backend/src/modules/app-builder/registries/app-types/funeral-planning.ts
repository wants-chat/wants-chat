/**
 * Funeral Planning App Type Definition
 *
 * Complete definition for funeral planning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FUNERAL_PLANNING_APP_TYPE: AppTypeDefinition = {
  id: 'funeral-planning',
  name: 'Funeral Planning',
  category: 'services',
  description: 'Funeral Planning platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "funeral planning",
      "funeral",
      "planning",
      "funeral software",
      "funeral app",
      "funeral platform",
      "funeral system",
      "funeral management",
      "services funeral"
  ],

  synonyms: [
      "Funeral Planning platform",
      "Funeral Planning software",
      "Funeral Planning system",
      "funeral solution",
      "funeral service"
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
      "Build a funeral planning platform",
      "Create a funeral planning app",
      "I need a funeral planning management system",
      "Build a funeral planning solution",
      "Create a funeral planning booking system"
  ],
};
