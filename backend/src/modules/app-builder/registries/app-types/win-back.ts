/**
 * Win Back App Type Definition
 *
 * Complete definition for win back applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WIN_BACK_APP_TYPE: AppTypeDefinition = {
  id: 'win-back',
  name: 'Win Back',
  category: 'services',
  description: 'Win Back platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "win back",
      "win",
      "back",
      "win software",
      "win app",
      "win platform",
      "win system",
      "win management",
      "services win"
  ],

  synonyms: [
      "Win Back platform",
      "Win Back software",
      "Win Back system",
      "win solution",
      "win service"
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
      "Build a win back platform",
      "Create a win back app",
      "I need a win back management system",
      "Build a win back solution",
      "Create a win back booking system"
  ],
};
