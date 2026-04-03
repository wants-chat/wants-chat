/**
 * Animal Welfare App Type Definition
 *
 * Complete definition for animal welfare applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ANIMAL_WELFARE_APP_TYPE: AppTypeDefinition = {
  id: 'animal-welfare',
  name: 'Animal Welfare',
  category: 'pets',
  description: 'Animal Welfare platform with comprehensive management features',
  icon: 'paw',

  keywords: [
      "animal welfare",
      "animal",
      "welfare",
      "animal software",
      "animal app",
      "animal platform",
      "animal system",
      "animal management",
      "pets animal"
  ],

  synonyms: [
      "Animal Welfare platform",
      "Animal Welfare software",
      "Animal Welfare system",
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
      "Build a animal welfare platform",
      "Create a animal welfare app",
      "I need a animal welfare management system",
      "Build a animal welfare solution",
      "Create a animal welfare booking system"
  ],
};
