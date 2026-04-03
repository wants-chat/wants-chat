/**
 * Security Training App Type Definition
 *
 * Complete definition for security training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SECURITY_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'security-training',
  name: 'Security Training',
  category: 'education',
  description: 'Security Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "security training",
      "security",
      "training",
      "security software",
      "security app",
      "security platform",
      "security system",
      "security management",
      "education security"
  ],

  synonyms: [
      "Security Training platform",
      "Security Training software",
      "Security Training system",
      "security solution",
      "security service"
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
      "Build a security training platform",
      "Create a security training app",
      "I need a security training management system",
      "Build a security training solution",
      "Create a security training booking system"
  ],
};
