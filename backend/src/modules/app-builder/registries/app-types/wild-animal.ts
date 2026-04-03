/**
 * Wild Animal App Type Definition
 *
 * Complete definition for wild animal applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WILD_ANIMAL_APP_TYPE: AppTypeDefinition = {
  id: 'wild-animal',
  name: 'Wild Animal',
  category: 'pets',
  description: 'Wild Animal platform with comprehensive management features',
  icon: 'paw',

  keywords: [
      "wild animal",
      "wild",
      "animal",
      "wild software",
      "wild app",
      "wild platform",
      "wild system",
      "wild management",
      "pets wild"
  ],

  synonyms: [
      "Wild Animal platform",
      "Wild Animal software",
      "Wild Animal system",
      "wild solution",
      "wild service"
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
      "Build a wild animal platform",
      "Create a wild animal app",
      "I need a wild animal management system",
      "Build a wild animal solution",
      "Create a wild animal booking system"
  ],
};
