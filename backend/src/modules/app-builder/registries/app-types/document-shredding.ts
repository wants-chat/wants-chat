/**
 * Document Shredding App Type Definition
 *
 * Complete definition for document shredding applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DOCUMENT_SHREDDING_APP_TYPE: AppTypeDefinition = {
  id: 'document-shredding',
  name: 'Document Shredding',
  category: 'services',
  description: 'Document Shredding platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "document shredding",
      "document",
      "shredding",
      "document software",
      "document app",
      "document platform",
      "document system",
      "document management",
      "services document"
  ],

  synonyms: [
      "Document Shredding platform",
      "Document Shredding software",
      "Document Shredding system",
      "document solution",
      "document service"
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
      "Build a document shredding platform",
      "Create a document shredding app",
      "I need a document shredding management system",
      "Build a document shredding solution",
      "Create a document shredding booking system"
  ],
};
