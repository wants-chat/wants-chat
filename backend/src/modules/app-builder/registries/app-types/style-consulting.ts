/**
 * Style Consulting App Type Definition
 *
 * Complete definition for style consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STYLE_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'style-consulting',
  name: 'Style Consulting',
  category: 'professional-services',
  description: 'Style Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "style consulting",
      "style",
      "consulting",
      "style software",
      "style app",
      "style platform",
      "style system",
      "style management",
      "consulting style"
  ],

  synonyms: [
      "Style Consulting platform",
      "Style Consulting software",
      "Style Consulting system",
      "style solution",
      "style service"
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
      "Build a style consulting platform",
      "Create a style consulting app",
      "I need a style consulting management system",
      "Build a style consulting solution",
      "Create a style consulting booking system"
  ],
};
