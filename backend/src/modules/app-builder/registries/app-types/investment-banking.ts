/**
 * Investment Banking App Type Definition
 *
 * Complete definition for investment banking applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INVESTMENT_BANKING_APP_TYPE: AppTypeDefinition = {
  id: 'investment-banking',
  name: 'Investment Banking',
  category: 'services',
  description: 'Investment Banking platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "investment banking",
      "investment",
      "banking",
      "investment software",
      "investment app",
      "investment platform",
      "investment system",
      "investment management",
      "services investment"
  ],

  synonyms: [
      "Investment Banking platform",
      "Investment Banking software",
      "Investment Banking system",
      "investment solution",
      "investment service"
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
      "Build a investment banking platform",
      "Create a investment banking app",
      "I need a investment banking management system",
      "Build a investment banking solution",
      "Create a investment banking booking system"
  ],
};
