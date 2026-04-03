/**
 * Textbook App Type Definition
 *
 * Complete definition for textbook applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TEXTBOOK_APP_TYPE: AppTypeDefinition = {
  id: 'textbook',
  name: 'Textbook',
  category: 'services',
  description: 'Textbook platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "textbook",
      "textbook software",
      "textbook app",
      "textbook platform",
      "textbook system",
      "textbook management",
      "services textbook"
  ],

  synonyms: [
      "Textbook platform",
      "Textbook software",
      "Textbook system",
      "textbook solution",
      "textbook service"
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
      "Build a textbook platform",
      "Create a textbook app",
      "I need a textbook management system",
      "Build a textbook solution",
      "Create a textbook booking system"
  ],
};
