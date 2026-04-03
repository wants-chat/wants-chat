/**
 * Trial Consulting App Type Definition
 *
 * Complete definition for trial consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRIAL_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'trial-consulting',
  name: 'Trial Consulting',
  category: 'professional-services',
  description: 'Trial Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "trial consulting",
      "trial",
      "consulting",
      "trial software",
      "trial app",
      "trial platform",
      "trial system",
      "trial management",
      "consulting trial"
  ],

  synonyms: [
      "Trial Consulting platform",
      "Trial Consulting software",
      "Trial Consulting system",
      "trial solution",
      "trial service"
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
      "Build a trial consulting platform",
      "Create a trial consulting app",
      "I need a trial consulting management system",
      "Build a trial consulting solution",
      "Create a trial consulting booking system"
  ],
};
