/**
 * Vibration Analysis App Type Definition
 *
 * Complete definition for vibration analysis applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VIBRATION_ANALYSIS_APP_TYPE: AppTypeDefinition = {
  id: 'vibration-analysis',
  name: 'Vibration Analysis',
  category: 'services',
  description: 'Vibration Analysis platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "vibration analysis",
      "vibration",
      "analysis",
      "vibration software",
      "vibration app",
      "vibration platform",
      "vibration system",
      "vibration management",
      "services vibration"
  ],

  synonyms: [
      "Vibration Analysis platform",
      "Vibration Analysis software",
      "Vibration Analysis system",
      "vibration solution",
      "vibration service"
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
      "Build a vibration analysis platform",
      "Create a vibration analysis app",
      "I need a vibration analysis management system",
      "Build a vibration analysis solution",
      "Create a vibration analysis booking system"
  ],
};
