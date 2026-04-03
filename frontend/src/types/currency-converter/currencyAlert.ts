/**
 * Currency Alert types based on the provided API schema
 */

export type AlertType = 'above' | 'below' | 'change';
export type AlertFrequency = 'once' | 'daily' | 'weekly' | 'monthly';

export interface CurrencyAlert {
  id: string;
  userId: string;
  name: string;
  baseCurrency: string;
  targetCurrency: string;
  alertType: AlertType;
  threshold: number;
  frequency: AlertFrequency;
  isActive: boolean;
  emailNotification: boolean;
  pushNotification: boolean;
  currentRate: number;
  lastTriggeredAt: string | null;
  triggerCount: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  // Legacy snake_case for backward compatibility
  user_id?: string;
  base_currency?: string;
  target_currency?: string;
  alert_type?: AlertType;
  is_active?: boolean;
  email_notification?: boolean;
  push_notification?: boolean;
  current_rate?: number;
  last_triggered_at?: string | null;
  trigger_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CurrencyAlertFormData {
  name: string;
  baseCurrency: string;
  targetCurrency: string;
  alertType: AlertType;
  threshold: number;
  frequency: AlertFrequency;
  emailNotification: boolean;
  pushNotification: boolean;
  // Legacy
  base_currency?: string;
  target_currency?: string;
  alert_type?: AlertType;
  email_notification?: boolean;
  push_notification?: boolean;
}

export interface CurrencyAlertResponse {
  data: CurrencyAlert[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  // Legacy
  total_pages?: number;
}

export interface CreateAlertRequest extends Omit<CurrencyAlert, 'id' | 'userId' | 'currentRate' | 'lastTriggeredAt' | 'triggerCount' | 'createdAt' | 'updatedAt' | 'user_id' | 'current_rate' | 'last_triggered_at' | 'trigger_count' | 'created_at' | 'updated_at'> {
  // Additional fields that might be needed for creation
}

export interface UpdateAlertRequest extends Partial<CreateAlertRequest> {
  // Partial update of alert fields
}
