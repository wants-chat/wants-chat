/**
 * Termite Control App Type Definition
 *
 * Complete definition for termite control applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TERMITE_CONTROL_APP_TYPE: AppTypeDefinition = {
  id: 'termite-control',
  name: 'Termite Control',
  category: 'services',
  description: 'Termite Control platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "termite control",
      "termite",
      "control",
      "termite software",
      "termite app",
      "termite platform",
      "termite system",
      "termite management",
      "services termite"
  ],

  synonyms: [
      "Termite Control platform",
      "Termite Control software",
      "Termite Control system",
      "termite solution",
      "termite service"
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
      "Build a termite control platform",
      "Create a termite control app",
      "I need a termite control management system",
      "Build a termite control solution",
      "Create a termite control booking system"
  ],
};
