/**
 * Workplace Consulting App Type Definition
 *
 * Complete definition for workplace consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WORKPLACE_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'workplace-consulting',
  name: 'Workplace Consulting',
  category: 'professional-services',
  description: 'Workplace Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "workplace consulting",
      "workplace",
      "consulting",
      "workplace software",
      "workplace app",
      "workplace platform",
      "workplace system",
      "workplace management",
      "consulting workplace"
  ],

  synonyms: [
      "Workplace Consulting platform",
      "Workplace Consulting software",
      "Workplace Consulting system",
      "workplace solution",
      "workplace service"
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
      "Build a workplace consulting platform",
      "Create a workplace consulting app",
      "I need a workplace consulting management system",
      "Build a workplace consulting solution",
      "Create a workplace consulting booking system"
  ],
};
