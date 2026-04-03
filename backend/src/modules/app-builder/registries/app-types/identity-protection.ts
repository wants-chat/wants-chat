/**
 * Identity Protection App Type Definition
 *
 * Complete definition for identity protection applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const IDENTITY_PROTECTION_APP_TYPE: AppTypeDefinition = {
  id: 'identity-protection',
  name: 'Identity Protection',
  category: 'services',
  description: 'Identity Protection platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "identity protection",
      "identity",
      "protection",
      "identity software",
      "identity app",
      "identity platform",
      "identity system",
      "identity management",
      "services identity"
  ],

  synonyms: [
      "Identity Protection platform",
      "Identity Protection software",
      "Identity Protection system",
      "identity solution",
      "identity service"
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
      "Build a identity protection platform",
      "Create a identity protection app",
      "I need a identity protection management system",
      "Build a identity protection solution",
      "Create a identity protection booking system"
  ],
};
