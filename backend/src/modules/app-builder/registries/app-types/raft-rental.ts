/**
 * Raft Rental App Type Definition
 *
 * Complete definition for raft rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RAFT_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'raft-rental',
  name: 'Raft Rental',
  category: 'rental',
  description: 'Raft Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "raft rental",
      "raft",
      "rental",
      "raft software",
      "raft app",
      "raft platform",
      "raft system",
      "raft management",
      "rental raft"
  ],

  synonyms: [
      "Raft Rental platform",
      "Raft Rental software",
      "Raft Rental system",
      "raft solution",
      "raft service"
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
      "Build a raft rental platform",
      "Create a raft rental app",
      "I need a raft rental management system",
      "Build a raft rental solution",
      "Create a raft rental booking system"
  ],
};
