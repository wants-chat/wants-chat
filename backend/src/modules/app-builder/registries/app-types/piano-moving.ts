/**
 * Piano Moving App Type Definition
 *
 * Complete definition for piano moving applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PIANO_MOVING_APP_TYPE: AppTypeDefinition = {
  id: 'piano-moving',
  name: 'Piano Moving',
  category: 'logistics',
  description: 'Piano Moving platform with comprehensive management features',
  icon: 'truck',

  keywords: [
      "piano moving",
      "piano",
      "moving",
      "piano software",
      "piano app",
      "piano platform",
      "piano system",
      "piano management",
      "services piano"
  ],

  synonyms: [
      "Piano Moving platform",
      "Piano Moving software",
      "Piano Moving system",
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
      "reservations",
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "contracts",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a piano moving platform",
      "Create a piano moving app",
      "I need a piano moving management system",
      "Build a piano moving solution",
      "Create a piano moving booking system"
  ],
};
