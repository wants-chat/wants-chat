/**
 * Mountain Biking App Type Definition
 *
 * Complete definition for mountain biking applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOUNTAIN_BIKING_APP_TYPE: AppTypeDefinition = {
  id: 'mountain-biking',
  name: 'Mountain Biking',
  category: 'services',
  description: 'Mountain Biking platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "mountain biking",
      "mountain",
      "biking",
      "mountain software",
      "mountain app",
      "mountain platform",
      "mountain system",
      "mountain management",
      "services mountain"
  ],

  synonyms: [
      "Mountain Biking platform",
      "Mountain Biking software",
      "Mountain Biking system",
      "mountain solution",
      "mountain service"
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
      "Build a mountain biking platform",
      "Create a mountain biking app",
      "I need a mountain biking management system",
      "Build a mountain biking solution",
      "Create a mountain biking booking system"
  ],
};
