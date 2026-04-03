/**
 * Animal Behavior App Type Definition
 *
 * Complete definition for animal behavior applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ANIMAL_BEHAVIOR_APP_TYPE: AppTypeDefinition = {
  id: 'animal-behavior',
  name: 'Animal Behavior',
  category: 'pets',
  description: 'Animal Behavior platform with comprehensive management features',
  icon: 'paw',

  keywords: [
      "animal behavior",
      "animal",
      "behavior",
      "animal software",
      "animal app",
      "animal platform",
      "animal system",
      "animal management",
      "pets animal"
  ],

  synonyms: [
      "Animal Behavior platform",
      "Animal Behavior software",
      "Animal Behavior system",
      "animal solution",
      "animal service"
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
      "client-intake",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "gallery",
      "reminders",
      "messaging"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'pets',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
      "Build a animal behavior platform",
      "Create a animal behavior app",
      "I need a animal behavior management system",
      "Build a animal behavior solution",
      "Create a animal behavior booking system"
  ],
};
