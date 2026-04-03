/**
 * Sign Making App Type Definition
 *
 * Complete definition for sign making applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SIGN_MAKING_APP_TYPE: AppTypeDefinition = {
  id: 'sign-making',
  name: 'Sign Making',
  category: 'services',
  description: 'Sign Making platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "sign making",
      "sign",
      "making",
      "sign software",
      "sign app",
      "sign platform",
      "sign system",
      "sign management",
      "services sign"
  ],

  synonyms: [
      "Sign Making platform",
      "Sign Making software",
      "Sign Making system",
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
      "Build a sign making platform",
      "Create a sign making app",
      "I need a sign making management system",
      "Build a sign making solution",
      "Create a sign making booking system"
  ],
};
