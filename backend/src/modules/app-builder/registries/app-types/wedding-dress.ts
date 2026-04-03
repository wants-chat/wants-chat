/**
 * Wedding Dress App Type Definition
 *
 * Complete definition for wedding dress applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEDDING_DRESS_APP_TYPE: AppTypeDefinition = {
  id: 'wedding-dress',
  name: 'Wedding Dress',
  category: 'entertainment',
  description: 'Wedding Dress platform with comprehensive management features',
  icon: 'ticket',

  keywords: [
      "wedding dress",
      "wedding",
      "dress",
      "wedding software",
      "wedding app",
      "wedding platform",
      "wedding system",
      "wedding management",
      "entertainment wedding"
  ],

  synonyms: [
      "Wedding Dress platform",
      "Wedding Dress software",
      "Wedding Dress system",
      "wedding solution",
      "wedding service"
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
      "ticket-sales",
      "venue-booking",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "seating-charts",
      "payments",
      "reviews",
      "gallery",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'vibrant',

  examplePrompts: [
      "Build a wedding dress platform",
      "Create a wedding dress app",
      "I need a wedding dress management system",
      "Build a wedding dress solution",
      "Create a wedding dress booking system"
  ],
};
