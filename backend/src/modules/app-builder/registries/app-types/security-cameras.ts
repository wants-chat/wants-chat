/**
 * Security Cameras App Type Definition
 *
 * Complete definition for security cameras applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SECURITY_CAMERAS_APP_TYPE: AppTypeDefinition = {
  id: 'security-cameras',
  name: 'Security Cameras',
  category: 'services',
  description: 'Security Cameras platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "security cameras",
      "security",
      "cameras",
      "security software",
      "security app",
      "security platform",
      "security system",
      "security management",
      "services security"
  ],

  synonyms: [
      "Security Cameras platform",
      "Security Cameras software",
      "Security Cameras system",
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
      "Build a security cameras platform",
      "Create a security cameras app",
      "I need a security cameras management system",
      "Build a security cameras solution",
      "Create a security cameras booking system"
  ],
};
