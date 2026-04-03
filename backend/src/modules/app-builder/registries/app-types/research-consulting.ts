/**
 * Research Consulting App Type Definition
 *
 * Complete definition for research consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RESEARCH_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'research-consulting',
  name: 'Research Consulting',
  category: 'professional-services',
  description: 'Research Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "research consulting",
      "research",
      "consulting",
      "research software",
      "research app",
      "research platform",
      "research system",
      "research management",
      "consulting research"
  ],

  synonyms: [
      "Research Consulting platform",
      "Research Consulting software",
      "Research Consulting system",
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
      "Build a research consulting platform",
      "Create a research consulting app",
      "I need a research consulting management system",
      "Build a research consulting solution",
      "Create a research consulting booking system"
  ],
};
