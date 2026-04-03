/**
 * Rhinoplasty App Type Definition
 *
 * Complete definition for rhinoplasty applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RHINOPLASTY_APP_TYPE: AppTypeDefinition = {
  id: 'rhinoplasty',
  name: 'Rhinoplasty',
  category: 'services',
  description: 'Rhinoplasty platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "rhinoplasty",
      "rhinoplasty software",
      "rhinoplasty app",
      "rhinoplasty platform",
      "rhinoplasty system",
      "rhinoplasty management",
      "services rhinoplasty"
  ],

  synonyms: [
      "Rhinoplasty platform",
      "Rhinoplasty software",
      "Rhinoplasty system",
      "rhinoplasty solution",
      "rhinoplasty service"
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
      "Build a rhinoplasty platform",
      "Create a rhinoplasty app",
      "I need a rhinoplasty management system",
      "Build a rhinoplasty solution",
      "Create a rhinoplasty booking system"
  ],
};
