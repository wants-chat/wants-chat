/**
 * Skills Training App Type Definition
 *
 * Complete definition for skills training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SKILLS_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'skills-training',
  name: 'Skills Training',
  category: 'education',
  description: 'Skills Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "skills training",
      "skills",
      "training",
      "skills software",
      "skills app",
      "skills platform",
      "skills system",
      "skills management",
      "education skills"
  ],

  synonyms: [
      "Skills Training platform",
      "Skills Training software",
      "Skills Training system",
      "skills solution",
      "skills service"
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
      "Build a skills training platform",
      "Create a skills training app",
      "I need a skills training management system",
      "Build a skills training solution",
      "Create a skills training booking system"
  ],
};
