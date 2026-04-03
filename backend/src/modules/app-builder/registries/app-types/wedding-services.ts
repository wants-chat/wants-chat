/**
 * Wedding Services App Type Definition
 *
 * Complete definition for wedding services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEDDING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'wedding-services',
  name: 'Wedding Services',
  category: 'entertainment',
  description: 'Wedding Services platform with comprehensive management features',
  icon: 'ticket',

  keywords: [
      "wedding services",
      "wedding",
      "services",
      "wedding software",
      "wedding app",
      "wedding platform",
      "wedding system",
      "wedding management",
      "entertainment wedding"
  ],

  synonyms: [
      "Wedding Services platform",
      "Wedding Services software",
      "Wedding Services system",
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
      "Build a wedding services platform",
      "Create a wedding services app",
      "I need a wedding services management system",
      "Build a wedding services solution",
      "Create a wedding services booking system"
  ],
};
