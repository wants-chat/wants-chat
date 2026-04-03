/**
 * Preventive Medicine App Type Definition
 *
 * Complete definition for preventive medicine applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PREVENTIVE_MEDICINE_APP_TYPE: AppTypeDefinition = {
  id: 'preventive-medicine',
  name: 'Preventive Medicine',
  category: 'events',
  description: 'Preventive Medicine platform with comprehensive management features',
  icon: 'calendar',

  keywords: [
      "preventive medicine",
      "preventive",
      "medicine",
      "preventive software",
      "preventive app",
      "preventive platform",
      "preventive system",
      "preventive management",
      "events preventive"
  ],

  synonyms: [
      "Preventive Medicine platform",
      "Preventive Medicine software",
      "Preventive Medicine system",
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
      "Build a preventive medicine platform",
      "Create a preventive medicine app",
      "I need a preventive medicine management system",
      "Build a preventive medicine solution",
      "Create a preventive medicine booking system"
  ],
};
