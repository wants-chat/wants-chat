/**
 * Technology Consulting App Type Definition
 *
 * Complete definition for technology consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TECHNOLOGY_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'technology-consulting',
  name: 'Technology Consulting',
  category: 'professional-services',
  description: 'Technology Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "technology consulting",
      "technology",
      "consulting",
      "technology software",
      "technology app",
      "technology platform",
      "technology system",
      "technology management",
      "consulting technology"
  ],

  synonyms: [
      "Technology Consulting platform",
      "Technology Consulting software",
      "Technology Consulting system",
      "technology solution",
      "technology service"
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
      "Build a technology consulting platform",
      "Create a technology consulting app",
      "I need a technology consulting management system",
      "Build a technology consulting solution",
      "Create a technology consulting booking system"
  ],
};
