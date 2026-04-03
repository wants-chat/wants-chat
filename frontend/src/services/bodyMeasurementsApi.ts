import { api } from '../lib/api';

export interface BodyMeasurement {
  id: string;
  user_id: string;
  measurement_type: 'weight' | 'body_fat' | 'chest' | 'waist' | 'hips' | 'biceps' | 'thighs' | 'calves';
  value: number;
  unit: 'kg' | 'cm' | '%';
  recorded_at: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBodyMeasurementRequest {
  weight?: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  biceps?: number;
  thighs?: number;
  calves?: number;
  measurementDate?: string;
  notes?: string;
}

export interface BodyMeasurementAnalytics {
  [key: string]: {
    type: string;
    current: number;
    data: Array<{
      date: string;
      value: number;
    }>;
  };
}

export interface BodyMeasurementsResponse {
  data: BodyMeasurement[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

class BodyMeasurementsApiService {
  private baseUrl = '/fitness';

  async getBodyMeasurements(params?: {
    measurement_type?: string;
    page?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<BodyMeasurementsResponse> {
    const queryParams = new URLSearchParams();

    if (params?.measurement_type) queryParams.append('measurement_type', params.measurement_type);

    // Ensure page and limit are valid positive integers
    if (params?.page !== undefined) {
      const pageNum = Number(params.page);
      if (Number.isInteger(pageNum) && pageNum > 0) {
        queryParams.append('page', pageNum.toString());
      }
    }

    if (params?.limit !== undefined) {
      const limitNum = Number(params.limit);
      if (Number.isInteger(limitNum) && limitNum > 0) {
        queryParams.append('limit', limitNum.toString());
      }
    }

    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const queryString = queryParams.toString();
    const url = `${this.baseUrl}/body-measurements${queryString ? `?${queryString}` : ''}`;

    return await api.request(url);
  }

  async createBodyMeasurement(data: CreateBodyMeasurementRequest): Promise<any> {
    return await api.request(`${this.baseUrl}/body-measurements`, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        measurementDate: data.measurementDate || new Date().toISOString()
      })
    });
  }

  async getLatestMeasurements(): Promise<any> {
    try {
      // Call without any parameters to avoid validation issues
      // The backend will return the default limit (10) and we'll use the first item
      const response = await api.request(`${this.baseUrl}/body-measurements`);

      if (response.data && response.data.length > 0) {
        // Return the latest measurement record (first one since they're sorted by date desc)
        return response.data[0];
      }

      return {};
    } catch (error) {
      console.error('Error fetching latest measurements:', error);
      return {};
    }
  }

  async getBodyMeasurementAnalytics(days: number = 100): Promise<BodyMeasurementAnalytics> {
    return await api.request(`${this.baseUrl}/body-measurements/analytics?days=${days}`);
  }
}

export const bodyMeasurementsApiService = new BodyMeasurementsApiService();
export default bodyMeasurementsApiService;