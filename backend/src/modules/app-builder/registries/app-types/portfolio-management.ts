/**
 * Portfolio Management App Type Definition
 *
 * Complete definition for portfolio management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PORTFOLIO_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'portfolio-management',
  name: 'Portfolio Management',
  category: 'services',
  description: 'Portfolio Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "portfolio management",
      "portfolio",
      "management",
      "portfolio software",
      "portfolio app",
      "portfolio platform",
      "portfolio system",
      "services portfolio"
  ],

  synonyms: [
      "Portfolio Management platform",
      "Portfolio Management software",
      "Portfolio Management system",
      "portfolio solution",
      "portfolio service"
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
      "Build a portfolio management platform",
      "Create a portfolio management app",
      "I need a portfolio management management system",
      "Build a portfolio management solution",
      "Create a portfolio management booking system"
  ],
};
