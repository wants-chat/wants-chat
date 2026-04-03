/**
 * Rare Books App Type Definition
 *
 * Complete definition for rare books applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RARE_BOOKS_APP_TYPE: AppTypeDefinition = {
  id: 'rare-books',
  name: 'Rare Books',
  category: 'services',
  description: 'Rare Books platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "rare books",
      "rare",
      "books",
      "rare software",
      "rare app",
      "rare platform",
      "rare system",
      "rare management",
      "services rare"
  ],

  synonyms: [
      "Rare Books platform",
      "Rare Books software",
      "Rare Books system",
      "rare solution",
      "rare service"
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
      "Build a rare books platform",
      "Create a rare books app",
      "I need a rare books management system",
      "Build a rare books solution",
      "Create a rare books booking system"
  ],
};
