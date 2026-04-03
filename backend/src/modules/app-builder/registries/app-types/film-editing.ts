/**
 * Film Editing App Type Definition
 *
 * Complete definition for film editing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FILM_EDITING_APP_TYPE: AppTypeDefinition = {
  id: 'film-editing',
  name: 'Film Editing',
  category: 'services',
  description: 'Film Editing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "film editing",
      "film",
      "editing",
      "film software",
      "film app",
      "film platform",
      "film system",
      "film management",
      "services film"
  ],

  synonyms: [
      "Film Editing platform",
      "Film Editing software",
      "Film Editing system",
      "film solution",
      "film service"
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
      "Build a film editing platform",
      "Create a film editing app",
      "I need a film editing management system",
      "Build a film editing solution",
      "Create a film editing booking system"
  ],
};
