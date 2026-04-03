/**
 * Technology Services App Type Definition
 *
 * Complete definition for technology services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TECHNOLOGY_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'technology-services',
  name: 'Technology Services',
  category: 'technology',
  description: 'Technology Services platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "technology services",
      "technology",
      "services",
      "technology software",
      "technology app",
      "technology platform",
      "technology system",
      "technology management",
      "technology technology"
  ],

  synonyms: [
      "Technology Services platform",
      "Technology Services software",
      "Technology Services system",
      "technology solution",
      "technology service"
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
      "Build a technology services platform",
      "Create a technology services app",
      "I need a technology services management system",
      "Build a technology services solution",
      "Create a technology services booking system"
  ],
};
