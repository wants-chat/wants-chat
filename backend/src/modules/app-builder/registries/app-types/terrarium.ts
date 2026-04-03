/**
 * Terrarium App Type Definition
 *
 * Complete definition for terrarium applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TERRARIUM_APP_TYPE: AppTypeDefinition = {
  id: 'terrarium',
  name: 'Terrarium',
  category: 'services',
  description: 'Terrarium platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "terrarium",
      "terrarium software",
      "terrarium app",
      "terrarium platform",
      "terrarium system",
      "terrarium management",
      "services terrarium"
  ],

  synonyms: [
      "Terrarium platform",
      "Terrarium software",
      "Terrarium system",
      "terrarium solution",
      "terrarium service"
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
      "Build a terrarium platform",
      "Create a terrarium app",
      "I need a terrarium management system",
      "Build a terrarium solution",
      "Create a terrarium booking system"
  ],
};
