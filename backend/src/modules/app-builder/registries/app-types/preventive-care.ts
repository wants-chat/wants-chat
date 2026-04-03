/**
 * Preventive Care App Type Definition
 *
 * Complete definition for preventive care applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PREVENTIVE_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'preventive-care',
  name: 'Preventive Care',
  category: 'events',
  description: 'Preventive Care platform with comprehensive management features',
  icon: 'calendar',

  keywords: [
      "preventive care",
      "preventive",
      "care",
      "preventive software",
      "preventive app",
      "preventive platform",
      "preventive system",
      "preventive management",
      "events preventive"
  ],

  synonyms: [
      "Preventive Care platform",
      "Preventive Care software",
      "Preventive Care system",
      "preventive solution",
      "preventive service"
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
      "venue-booking",
      "calendar",
      "reservations",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "ticket-sales",
      "payments",
      "gallery",
      "reviews",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'events',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
      "Build a preventive care platform",
      "Create a preventive care app",
      "I need a preventive care management system",
      "Build a preventive care solution",
      "Create a preventive care booking system"
  ],
};
