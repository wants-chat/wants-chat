/**
 * Paper Goods App Type Definition
 *
 * Complete definition for paper goods applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PAPER_GOODS_APP_TYPE: AppTypeDefinition = {
  id: 'paper-goods',
  name: 'Paper Goods',
  category: 'services',
  description: 'Paper Goods platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "paper goods",
      "paper",
      "goods",
      "paper software",
      "paper app",
      "paper platform",
      "paper system",
      "paper management",
      "services paper"
  ],

  synonyms: [
      "Paper Goods platform",
      "Paper Goods software",
      "Paper Goods system",
      "paper solution",
      "paper service"
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
      "Build a paper goods platform",
      "Create a paper goods app",
      "I need a paper goods management system",
      "Build a paper goods solution",
      "Create a paper goods booking system"
  ],
};
