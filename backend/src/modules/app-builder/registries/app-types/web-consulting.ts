/**
 * Web Consulting App Type Definition
 *
 * Complete definition for web consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEB_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'web-consulting',
  name: 'Web Consulting',
  category: 'professional-services',
  description: 'Web Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "web consulting",
      "web",
      "consulting",
      "web software",
      "web app",
      "web platform",
      "web system",
      "web management",
      "consulting web"
  ],

  synonyms: [
      "Web Consulting platform",
      "Web Consulting software",
      "Web Consulting system",
      "web solution",
      "web service"
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
      "Build a web consulting platform",
      "Create a web consulting app",
      "I need a web consulting management system",
      "Build a web consulting solution",
      "Create a web consulting booking system"
  ],
};
