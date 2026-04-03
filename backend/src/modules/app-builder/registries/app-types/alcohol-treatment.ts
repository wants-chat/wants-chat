/**
 * Alcohol Treatment App Type Definition
 *
 * Complete definition for alcohol treatment applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ALCOHOL_TREATMENT_APP_TYPE: AppTypeDefinition = {
  id: 'alcohol-treatment',
  name: 'Alcohol Treatment',
  category: 'services',
  description: 'Alcohol Treatment platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "alcohol treatment",
      "alcohol",
      "treatment",
      "alcohol software",
      "alcohol app",
      "alcohol platform",
      "alcohol system",
      "alcohol management",
      "services alcohol"
  ],

  synonyms: [
      "Alcohol Treatment platform",
      "Alcohol Treatment software",
      "Alcohol Treatment system",
      "alcohol solution",
      "alcohol service"
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
      "Build a alcohol treatment platform",
      "Create a alcohol treatment app",
      "I need a alcohol treatment management system",
      "Build a alcohol treatment solution",
      "Create a alcohol treatment booking system"
  ],
};
