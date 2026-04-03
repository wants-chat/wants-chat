/**
 * Youth Hostel App Type Definition
 *
 * Complete definition for youth hostel applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YOUTH_HOSTEL_APP_TYPE: AppTypeDefinition = {
  id: 'youth-hostel',
  name: 'Youth Hostel',
  category: 'hospitality',
  description: 'Youth Hostel platform with comprehensive management features',
  icon: 'hotel',

  keywords: [
      "youth hostel",
      "youth",
      "hostel",
      "youth software",
      "youth app",
      "youth platform",
      "youth system",
      "youth management",
      "hospitality youth"
  ],

  synonyms: [
      "Youth Hostel platform",
      "Youth Hostel software",
      "Youth Hostel system",
      "youth solution",
      "youth service"
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
      "Build a youth hostel platform",
      "Create a youth hostel app",
      "I need a youth hostel management system",
      "Build a youth hostel solution",
      "Create a youth hostel booking system"
  ],
};
