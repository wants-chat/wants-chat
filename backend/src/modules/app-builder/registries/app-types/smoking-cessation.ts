/**
 * Smoking Cessation App Type Definition
 *
 * Complete definition for smoking cessation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SMOKING_CESSATION_APP_TYPE: AppTypeDefinition = {
  id: 'smoking-cessation',
  name: 'Smoking Cessation',
  category: 'services',
  description: 'Smoking Cessation platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "smoking cessation",
      "smoking",
      "cessation",
      "smoking software",
      "smoking app",
      "smoking platform",
      "smoking system",
      "smoking management",
      "services smoking"
  ],

  synonyms: [
      "Smoking Cessation platform",
      "Smoking Cessation software",
      "Smoking Cessation system",
      "smoking solution",
      "smoking service"
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
      "Build a smoking cessation platform",
      "Create a smoking cessation app",
      "I need a smoking cessation management system",
      "Build a smoking cessation solution",
      "Create a smoking cessation booking system"
  ],
};
