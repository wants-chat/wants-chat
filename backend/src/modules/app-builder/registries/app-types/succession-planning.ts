/**
 * Succession Planning App Type Definition
 *
 * Complete definition for succession planning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SUCCESSION_PLANNING_APP_TYPE: AppTypeDefinition = {
  id: 'succession-planning',
  name: 'Succession Planning',
  category: 'services',
  description: 'Succession Planning platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "succession planning",
      "succession",
      "planning",
      "succession software",
      "succession app",
      "succession platform",
      "succession system",
      "succession management",
      "services succession"
  ],

  synonyms: [
      "Succession Planning platform",
      "Succession Planning software",
      "Succession Planning system",
      "succession solution",
      "succession service"
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
      "Build a succession planning platform",
      "Create a succession planning app",
      "I need a succession planning management system",
      "Build a succession planning solution",
      "Create a succession planning booking system"
  ],
};
