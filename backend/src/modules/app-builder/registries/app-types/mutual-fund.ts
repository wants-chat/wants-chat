/**
 * Mutual Fund App Type Definition
 *
 * Complete definition for mutual fund applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MUTUAL_FUND_APP_TYPE: AppTypeDefinition = {
  id: 'mutual-fund',
  name: 'Mutual Fund',
  category: 'services',
  description: 'Mutual Fund platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "mutual fund",
      "mutual",
      "fund",
      "mutual software",
      "mutual app",
      "mutual platform",
      "mutual system",
      "mutual management",
      "services mutual"
  ],

  synonyms: [
      "Mutual Fund platform",
      "Mutual Fund software",
      "Mutual Fund system",
      "mutual solution",
      "mutual service"
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
      "Build a mutual fund platform",
      "Create a mutual fund app",
      "I need a mutual fund management system",
      "Build a mutual fund solution",
      "Create a mutual fund booking system"
  ],
};
