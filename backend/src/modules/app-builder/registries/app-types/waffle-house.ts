/**
 * Waffle House App Type Definition
 *
 * Complete definition for waffle house applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WAFFLE_HOUSE_APP_TYPE: AppTypeDefinition = {
  id: 'waffle-house',
  name: 'Waffle House',
  category: 'services',
  description: 'Waffle House platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "waffle house",
      "waffle",
      "house",
      "waffle software",
      "waffle app",
      "waffle platform",
      "waffle system",
      "waffle management",
      "services waffle"
  ],

  synonyms: [
      "Waffle House platform",
      "Waffle House software",
      "Waffle House system",
      "waffle solution",
      "waffle service"
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
      "Build a waffle house platform",
      "Create a waffle house app",
      "I need a waffle house management system",
      "Build a waffle house solution",
      "Create a waffle house booking system"
  ],
};
