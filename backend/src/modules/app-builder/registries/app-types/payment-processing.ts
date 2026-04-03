/**
 * Payment Processing App Type Definition
 *
 * Complete definition for payment processing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PAYMENT_PROCESSING_APP_TYPE: AppTypeDefinition = {
  id: 'payment-processing',
  name: 'Payment Processing',
  category: 'services',
  description: 'Payment Processing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "payment processing",
      "payment",
      "processing",
      "payment software",
      "payment app",
      "payment platform",
      "payment system",
      "payment management",
      "services payment"
  ],

  synonyms: [
      "Payment Processing platform",
      "Payment Processing software",
      "Payment Processing system",
      "payment solution",
      "payment service"
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
      "Build a payment processing platform",
      "Create a payment processing app",
      "I need a payment processing management system",
      "Build a payment processing solution",
      "Create a payment processing booking system"
  ],
};
