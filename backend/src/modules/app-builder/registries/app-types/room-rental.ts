/**
 * Room Rental App Type Definition
 *
 * Complete definition for room rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ROOM_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'room-rental',
  name: 'Room Rental',
  category: 'rental',
  description: 'Room Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "room rental",
      "room",
      "rental",
      "room software",
      "room app",
      "room platform",
      "room system",
      "room management",
      "rental room"
  ],

  synonyms: [
      "Room Rental platform",
      "Room Rental software",
      "Room Rental system",
      "room solution",
      "room service"
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
      "inventory",
      "reservations",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "invoicing",
      "check-in",
      "reviews",
      "discounts"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'rental',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a room rental platform",
      "Create a room rental app",
      "I need a room rental management system",
      "Build a room rental solution",
      "Create a room rental booking system"
  ],
};
