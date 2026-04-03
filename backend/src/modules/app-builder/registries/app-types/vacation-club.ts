/**
 * Vacation Club App Type Definition
 *
 * Complete definition for vacation club applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VACATION_CLUB_APP_TYPE: AppTypeDefinition = {
  id: 'vacation-club',
  name: 'Vacation Club',
  category: 'hospitality',
  description: 'Vacation Club platform with comprehensive management features',
  icon: 'hotel',

  keywords: [
      "vacation club",
      "vacation",
      "club",
      "vacation software",
      "vacation app",
      "vacation platform",
      "vacation system",
      "vacation management",
      "hospitality vacation"
  ],

  synonyms: [
      "Vacation Club platform",
      "Vacation Club software",
      "Vacation Club system",
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
      "Build a vacation club platform",
      "Create a vacation club app",
      "I need a vacation club management system",
      "Build a vacation club solution",
      "Create a vacation club booking system"
  ],
};
