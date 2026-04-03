/**
 * Wholesale Distribution App Type Definition
 *
 * Complete definition for wholesale distribution applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WHOLESALE_DISTRIBUTION_APP_TYPE: AppTypeDefinition = {
  id: 'wholesale-distribution',
  name: 'Wholesale Distribution',
  category: 'services',
  description: 'Wholesale Distribution platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wholesale distribution",
      "wholesale",
      "distribution",
      "wholesale software",
      "wholesale app",
      "wholesale platform",
      "wholesale system",
      "wholesale management",
      "services wholesale"
  ],

  synonyms: [
      "Wholesale Distribution platform",
      "Wholesale Distribution software",
      "Wholesale Distribution system",
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
      "Build a wholesale distribution platform",
      "Create a wholesale distribution app",
      "I need a wholesale distribution management system",
      "Build a wholesale distribution solution",
      "Create a wholesale distribution booking system"
  ],
};
