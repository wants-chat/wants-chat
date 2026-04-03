/**
 * Technology Training App Type Definition
 *
 * Complete definition for technology training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TECHNOLOGY_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'technology-training',
  name: 'Technology Training',
  category: 'education',
  description: 'Technology Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "technology training",
      "technology",
      "training",
      "technology software",
      "technology app",
      "technology platform",
      "technology system",
      "technology management",
      "education technology"
  ],

  synonyms: [
      "Technology Training platform",
      "Technology Training software",
      "Technology Training system",
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
          "name": "Instructor",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "Student",
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
      "course-management",
      "enrollment",
      "calendar",
      "certificates",
      "notifications"
  ],

  optionalFeatures: [
      "lms",
      "assignments",
      "payments",
      "attendance",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'education',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a technology training platform",
      "Create a technology training app",
      "I need a technology training management system",
      "Build a technology training solution",
      "Create a technology training booking system"
  ],
};
