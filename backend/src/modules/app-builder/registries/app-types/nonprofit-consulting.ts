/**
 * Nonprofit Consulting App Type Definition
 *
 * Complete definition for nonprofit consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NONPROFIT_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'nonprofit-consulting',
  name: 'Nonprofit Consulting',
  category: 'professional-services',
  description: 'Nonprofit Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "nonprofit consulting",
      "nonprofit",
      "consulting",
      "nonprofit software",
      "nonprofit app",
      "nonprofit platform",
      "nonprofit system",
      "nonprofit management",
      "consulting nonprofit"
  ],

  synonyms: [
      "Nonprofit Consulting platform",
      "Nonprofit Consulting software",
      "Nonprofit Consulting system",
      "nonprofit solution",
      "nonprofit service"
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
      "Build a nonprofit consulting platform",
      "Create a nonprofit consulting app",
      "I need a nonprofit consulting management system",
      "Build a nonprofit consulting solution",
      "Create a nonprofit consulting booking system"
  ],
};
