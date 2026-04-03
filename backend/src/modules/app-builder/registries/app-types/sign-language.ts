/**
 * Sign Language App Type Definition
 *
 * Complete definition for sign language applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SIGN_LANGUAGE_APP_TYPE: AppTypeDefinition = {
  id: 'sign-language',
  name: 'Sign Language',
  category: 'services',
  description: 'Sign Language platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "sign language",
      "sign",
      "language",
      "sign software",
      "sign app",
      "sign platform",
      "sign system",
      "sign management",
      "services sign"
  ],

  synonyms: [
      "Sign Language platform",
      "Sign Language software",
      "Sign Language system",
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
      "Build a sign language platform",
      "Create a sign language app",
      "I need a sign language management system",
      "Build a sign language solution",
      "Create a sign language booking system"
  ],
};
