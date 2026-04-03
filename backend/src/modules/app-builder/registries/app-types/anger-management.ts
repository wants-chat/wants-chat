/**
 * Anger Management App Type Definition
 *
 * Complete definition for anger management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ANGER_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'anger-management',
  name: 'Anger Management',
  category: 'services',
  description: 'Anger Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "anger management",
      "anger",
      "management",
      "anger software",
      "anger app",
      "anger platform",
      "anger system",
      "services anger"
  ],

  synonyms: [
      "Anger Management platform",
      "Anger Management software",
      "Anger Management system",
      "anger solution",
      "anger service"
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
      "Build a anger management platform",
      "Create a anger management app",
      "I need a anger management management system",
      "Build a anger management solution",
      "Create a anger management booking system"
  ],
};
