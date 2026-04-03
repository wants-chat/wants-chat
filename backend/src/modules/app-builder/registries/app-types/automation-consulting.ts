/**
 * Automation Consulting App Type Definition
 *
 * Complete definition for automation consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUTOMATION_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'automation-consulting',
  name: 'Automation Consulting',
  category: 'professional-services',
  description: 'Automation Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "automation consulting",
      "automation",
      "consulting",
      "automation software",
      "automation app",
      "automation platform",
      "automation system",
      "automation management",
      "consulting automation"
  ],

  synonyms: [
      "Automation Consulting platform",
      "Automation Consulting software",
      "Automation Consulting system",
      "automation solution",
      "automation service"
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
      "Build a automation consulting platform",
      "Create a automation consulting app",
      "I need a automation consulting management system",
      "Build a automation consulting solution",
      "Create a automation consulting booking system"
  ],
};
