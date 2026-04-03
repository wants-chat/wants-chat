/**
 * Underwater Photography App Type Definition
 *
 * Complete definition for underwater photography applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const UNDERWATER_PHOTOGRAPHY_APP_TYPE: AppTypeDefinition = {
  id: 'underwater-photography',
  name: 'Underwater Photography',
  category: 'services',
  description: 'Underwater Photography platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "underwater photography",
      "underwater",
      "photography",
      "underwater software",
      "underwater app",
      "underwater platform",
      "underwater system",
      "underwater management",
      "services underwater"
  ],

  synonyms: [
      "Underwater Photography platform",
      "Underwater Photography software",
      "Underwater Photography system",
      "underwater solution",
      "underwater service"
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
      "Build a underwater photography platform",
      "Create a underwater photography app",
      "I need a underwater photography management system",
      "Build a underwater photography solution",
      "Create a underwater photography booking system"
  ],
};
