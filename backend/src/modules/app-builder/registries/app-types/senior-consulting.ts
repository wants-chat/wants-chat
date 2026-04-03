/**
 * Senior Consulting App Type Definition
 *
 * Complete definition for senior consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SENIOR_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'senior-consulting',
  name: 'Senior Consulting',
  category: 'professional-services',
  description: 'Senior Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "senior consulting",
      "senior",
      "consulting",
      "senior software",
      "senior app",
      "senior platform",
      "senior system",
      "senior management",
      "consulting senior"
  ],

  synonyms: [
      "Senior Consulting platform",
      "Senior Consulting software",
      "Senior Consulting system",
      "senior solution",
      "senior service"
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
      "Build a senior consulting platform",
      "Create a senior consulting app",
      "I need a senior consulting management system",
      "Build a senior consulting solution",
      "Create a senior consulting booking system"
  ],
};
