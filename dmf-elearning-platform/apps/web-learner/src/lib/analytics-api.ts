import type {
  UserStats,
  LearningInsights,
  SystemMetrics,
  ChartData,
  RecommendationsResponse,
} from '@/types/analytics';

export class AnalyticsAPI {
  /**
   * Get comprehensive user statistics
   */
  static async getUserStats(
    userId: string,
    period: 'all' | 'week' | 'month' | 'year' = 'all'
  ): Promise<UserStats> {
    const response = await fetch(
      `/api/analytics/user-stats?userId=${userId}&period=${period}`
    );
    if (!response.ok) throw new Error('Failed to fetch user stats');
    return response.json();
  }

  /**
   * Get detailed learning insights with timelines
   */
  static async getLearningInsights(
    userId: string,
    days: number = 30
  ): Promise<LearningInsights> {
    const response = await fetch(
      `/api/analytics/learning-insights?userId=${userId}&days=${days}`
    );
    if (!response.ok) throw new Error('Failed to fetch learning insights');
    return response.json();
  }

  /**
   * Get system-wide metrics
   */
  static async getSystemMetrics(
    period: '24h' | '7d' | '30d' = '24h'
  ): Promise<SystemMetrics> {
    const response = await fetch(`/api/analytics/system-metrics?period=${period}`);
    if (!response.ok) throw new Error('Failed to fetch system metrics');
    return response.json();
  }

  /**
   * Get chart data for visualizations
   */
  static async getChartData(
    userId: string,
    type?: 'progress' | 'skills' | 'time' | 'activity' | 'achievements',
    days: number = 30
  ): Promise<ChartData> {
    const params = new URLSearchParams({
      userId,
      days: days.toString(),
    });
    if (type) params.append('type', type);

    const response = await fetch(`/api/analytics/charts?${params}`);
    if (!response.ok) throw new Error('Failed to fetch chart data');
    return response.json();
  }

  /**
   * Get personalized recommendations
   */
  static async getRecommendations(userId: string): Promise<RecommendationsResponse> {
    const response = await fetch(`/api/analytics/recommendations?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch recommendations');
    return response.json();
  }

  /**
   * Export user data as CSV
   */
  static async exportCSV(
    userId: string,
    options?: {
      type?: 'full' | 'vocabulary' | 'reading' | 'listening' | 'speaking' | 'writing';
      startDate?: string;
      endDate?: string;
    }
  ): Promise<void> {
    const params = new URLSearchParams({
      userId,
      format: 'csv',
    });
    if (options?.type) params.append('type', options.type);
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);

    window.location.href = `/api/analytics/export?${params}`;
  }

  /**
   * Export user data as JSON
   */
  static async exportJSON(
    userId: string,
    options?: {
      type?: 'full' | 'vocabulary' | 'reading' | 'listening' | 'speaking' | 'writing';
      startDate?: string;
      endDate?: string;
    }
  ): Promise<void> {
    const params = new URLSearchParams({
      userId,
      format: 'json',
    });
    if (options?.type) params.append('type', options.type);
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);

    window.location.href = `/api/analytics/export?${params}`;
  }

  /**
   * Export user report as PDF
   */
  static async exportPDF(
    userId: string,
    options?: {
      startDate?: string;
      endDate?: string;
    }
  ): Promise<void> {
    const params = new URLSearchParams({ userId });
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);

    window.location.href = `/api/analytics/export-pdf?${params}`;
  }
}
