/**
 * Sign Painting App Type Definition
 *
 * Complete definition for sign painting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SIGN_PAINTING_APP_TYPE: AppTypeDefinition = {
  id: 'sign-painting',
  name: 'Sign Painting',
  category: 'construction',
  description: 'Sign Painting platform with comprehensive management features',
  icon: 'hammer',

  keywords: [
      "sign painting",
      "sign",
      "painting",
      "sign software",
      "sign app",
      "sign platform",
      "sign system",
      "sign management",
      "construction sign"
  ],

  synonyms: [
      "Sign Painting platform",
      "Sign Painting software",
      "Sign Painting system",
      "sign solution",
      "sign service"
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
      "projects",
      "project-bids",
      "daily-logs",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "subcontractor-mgmt",
      "material-takeoffs",
      "invoicing",
      "documents",
      "site-safety"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'construction',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
      "Build a sign painting platform",
      "Create a sign painting app",
      "I need a sign painting management system",
      "Build a sign painting solution",
      "Create a sign painting booking system"
  ],
};
