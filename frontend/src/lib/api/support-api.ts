import { api } from '../api';

export type SupportType = 'bug' | 'billing' | 'account' | 'feature' | 'other';

export interface SupportRequest {
  name: string;
  email: string;
  supportType: SupportType;
  subject: string;
  message: string;
}

export interface SupportResponse {
  success: boolean;
  ticketId?: string;
  message: string;
}

export const supportApi = {
  async submitRequest(data: SupportRequest): Promise<SupportResponse> {
    // Placeholder - will be connected to backend later
    console.log('Support request submitted:', data);
    return {
      success: true,
      ticketId: `TICKET-${Date.now()}`,
      message: 'Your support request has been submitted successfully.',
    };
  },
};
