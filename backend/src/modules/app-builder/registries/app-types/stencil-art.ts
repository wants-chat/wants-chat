/**
 * Stencil Art App Type Definition
 *
 * Complete definition for stencil art applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STENCIL_ART_APP_TYPE: AppTypeDefinition = {
  id: 'stencil-art',
  name: 'Stencil Art',
  category: 'services',
  description: 'Stencil Art platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "stencil art",
      "stencil",
      "art",
      "stencil software",
      "stencil app",
      "stencil platform",
      "stencil system",
      "stencil management",
      "services stencil"
  ],

  synonyms: [
      "Stencil Art platform",
      "Stencil Art software",
      "Stencil Art system",
      "stencil solution",
      "stencil service"
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
      "Build a stencil art platform",
      "Create a stencil art app",
      "I need a stencil art management system",
      "Build a stencil art solution",
      "Create a stencil art booking system"
  ],
};
