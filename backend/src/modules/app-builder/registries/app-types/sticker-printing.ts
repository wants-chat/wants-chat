/**
 * Sticker Printing App Type Definition
 *
 * Complete definition for sticker printing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STICKER_PRINTING_APP_TYPE: AppTypeDefinition = {
  id: 'sticker-printing',
  name: 'Sticker Printing',
  category: 'services',
  description: 'Sticker Printing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "sticker printing",
      "sticker",
      "printing",
      "sticker software",
      "sticker app",
      "sticker platform",
      "sticker system",
      "sticker management",
      "services sticker"
  ],

  synonyms: [
      "Sticker Printing platform",
      "Sticker Printing software",
      "Sticker Printing system",
      "sticker solution",
      "sticker service"
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
      "Build a sticker printing platform",
      "Create a sticker printing app",
      "I need a sticker printing management system",
      "Build a sticker printing solution",
      "Create a sticker printing booking system"
  ],
};
