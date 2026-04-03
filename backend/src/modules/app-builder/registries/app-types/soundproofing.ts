/**
 * Soundproofing App Type Definition
 *
 * Complete definition for soundproofing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOUNDPROOFING_APP_TYPE: AppTypeDefinition = {
  id: 'soundproofing',
  name: 'Soundproofing',
  category: 'construction',
  description: 'Soundproofing platform with comprehensive management features',
  icon: 'house',

  keywords: [
      "soundproofing",
      "soundproofing software",
      "soundproofing app",
      "soundproofing platform",
      "soundproofing system",
      "soundproofing management",
      "trades soundproofing"
  ],

  synonyms: [
      "Soundproofing platform",
      "Soundproofing software",
      "Soundproofing system",
      "soundproofing solution",
      "soundproofing service"
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
      "project-bids",
      "scheduling",
      "invoicing",
      "clients",
      "notifications"
  ],

  optionalFeatures: [
      "documents",
      "payments",
      "reviews",
      "gallery",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'trades',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a soundproofing platform",
      "Create a soundproofing app",
      "I need a soundproofing management system",
      "Build a soundproofing solution",
      "Create a soundproofing booking system"
  ],
};
