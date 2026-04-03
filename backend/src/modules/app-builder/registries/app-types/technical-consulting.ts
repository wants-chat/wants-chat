/**
 * Technical Consulting App Type Definition
 *
 * Complete definition for technical consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TECHNICAL_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'technical-consulting',
  name: 'Technical Consulting',
  category: 'professional-services',
  description: 'Technical Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "technical consulting",
      "technical",
      "consulting",
      "technical software",
      "technical app",
      "technical platform",
      "technical system",
      "technical management",
      "consulting technical"
  ],

  synonyms: [
      "Technical Consulting platform",
      "Technical Consulting software",
      "Technical Consulting system",
      "technical solution",
      "technical service"
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
      "Build a technical consulting platform",
      "Create a technical consulting app",
      "I need a technical consulting management system",
      "Build a technical consulting solution",
      "Create a technical consulting booking system"
  ],
};
