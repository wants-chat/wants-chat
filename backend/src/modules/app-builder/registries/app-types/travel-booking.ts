/**
 * Travel Booking App Type Definition
 *
 * Complete definition for travel booking applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRAVEL_BOOKING_APP_TYPE: AppTypeDefinition = {
  id: 'travel-booking',
  name: 'Travel Booking',
  category: 'services',
  description: 'Travel Booking platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "travel booking",
      "travel",
      "booking",
      "travel software",
      "travel app",
      "travel platform",
      "travel system",
      "travel management",
      "services travel"
  ],

  synonyms: [
      "Travel Booking platform",
      "Travel Booking software",
      "Travel Booking system",
      "travel solution",
      "travel service"
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
      "Build a travel booking platform",
      "Create a travel booking app",
      "I need a travel booking management system",
      "Build a travel booking solution",
      "Create a travel booking booking system"
  ],
};
