/**
 * Vacation Home App Type Definition
 *
 * Complete definition for vacation home applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VACATION_HOME_APP_TYPE: AppTypeDefinition = {
  id: 'vacation-home',
  name: 'Vacation Home',
  category: 'hospitality',
  description: 'Vacation Home platform with comprehensive management features',
  icon: 'hotel',

  keywords: [
      "vacation home",
      "vacation",
      "home",
      "vacation software",
      "vacation app",
      "vacation platform",
      "vacation system",
      "vacation management",
      "hospitality vacation"
  ],

  synonyms: [
      "Vacation Home platform",
      "Vacation Home software",
      "Vacation Home system",
      "vacation solution",
      "vacation service"
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
      "Build a vacation home platform",
      "Create a vacation home app",
      "I need a vacation home management system",
      "Build a vacation home solution",
      "Create a vacation home booking system"
  ],
};
