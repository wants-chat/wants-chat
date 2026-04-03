/**
 * Wire Transfer App Type Definition
 *
 * Complete definition for wire transfer applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WIRE_TRANSFER_APP_TYPE: AppTypeDefinition = {
  id: 'wire-transfer',
  name: 'Wire Transfer',
  category: 'services',
  description: 'Wire Transfer platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wire transfer",
      "wire",
      "transfer",
      "wire software",
      "wire app",
      "wire platform",
      "wire system",
      "wire management",
      "services wire"
  ],

  synonyms: [
      "Wire Transfer platform",
      "Wire Transfer software",
      "Wire Transfer system",
      "wire solution",
      "wire service"
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
      "Build a wire transfer platform",
      "Create a wire transfer app",
      "I need a wire transfer management system",
      "Build a wire transfer solution",
      "Create a wire transfer booking system"
  ],
};
