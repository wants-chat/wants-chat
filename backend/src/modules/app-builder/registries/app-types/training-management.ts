/**
 * Training Management App Type Definition
 *
 * Complete definition for training management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRAINING_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'training-management',
  name: 'Training Management',
  category: 'education',
  description: 'Training Management platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "training management",
      "training",
      "management",
      "training software",
      "training app",
      "training platform",
      "training system",
      "education training"
  ],

  synonyms: [
      "Training Management platform",
      "Training Management software",
      "Training Management system",
      "training solution",
      "training service"
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
      "Build a training management platform",
      "Create a training management app",
      "I need a training management management system",
      "Build a training management solution",
      "Create a training management booking system"
  ],
};
