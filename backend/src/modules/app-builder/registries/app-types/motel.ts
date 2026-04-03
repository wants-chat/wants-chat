/**
 * Motel App Type Definition
 *
 * Complete definition for motel applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOTEL_APP_TYPE: AppTypeDefinition = {
  id: 'motel',
  name: 'Motel',
  category: 'hospitality',
  description: 'Motel platform with comprehensive management features',
  icon: 'hotel',

  keywords: [
      "motel",
      "motel software",
      "motel app",
      "motel platform",
      "motel system",
      "motel management",
      "hospitality motel"
  ],

  synonyms: [
      "Motel platform",
      "Motel software",
      "Motel system",
      "motel solution",
      "motel service"
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
          "name": "Owner",
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
          "name": "Customer",
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
      "room-booking",
      "housekeeping",
      "guest-services",
      "channel-manager",
      "notifications"
  ],

  optionalFeatures: [
      "rate-management",
      "payments",
      "reviews",
      "reporting",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'hospitality',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
      "Build a motel platform",
      "Create a motel app",
      "I need a motel management system",
      "Build a motel solution",
      "Create a motel booking system"
  ],
};
