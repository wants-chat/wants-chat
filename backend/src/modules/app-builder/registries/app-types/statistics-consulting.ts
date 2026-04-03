/**
 * Statistics Consulting App Type Definition
 *
 * Complete definition for statistics consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STATISTICS_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'statistics-consulting',
  name: 'Statistics Consulting',
  category: 'professional-services',
  description: 'Statistics Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "statistics consulting",
      "statistics",
      "consulting",
      "statistics software",
      "statistics app",
      "statistics platform",
      "statistics system",
      "statistics management",
      "consulting statistics"
  ],

  synonyms: [
      "Statistics Consulting platform",
      "Statistics Consulting software",
      "Statistics Consulting system",
      "statistics solution",
      "statistics service"
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
      "clients",
      "projects",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "invoicing",
      "contracts",
      "documents",
      "time-tracking",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'consulting',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a statistics consulting platform",
      "Create a statistics consulting app",
      "I need a statistics consulting management system",
      "Build a statistics consulting solution",
      "Create a statistics consulting booking system"
  ],
};
