/**
 * Pet Memorial App Type Definition
 *
 * Complete definition for pet memorial applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PET_MEMORIAL_APP_TYPE: AppTypeDefinition = {
  id: 'pet-memorial',
  name: 'Pet Memorial',
  category: 'pets',
  description: 'Pet Memorial platform with comprehensive management features',
  icon: 'paw',

  keywords: [
      "pet memorial",
      "pet",
      "memorial",
      "pet software",
      "pet app",
      "pet platform",
      "pet system",
      "pet management",
      "pets pet"
  ],

  synonyms: [
      "Pet Memorial platform",
      "Pet Memorial software",
      "Pet Memorial system",
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
      "Build a pet memorial platform",
      "Create a pet memorial app",
      "I need a pet memorial management system",
      "Build a pet memorial solution",
      "Create a pet memorial booking system"
  ],
};
