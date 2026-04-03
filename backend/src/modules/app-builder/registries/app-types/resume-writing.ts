/**
 * Resume Writing App Type Definition
 *
 * Complete definition for resume writing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RESUME_WRITING_APP_TYPE: AppTypeDefinition = {
  id: 'resume-writing',
  name: 'Resume Writing',
  category: 'services',
  description: 'Resume Writing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "resume writing",
      "resume",
      "writing",
      "resume software",
      "resume app",
      "resume platform",
      "resume system",
      "resume management",
      "services resume"
  ],

  synonyms: [
      "Resume Writing platform",
      "Resume Writing software",
      "Resume Writing system",
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
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a resume writing platform",
      "Create a resume writing app",
      "I need a resume writing management system",
      "Build a resume writing solution",
      "Create a resume writing booking system"
  ],
};
