/**
 * Amusement Rides App Type Definition
 *
 * Complete definition for amusement rides applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AMUSEMENT_RIDES_APP_TYPE: AppTypeDefinition = {
  id: 'amusement-rides',
  name: 'Amusement Rides',
  category: 'services',
  description: 'Amusement Rides platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "amusement rides",
      "amusement",
      "rides",
      "amusement software",
      "amusement app",
      "amusement platform",
      "amusement system",
      "amusement management",
      "services amusement"
  ],

  synonyms: [
      "Amusement Rides platform",
      "Amusement Rides software",
      "Amusement Rides system",
      "amusement solution",
      "amusement service"
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
      "Build a amusement rides platform",
      "Create a amusement rides app",
      "I need a amusement rides management system",
      "Build a amusement rides solution",
      "Create a amusement rides booking system"
  ],
};
