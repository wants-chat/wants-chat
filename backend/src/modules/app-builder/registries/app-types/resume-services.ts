/**
 * Resume Services App Type Definition
 *
 * Complete definition for resume services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RESUME_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'resume-services',
  name: 'Resume Services',
  category: 'services',
  description: 'Resume Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "resume services",
      "resume",
      "services",
      "resume software",
      "resume app",
      "resume platform",
      "resume system",
      "resume management",
      "services resume"
  ],

  synonyms: [
      "Resume Services platform",
      "Resume Services software",
      "Resume Services system",
      "resume solution",
      "resume service"
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
      "Build a resume services platform",
      "Create a resume services app",
      "I need a resume services management system",
      "Build a resume services solution",
      "Create a resume services booking system"
  ],
};
