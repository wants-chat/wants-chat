/**
 * Job Training App Type Definition
 *
 * Complete definition for job training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const JOB_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'job-training',
  name: 'Job Training',
  category: 'education',
  description: 'Job Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "job training",
      "job",
      "training",
      "job software",
      "job app",
      "job platform",
      "job system",
      "job management",
      "education job"
  ],

  synonyms: [
      "Job Training platform",
      "Job Training software",
      "Job Training system",
      "job solution",
      "job service"
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
      "Build a job training platform",
      "Create a job training app",
      "I need a job training management system",
      "Build a job training solution",
      "Create a job training booking system"
  ],
};
