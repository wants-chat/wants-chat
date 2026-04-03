/**
 * Swing Dance App Type Definition
 *
 * Complete definition for swing dance applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SWING_DANCE_APP_TYPE: AppTypeDefinition = {
  id: 'swing-dance',
  name: 'Swing Dance',
  category: 'services',
  description: 'Swing Dance platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "swing dance",
      "swing",
      "dance",
      "swing software",
      "swing app",
      "swing platform",
      "swing system",
      "swing management",
      "services swing"
  ],

  synonyms: [
      "Swing Dance platform",
      "Swing Dance software",
      "Swing Dance system",
      "swing solution",
      "swing service"
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
      "Build a swing dance platform",
      "Create a swing dance app",
      "I need a swing dance management system",
      "Build a swing dance solution",
      "Create a swing dance booking system"
  ],
};
