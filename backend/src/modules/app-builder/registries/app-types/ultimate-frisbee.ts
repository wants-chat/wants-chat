/**
 * Ultimate Frisbee App Type Definition
 *
 * Complete definition for ultimate frisbee applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ULTIMATE_FRISBEE_APP_TYPE: AppTypeDefinition = {
  id: 'ultimate-frisbee',
  name: 'Ultimate Frisbee',
  category: 'services',
  description: 'Ultimate Frisbee platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "ultimate frisbee",
      "ultimate",
      "frisbee",
      "ultimate software",
      "ultimate app",
      "ultimate platform",
      "ultimate system",
      "ultimate management",
      "services ultimate"
  ],

  synonyms: [
      "Ultimate Frisbee platform",
      "Ultimate Frisbee software",
      "Ultimate Frisbee system",
      "ultimate solution",
      "ultimate service"
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
      "Build a ultimate frisbee platform",
      "Create a ultimate frisbee app",
      "I need a ultimate frisbee management system",
      "Build a ultimate frisbee solution",
      "Create a ultimate frisbee booking system"
  ],
};
