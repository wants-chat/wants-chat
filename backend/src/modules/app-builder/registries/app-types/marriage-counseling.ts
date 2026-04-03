/**
 * Marriage Counseling App Type Definition
 *
 * Complete definition for marriage counseling applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MARRIAGE_COUNSELING_APP_TYPE: AppTypeDefinition = {
  id: 'marriage-counseling',
  name: 'Marriage Counseling',
  category: 'services',
  description: 'Marriage Counseling platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "marriage counseling",
      "marriage",
      "counseling",
      "marriage software",
      "marriage app",
      "marriage platform",
      "marriage system",
      "marriage management",
      "services marriage"
  ],

  synonyms: [
      "Marriage Counseling platform",
      "Marriage Counseling software",
      "Marriage Counseling system",
      "marriage solution",
      "marriage service"
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
      "Build a marriage counseling platform",
      "Create a marriage counseling app",
      "I need a marriage counseling management system",
      "Build a marriage counseling solution",
      "Create a marriage counseling booking system"
  ],
};
