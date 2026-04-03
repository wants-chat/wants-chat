/**
 * Technical Recruiting App Type Definition
 *
 * Complete definition for technical recruiting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TECHNICAL_RECRUITING_APP_TYPE: AppTypeDefinition = {
  id: 'technical-recruiting',
  name: 'Technical Recruiting',
  category: 'technology',
  description: 'Technical Recruiting platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "technical recruiting",
      "technical",
      "recruiting",
      "technical software",
      "technical app",
      "technical platform",
      "technical system",
      "technical management",
      "technology technical"
  ],

  synonyms: [
      "Technical Recruiting platform",
      "Technical Recruiting software",
      "Technical Recruiting system",
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
      "projects",
      "tasks",
      "documents",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "time-tracking",
      "invoicing",
      "clients",
      "reporting",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'technology',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a technical recruiting platform",
      "Create a technical recruiting app",
      "I need a technical recruiting management system",
      "Build a technical recruiting solution",
      "Create a technical recruiting booking system"
  ],
};
