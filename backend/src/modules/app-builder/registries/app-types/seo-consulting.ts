/**
 * Seo Consulting App Type Definition
 *
 * Complete definition for seo consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SEO_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'seo-consulting',
  name: 'Seo Consulting',
  category: 'professional-services',
  description: 'Seo Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "seo consulting",
      "seo",
      "consulting",
      "seo software",
      "seo app",
      "seo platform",
      "seo system",
      "seo management",
      "consulting seo"
  ],

  synonyms: [
      "Seo Consulting platform",
      "Seo Consulting software",
      "Seo Consulting system",
      "seo solution",
      "seo service"
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
      "Build a seo consulting platform",
      "Create a seo consulting app",
      "I need a seo consulting management system",
      "Build a seo consulting solution",
      "Create a seo consulting booking system"
  ],
};
