/**
 * Art Auction App Type Definition
 *
 * Complete definition for art auction applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ART_AUCTION_APP_TYPE: AppTypeDefinition = {
  id: 'art-auction',
  name: 'Art Auction',
  category: 'services',
  description: 'Art Auction platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "art auction",
      "art",
      "auction",
      "art software",
      "art app",
      "art platform",
      "art system",
      "art management",
      "services art"
  ],

  synonyms: [
      "Art Auction platform",
      "Art Auction software",
      "Art Auction system",
      "art solution",
      "art service"
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
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a art auction platform",
      "Create a art auction app",
      "I need a art auction management system",
      "Build a art auction solution",
      "Create a art auction booking system"
  ],
};
