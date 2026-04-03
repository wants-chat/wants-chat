/**
 * Business Brokerage App Type Definition
 *
 * Complete definition for business brokerage applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BUSINESS_BROKERAGE_APP_TYPE: AppTypeDefinition = {
  id: 'business-brokerage',
  name: 'Business Brokerage',
  category: 'services',
  description: 'Business Brokerage platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "business brokerage",
      "business",
      "brokerage",
      "business software",
      "business app",
      "business platform",
      "business system",
      "business management",
      "services business"
  ],

  synonyms: [
      "Business Brokerage platform",
      "Business Brokerage software",
      "Business Brokerage system",
      "business solution",
      "business service"
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
      "Build a business brokerage platform",
      "Create a business brokerage app",
      "I need a business brokerage management system",
      "Build a business brokerage solution",
      "Create a business brokerage booking system"
  ],
};
