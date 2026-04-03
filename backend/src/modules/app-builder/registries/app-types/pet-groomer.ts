/**
 * Pet Groomer App Type Definition
 *
 * Complete definition for pet groomer applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PET_GROOMER_APP_TYPE: AppTypeDefinition = {
  id: 'pet-groomer',
  name: 'Pet Groomer',
  category: 'pets',
  description: 'Pet Groomer platform with comprehensive management features',
  icon: 'paw',

  keywords: [
      "pet groomer",
      "pet",
      "groomer",
      "pet software",
      "pet app",
      "pet platform",
      "pet system",
      "pet management",
      "pets pet"
  ],

  synonyms: [
      "Pet Groomer platform",
      "Pet Groomer software",
      "Pet Groomer system",
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
      "Build a pet groomer platform",
      "Create a pet groomer app",
      "I need a pet groomer management system",
      "Build a pet groomer solution",
      "Create a pet groomer booking system"
  ],
};
