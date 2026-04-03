/**
 * Statistical Analysis App Type Definition
 *
 * Complete definition for statistical analysis applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STATISTICAL_ANALYSIS_APP_TYPE: AppTypeDefinition = {
  id: 'statistical-analysis',
  name: 'Statistical Analysis',
  category: 'services',
  description: 'Statistical Analysis platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "statistical analysis",
      "statistical",
      "analysis",
      "statistical software",
      "statistical app",
      "statistical platform",
      "statistical system",
      "statistical management",
      "services statistical"
  ],

  synonyms: [
      "Statistical Analysis platform",
      "Statistical Analysis software",
      "Statistical Analysis system",
      "statistical solution",
      "statistical service"
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
      "Build a statistical analysis platform",
      "Create a statistical analysis app",
      "I need a statistical analysis management system",
      "Build a statistical analysis solution",
      "Create a statistical analysis booking system"
  ],
};
