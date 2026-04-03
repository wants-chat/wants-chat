/**
 * Transfer Printing App Type Definition
 *
 * Complete definition for transfer printing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRANSFER_PRINTING_APP_TYPE: AppTypeDefinition = {
  id: 'transfer-printing',
  name: 'Transfer Printing',
  category: 'services',
  description: 'Transfer Printing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "transfer printing",
      "transfer",
      "printing",
      "transfer software",
      "transfer app",
      "transfer platform",
      "transfer system",
      "transfer management",
      "services transfer"
  ],

  synonyms: [
      "Transfer Printing platform",
      "Transfer Printing software",
      "Transfer Printing system",
      "transfer solution",
      "transfer service"
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
      "Build a transfer printing platform",
      "Create a transfer printing app",
      "I need a transfer printing management system",
      "Build a transfer printing solution",
      "Create a transfer printing booking system"
  ],
};
