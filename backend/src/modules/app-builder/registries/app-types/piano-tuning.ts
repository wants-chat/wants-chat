/**
 * Piano Tuning App Type Definition
 *
 * Complete definition for piano tuning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PIANO_TUNING_APP_TYPE: AppTypeDefinition = {
  id: 'piano-tuning',
  name: 'Piano Tuning',
  category: 'services',
  description: 'Piano Tuning platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "piano tuning",
      "piano",
      "tuning",
      "piano software",
      "piano app",
      "piano platform",
      "piano system",
      "piano management",
      "services piano"
  ],

  synonyms: [
      "Piano Tuning platform",
      "Piano Tuning software",
      "Piano Tuning system",
      "piano solution",
      "piano service"
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
      "Build a piano tuning platform",
      "Create a piano tuning app",
      "I need a piano tuning management system",
      "Build a piano tuning solution",
      "Create a piano tuning booking system"
  ],
};
