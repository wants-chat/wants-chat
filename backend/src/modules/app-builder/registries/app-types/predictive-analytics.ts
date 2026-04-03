/**
 * Predictive Analytics App Type Definition
 *
 * Complete definition for predictive analytics applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PREDICTIVE_ANALYTICS_APP_TYPE: AppTypeDefinition = {
  id: 'predictive-analytics',
  name: 'Predictive Analytics',
  category: 'services',
  description: 'Predictive Analytics platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "predictive analytics",
      "predictive",
      "analytics",
      "predictive software",
      "predictive app",
      "predictive platform",
      "predictive system",
      "predictive management",
      "services predictive"
  ],

  synonyms: [
      "Predictive Analytics platform",
      "Predictive Analytics software",
      "Predictive Analytics system",
      "predictive solution",
      "predictive service"
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
      "Build a predictive analytics platform",
      "Create a predictive analytics app",
      "I need a predictive analytics management system",
      "Build a predictive analytics solution",
      "Create a predictive analytics booking system"
  ],
};
