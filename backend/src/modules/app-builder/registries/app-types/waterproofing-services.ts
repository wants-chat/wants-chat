/**
 * Waterproofing Services App Type Definition
 *
 * Complete definition for waterproofing services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WATERPROOFING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'waterproofing-services',
  name: 'Waterproofing Services',
  category: 'construction',
  description: 'Waterproofing Services platform with comprehensive management features',
  icon: 'house',

  keywords: [
      "waterproofing services",
      "waterproofing",
      "services",
      "waterproofing software",
      "waterproofing app",
      "waterproofing platform",
      "waterproofing system",
      "waterproofing management",
      "trades waterproofing"
  ],

  synonyms: [
      "Waterproofing Services platform",
      "Waterproofing Services software",
      "Waterproofing Services system",
      "waterproofing solution",
      "waterproofing service"
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
      "project-bids",
      "scheduling",
      "invoicing",
      "clients",
      "notifications"
  ],

  optionalFeatures: [
      "documents",
      "payments",
      "reviews",
      "gallery",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'trades',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a waterproofing services platform",
      "Create a waterproofing services app",
      "I need a waterproofing services management system",
      "Build a waterproofing services solution",
      "Create a waterproofing services booking system"
  ],
};
