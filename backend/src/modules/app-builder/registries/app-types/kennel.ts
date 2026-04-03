/**
 * Kennel App Type Definition
 *
 * Complete definition for kennel applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const KENNEL_APP_TYPE: AppTypeDefinition = {
  id: 'kennel',
  name: 'Kennel',
  category: 'pets',
  description: 'Kennel platform with comprehensive management features',
  icon: 'paw',

  keywords: [
      "kennel",
      "kennel software",
      "kennel app",
      "kennel platform",
      "kennel system",
      "kennel management",
      "pets kennel"
  ],

  synonyms: [
      "Kennel platform",
      "Kennel software",
      "Kennel system",
      "kennel solution",
      "kennel service"
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
      "Build a kennel platform",
      "Create a kennel app",
      "I need a kennel management system",
      "Build a kennel solution",
      "Create a kennel booking system"
  ],
};
