/**
 * Litigation Support App Type Definition
 *
 * Complete definition for litigation support applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LITIGATION_SUPPORT_APP_TYPE: AppTypeDefinition = {
  id: 'litigation-support',
  name: 'Litigation Support',
  category: 'services',
  description: 'Litigation Support platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "litigation support",
      "litigation",
      "support",
      "litigation software",
      "litigation app",
      "litigation platform",
      "litigation system",
      "litigation management",
      "services litigation"
  ],

  synonyms: [
      "Litigation Support platform",
      "Litigation Support software",
      "Litigation Support system",
      "litigation solution",
      "litigation service"
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
      "Build a litigation support platform",
      "Create a litigation support app",
      "I need a litigation support management system",
      "Build a litigation support solution",
      "Create a litigation support booking system"
  ],
};
