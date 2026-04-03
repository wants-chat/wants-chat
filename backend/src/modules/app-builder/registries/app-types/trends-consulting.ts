/**
 * Trends Consulting App Type Definition
 *
 * Complete definition for trends consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRENDS_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'trends-consulting',
  name: 'Trends Consulting',
  category: 'professional-services',
  description: 'Trends Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "trends consulting",
      "trends",
      "consulting",
      "trends software",
      "trends app",
      "trends platform",
      "trends system",
      "trends management",
      "consulting trends"
  ],

  synonyms: [
      "Trends Consulting platform",
      "Trends Consulting software",
      "Trends Consulting system",
      "trends solution",
      "trends service"
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
      "Build a trends consulting platform",
      "Create a trends consulting app",
      "I need a trends consulting management system",
      "Build a trends consulting solution",
      "Create a trends consulting booking system"
  ],
};
