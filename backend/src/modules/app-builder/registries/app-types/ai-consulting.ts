/**
 * Ai Consulting App Type Definition
 *
 * Complete definition for ai consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AI_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'ai-consulting',
  name: 'Ai Consulting',
  category: 'professional-services',
  description: 'Ai Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "ai consulting",
      "consulting",
      "ai software",
      "ai app",
      "ai platform",
      "ai system",
      "ai management",
      "consulting ai"
  ],

  synonyms: [
      "Ai Consulting platform",
      "Ai Consulting software",
      "Ai Consulting system",
      "ai solution",
      "ai service"
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
      "Build a ai consulting platform",
      "Create a ai consulting app",
      "I need a ai consulting management system",
      "Build a ai consulting solution",
      "Create a ai consulting booking system"
  ],
};
