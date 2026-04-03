/**
 * Writing Consulting App Type Definition
 *
 * Complete definition for writing consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WRITING_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'writing-consulting',
  name: 'Writing Consulting',
  category: 'professional-services',
  description: 'Writing Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "writing consulting",
      "writing",
      "consulting",
      "writing software",
      "writing app",
      "writing platform",
      "writing system",
      "writing management",
      "consulting writing"
  ],

  synonyms: [
      "Writing Consulting platform",
      "Writing Consulting software",
      "Writing Consulting system",
      "writing solution",
      "writing service"
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
      "Build a writing consulting platform",
      "Create a writing consulting app",
      "I need a writing consulting management system",
      "Build a writing consulting solution",
      "Create a writing consulting booking system"
  ],
};
