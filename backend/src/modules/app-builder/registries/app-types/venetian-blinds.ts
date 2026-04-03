/**
 * Venetian Blinds App Type Definition
 *
 * Complete definition for venetian blinds applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VENETIAN_BLINDS_APP_TYPE: AppTypeDefinition = {
  id: 'venetian-blinds',
  name: 'Venetian Blinds',
  category: 'services',
  description: 'Venetian Blinds platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "venetian blinds",
      "venetian",
      "blinds",
      "venetian software",
      "venetian app",
      "venetian platform",
      "venetian system",
      "venetian management",
      "services venetian"
  ],

  synonyms: [
      "Venetian Blinds platform",
      "Venetian Blinds software",
      "Venetian Blinds system",
      "venetian solution",
      "venetian service"
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
      "Build a venetian blinds platform",
      "Create a venetian blinds app",
      "I need a venetian blinds management system",
      "Build a venetian blinds solution",
      "Create a venetian blinds booking system"
  ],
};
