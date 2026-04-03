/**
 * Auction House App Type Definition
 *
 * Complete definition for auction house applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUCTION_HOUSE_APP_TYPE: AppTypeDefinition = {
  id: 'auction-house',
  name: 'Auction House',
  category: 'services',
  description: 'Auction House platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "auction house",
      "auction",
      "house",
      "auction software",
      "auction app",
      "auction platform",
      "auction system",
      "auction management",
      "services auction"
  ],

  synonyms: [
      "Auction House platform",
      "Auction House software",
      "Auction House system",
      "auction solution",
      "auction service"
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
      "Build a auction house platform",
      "Create a auction house app",
      "I need a auction house management system",
      "Build a auction house solution",
      "Create a auction house booking system"
  ],
};
