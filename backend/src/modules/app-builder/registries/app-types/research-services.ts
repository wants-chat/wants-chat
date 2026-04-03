/**
 * Research Services App Type Definition
 *
 * Complete definition for research services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RESEARCH_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'research-services',
  name: 'Research Services',
  category: 'services',
  description: 'Research Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "research services",
      "research",
      "services",
      "research software",
      "research app",
      "research platform",
      "research system",
      "research management",
      "services research"
  ],

  synonyms: [
      "Research Services platform",
      "Research Services software",
      "Research Services system",
      "research solution",
      "research service"
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
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "clients",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a research services platform",
      "Create a research services app",
      "I need a research services management system",
      "Build a research services solution",
      "Create a research services booking system"
  ],
};
