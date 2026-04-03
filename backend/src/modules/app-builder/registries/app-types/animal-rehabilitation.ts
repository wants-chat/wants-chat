/**
 * Animal Rehabilitation App Type Definition
 *
 * Complete definition for animal rehabilitation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ANIMAL_REHABILITATION_APP_TYPE: AppTypeDefinition = {
  id: 'animal-rehabilitation',
  name: 'Animal Rehabilitation',
  category: 'pets',
  description: 'Animal Rehabilitation platform with comprehensive management features',
  icon: 'paw',

  keywords: [
      "animal rehabilitation",
      "animal",
      "rehabilitation",
      "animal software",
      "animal app",
      "animal platform",
      "animal system",
      "animal management",
      "pets animal"
  ],

  synonyms: [
      "Animal Rehabilitation platform",
      "Animal Rehabilitation software",
      "Animal Rehabilitation system",
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
      "Build a animal rehabilitation platform",
      "Create a animal rehabilitation app",
      "I need a animal rehabilitation management system",
      "Build a animal rehabilitation solution",
      "Create a animal rehabilitation booking system"
  ],
};
