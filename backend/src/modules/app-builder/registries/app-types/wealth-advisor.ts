/**
 * Wealth Advisor App Type Definition
 *
 * Complete definition for wealth advisor applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEALTH_ADVISOR_APP_TYPE: AppTypeDefinition = {
  id: 'wealth-advisor',
  name: 'Wealth Advisor',
  category: 'services',
  description: 'Wealth Advisor platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wealth advisor",
      "wealth",
      "advisor",
      "wealth software",
      "wealth app",
      "wealth platform",
      "wealth system",
      "wealth management",
      "services wealth"
  ],

  synonyms: [
      "Wealth Advisor platform",
      "Wealth Advisor software",
      "Wealth Advisor system",
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
      "Build a wealth advisor platform",
      "Create a wealth advisor app",
      "I need a wealth advisor management system",
      "Build a wealth advisor solution",
      "Create a wealth advisor booking system"
  ],
};
