/**
 * Legal Consulting App Type Definition
 *
 * Complete definition for legal consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LEGAL_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'legal-consulting',
  name: 'Legal Consulting',
  category: 'professional-services',
  description: 'Legal Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "legal consulting",
      "legal",
      "consulting",
      "legal software",
      "legal app",
      "legal platform",
      "legal system",
      "legal management",
      "consulting legal"
  ],

  synonyms: [
      "Legal Consulting platform",
      "Legal Consulting software",
      "Legal Consulting system",
      "legal solution",
      "legal service"
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
      "Build a legal consulting platform",
      "Create a legal consulting app",
      "I need a legal consulting management system",
      "Build a legal consulting solution",
      "Create a legal consulting booking system"
  ],
};
