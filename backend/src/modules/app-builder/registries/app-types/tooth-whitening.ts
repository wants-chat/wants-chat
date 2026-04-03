/**
 * Tooth Whitening App Type Definition
 *
 * Complete definition for tooth whitening applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOOTH_WHITENING_APP_TYPE: AppTypeDefinition = {
  id: 'tooth-whitening',
  name: 'Tooth Whitening',
  category: 'services',
  description: 'Tooth Whitening platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tooth whitening",
      "tooth",
      "whitening",
      "tooth software",
      "tooth app",
      "tooth platform",
      "tooth system",
      "tooth management",
      "services tooth"
  ],

  synonyms: [
      "Tooth Whitening platform",
      "Tooth Whitening software",
      "Tooth Whitening system",
      "tooth solution",
      "tooth service"
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
      "Build a tooth whitening platform",
      "Create a tooth whitening app",
      "I need a tooth whitening management system",
      "Build a tooth whitening solution",
      "Create a tooth whitening booking system"
  ],
};
