/**
 * Wholesale Club App Type Definition
 *
 * Complete definition for wholesale club applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WHOLESALE_CLUB_APP_TYPE: AppTypeDefinition = {
  id: 'wholesale-club',
  name: 'Wholesale Club',
  category: 'services',
  description: 'Wholesale Club platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wholesale club",
      "wholesale",
      "club",
      "wholesale software",
      "wholesale app",
      "wholesale platform",
      "wholesale system",
      "wholesale management",
      "services wholesale"
  ],

  synonyms: [
      "Wholesale Club platform",
      "Wholesale Club software",
      "Wholesale Club system",
      "wholesale solution",
      "wholesale service"
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
      "Build a wholesale club platform",
      "Create a wholesale club app",
      "I need a wholesale club management system",
      "Build a wholesale club solution",
      "Create a wholesale club booking system"
  ],
};
