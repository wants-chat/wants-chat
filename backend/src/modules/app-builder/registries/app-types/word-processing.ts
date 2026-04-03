/**
 * Word Processing App Type Definition
 *
 * Complete definition for word processing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WORD_PROCESSING_APP_TYPE: AppTypeDefinition = {
  id: 'word-processing',
  name: 'Word Processing',
  category: 'services',
  description: 'Word Processing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "word processing",
      "word",
      "processing",
      "word software",
      "word app",
      "word platform",
      "word system",
      "word management",
      "services word"
  ],

  synonyms: [
      "Word Processing platform",
      "Word Processing software",
      "Word Processing system",
      "word solution",
      "word service"
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
      "Build a word processing platform",
      "Create a word processing app",
      "I need a word processing management system",
      "Build a word processing solution",
      "Create a word processing booking system"
  ],
};
