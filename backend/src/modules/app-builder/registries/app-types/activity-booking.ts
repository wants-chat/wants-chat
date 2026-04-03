/**
 * Activity Booking App Type Definition
 *
 * Complete definition for activity booking applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ACTIVITY_BOOKING_APP_TYPE: AppTypeDefinition = {
  id: 'activity-booking',
  name: 'Activity Booking',
  category: 'services',
  description: 'Activity Booking platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "activity booking",
      "activity",
      "booking",
      "activity software",
      "activity app",
      "activity platform",
      "activity system",
      "activity management",
      "services activity"
  ],

  synonyms: [
      "Activity Booking platform",
      "Activity Booking software",
      "Activity Booking system",
      "activity solution",
      "activity service"
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
      "Build a activity booking platform",
      "Create a activity booking app",
      "I need a activity booking management system",
      "Build a activity booking solution",
      "Create a activity booking booking system"
  ],
};
