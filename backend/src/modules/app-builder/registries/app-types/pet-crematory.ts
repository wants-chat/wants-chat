/**
 * Pet Crematory App Type Definition
 *
 * Complete definition for pet crematory applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PET_CREMATORY_APP_TYPE: AppTypeDefinition = {
  id: 'pet-crematory',
  name: 'Pet Crematory',
  category: 'pets',
  description: 'Pet Crematory platform with comprehensive management features',
  icon: 'paw',

  keywords: [
      "pet crematory",
      "pet",
      "crematory",
      "pet software",
      "pet app",
      "pet platform",
      "pet system",
      "pet management",
      "pets pet"
  ],

  synonyms: [
      "Pet Crematory platform",
      "Pet Crematory software",
      "Pet Crematory system",
      "pet solution",
      "pet service"
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
      "Build a pet crematory platform",
      "Create a pet crematory app",
      "I need a pet crematory management system",
      "Build a pet crematory solution",
      "Create a pet crematory booking system"
  ],
};
