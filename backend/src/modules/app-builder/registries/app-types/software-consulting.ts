/**
 * Software Consulting App Type Definition
 *
 * Complete definition for software consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOFTWARE_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'software-consulting',
  name: 'Software Consulting',
  category: 'professional-services',
  description: 'Software Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "software consulting",
      "software",
      "consulting",
      "software software",
      "software app",
      "software platform",
      "software system",
      "software management",
      "consulting software"
  ],

  synonyms: [
      "Software Consulting platform",
      "Software Consulting software",
      "Software Consulting system",
      "software solution",
      "software service"
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
      "Build a software consulting platform",
      "Create a software consulting app",
      "I need a software consulting management system",
      "Build a software consulting solution",
      "Create a software consulting booking system"
  ],
};
