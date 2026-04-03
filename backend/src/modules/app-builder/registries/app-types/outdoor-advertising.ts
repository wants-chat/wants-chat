/**
 * Outdoor Advertising App Type Definition
 *
 * Complete definition for outdoor advertising applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OUTDOOR_ADVERTISING_APP_TYPE: AppTypeDefinition = {
  id: 'outdoor-advertising',
  name: 'Outdoor Advertising',
  category: 'services',
  description: 'Outdoor Advertising platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "outdoor advertising",
      "outdoor",
      "advertising",
      "outdoor software",
      "outdoor app",
      "outdoor platform",
      "outdoor system",
      "outdoor management",
      "services outdoor"
  ],

  synonyms: [
      "Outdoor Advertising platform",
      "Outdoor Advertising software",
      "Outdoor Advertising system",
      "outdoor solution",
      "outdoor service"
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
      "Build a outdoor advertising platform",
      "Create a outdoor advertising app",
      "I need a outdoor advertising management system",
      "Build a outdoor advertising solution",
      "Create a outdoor advertising booking system"
  ],
};
