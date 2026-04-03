/**
 * White Label App Type Definition
 *
 * Complete definition for white label applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WHITE_LABEL_APP_TYPE: AppTypeDefinition = {
  id: 'white-label',
  name: 'White Label',
  category: 'services',
  description: 'White Label platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "white label",
      "white",
      "label",
      "white software",
      "white app",
      "white platform",
      "white system",
      "white management",
      "services white"
  ],

  synonyms: [
      "White Label platform",
      "White Label software",
      "White Label system",
      "white solution",
      "white service"
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
      "Build a white label platform",
      "Create a white label app",
      "I need a white label management system",
      "Build a white label solution",
      "Create a white label booking system"
  ],
};
