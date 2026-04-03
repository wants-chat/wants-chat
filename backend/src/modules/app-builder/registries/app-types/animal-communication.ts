/**
 * Animal Communication App Type Definition
 *
 * Complete definition for animal communication applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ANIMAL_COMMUNICATION_APP_TYPE: AppTypeDefinition = {
  id: 'animal-communication',
  name: 'Animal Communication',
  category: 'pets',
  description: 'Animal Communication platform with comprehensive management features',
  icon: 'paw',

  keywords: [
      "animal communication",
      "animal",
      "communication",
      "animal software",
      "animal app",
      "animal platform",
      "animal system",
      "animal management",
      "pets animal"
  ],

  synonyms: [
      "Animal Communication platform",
      "Animal Communication software",
      "Animal Communication system",
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
      "Build a animal communication platform",
      "Create a animal communication app",
      "I need a animal communication management system",
      "Build a animal communication solution",
      "Create a animal communication booking system"
  ],
};
