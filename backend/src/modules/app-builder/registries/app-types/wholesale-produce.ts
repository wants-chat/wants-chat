/**
 * Wholesale Produce App Type Definition
 *
 * Complete definition for wholesale produce applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WHOLESALE_PRODUCE_APP_TYPE: AppTypeDefinition = {
  id: 'wholesale-produce',
  name: 'Wholesale Produce',
  category: 'services',
  description: 'Wholesale Produce platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wholesale produce",
      "wholesale",
      "produce",
      "wholesale software",
      "wholesale app",
      "wholesale platform",
      "wholesale system",
      "wholesale management",
      "services wholesale"
  ],

  synonyms: [
      "Wholesale Produce platform",
      "Wholesale Produce software",
      "Wholesale Produce system",
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
      "Build a wholesale produce platform",
      "Create a wholesale produce app",
      "I need a wholesale produce management system",
      "Build a wholesale produce solution",
      "Create a wholesale produce booking system"
  ],
};
