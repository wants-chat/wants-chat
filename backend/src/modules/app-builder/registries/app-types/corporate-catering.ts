/**
 * Corporate Catering App Type Definition
 *
 * Complete definition for corporate catering applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CORPORATE_CATERING_APP_TYPE: AppTypeDefinition = {
  id: 'corporate-catering',
  name: 'Corporate Catering',
  category: 'hospitality',
  description: 'Corporate Catering platform with comprehensive management features',
  icon: 'plate',

  keywords: [
      "corporate catering",
      "corporate",
      "catering",
      "corporate software",
      "corporate app",
      "corporate platform",
      "corporate system",
      "corporate management",
      "food-beverage corporate"
  ],

  synonyms: [
      "Corporate Catering platform",
      "Corporate Catering software",
      "Corporate Catering system",
      "corporate solution",
      "corporate service"
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
          "name": "Owner",
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
          "name": "Customer",
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
      "orders",
      "menu-management",
      "calendar",
      "invoicing",
      "notifications"
  ],

  optionalFeatures: [
      "payments",
      "contracts",
      "clients",
      "reporting",
      "gallery"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'food-beverage',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
      "Build a corporate catering platform",
      "Create a corporate catering app",
      "I need a corporate catering management system",
      "Build a corporate catering solution",
      "Create a corporate catering booking system"
  ],
};
