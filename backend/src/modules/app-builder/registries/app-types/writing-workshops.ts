/**
 * Writing Workshops App Type Definition
 *
 * Complete definition for writing workshops applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WRITING_WORKSHOPS_APP_TYPE: AppTypeDefinition = {
  id: 'writing-workshops',
  name: 'Writing Workshops',
  category: 'retail',
  description: 'Writing Workshops platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "writing workshops",
      "writing",
      "workshops",
      "writing software",
      "writing app",
      "writing platform",
      "writing system",
      "writing management",
      "retail writing"
  ],

  synonyms: [
      "Writing Workshops platform",
      "Writing Workshops software",
      "Writing Workshops system",
      "writing solution",
      "writing service"
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
      "product-catalog",
      "orders",
      "pos-system",
      "inventory",
      "notifications"
  ],

  optionalFeatures: [
      "payments",
      "discounts",
      "reviews",
      "analytics",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'retail',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'clean',

  examplePrompts: [
      "Build a writing workshops platform",
      "Create a writing workshops app",
      "I need a writing workshops management system",
      "Build a writing workshops solution",
      "Create a writing workshops booking system"
  ],
};
