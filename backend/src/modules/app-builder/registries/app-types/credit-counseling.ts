/**
 * Credit Counseling App Type Definition
 *
 * Complete definition for credit counseling applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CREDIT_COUNSELING_APP_TYPE: AppTypeDefinition = {
  id: 'credit-counseling',
  name: 'Credit Counseling',
  category: 'technology',
  description: 'Credit Counseling platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "credit counseling",
      "credit",
      "counseling",
      "credit software",
      "credit app",
      "credit platform",
      "credit system",
      "credit management",
      "technology credit"
  ],

  synonyms: [
      "Credit Counseling platform",
      "Credit Counseling software",
      "Credit Counseling system",
      "credit solution",
      "credit service"
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
      "projects",
      "tasks",
      "documents",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "time-tracking",
      "invoicing",
      "clients",
      "reporting",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'technology',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a credit counseling platform",
      "Create a credit counseling app",
      "I need a credit counseling management system",
      "Build a credit counseling solution",
      "Create a credit counseling booking system"
  ],
};
