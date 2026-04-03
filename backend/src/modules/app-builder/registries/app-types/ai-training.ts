/**
 * Ai Training App Type Definition
 *
 * Complete definition for ai training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AI_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'ai-training',
  name: 'Ai Training',
  category: 'education',
  description: 'Ai Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "ai training",
      "training",
      "ai software",
      "ai app",
      "ai platform",
      "ai system",
      "ai management",
      "education ai"
  ],

  synonyms: [
      "Ai Training platform",
      "Ai Training software",
      "Ai Training system",
      "ai solution",
      "ai service"
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
      "Build a ai training platform",
      "Create a ai training app",
      "I need a ai training management system",
      "Build a ai training solution",
      "Create a ai training booking system"
  ],
};
