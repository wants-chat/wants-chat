/**
 * Tropical Plants App Type Definition
 *
 * Complete definition for tropical plants applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TROPICAL_PLANTS_APP_TYPE: AppTypeDefinition = {
  id: 'tropical-plants',
  name: 'Tropical Plants',
  category: 'services',
  description: 'Tropical Plants platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tropical plants",
      "tropical",
      "plants",
      "tropical software",
      "tropical app",
      "tropical platform",
      "tropical system",
      "tropical management",
      "services tropical"
  ],

  synonyms: [
      "Tropical Plants platform",
      "Tropical Plants software",
      "Tropical Plants system",
      "tropical solution",
      "tropical service"
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
      "Build a tropical plants platform",
      "Create a tropical plants app",
      "I need a tropical plants management system",
      "Build a tropical plants solution",
      "Create a tropical plants booking system"
  ],
};
