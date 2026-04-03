/**
 * Wealth Planning App Type Definition
 *
 * Complete definition for wealth planning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEALTH_PLANNING_APP_TYPE: AppTypeDefinition = {
  id: 'wealth-planning',
  name: 'Wealth Planning',
  category: 'services',
  description: 'Wealth Planning platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wealth planning",
      "wealth",
      "planning",
      "wealth software",
      "wealth app",
      "wealth platform",
      "wealth system",
      "wealth management",
      "services wealth"
  ],

  synonyms: [
      "Wealth Planning platform",
      "Wealth Planning software",
      "Wealth Planning system",
      "wealth solution",
      "wealth service"
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
      "Build a wealth planning platform",
      "Create a wealth planning app",
      "I need a wealth planning management system",
      "Build a wealth planning solution",
      "Create a wealth planning booking system"
  ],
};
