import api from './api';
import {
  StudentLearningAnalytics,
  SimulationComparisonData,
  ClassroomAnalyticsData,
  AdminPlatformAnalyticsData,
  ReportExportParams
} from '../types/analytics';

export const analyticsService = {
  /**
   * Fetch detailed student learning analytics
   */
  async getStudentAnalytics(studentId?: string, period: string = '30d'): Promise<StudentLearningAnalytics> {
    const endpoint = studentId ? `/analytics/student/${studentId}` : '/analytics/student';
    const response = await api.get(endpoint, {
      params: { period }
    });
    return response.data.data;
  },

  /**
   * Fetch rule-based groundwater learning insights and comparative simulation analysis
   */
  async getGroundwaterInsights(params: {
    studentId?: string;
    simulationRunId?: string;
    baselineRunId?: string;
    interventionRunId?: string;
  } = {}): Promise<SimulationComparisonData> {
    const response = await api.get('/analytics/insights/groundwater', {
      params
    });
    return response.data.data;
  },

  /**
   * Fetch classroom analytics for teachers
   */
  async getTeacherAnalytics(period: string = '30d'): Promise<ClassroomAnalyticsData> {
    const response = await api.get('/analytics/teacher', {
      params: { period }
    });
    return response.data.data;
  },

  /**
   * Fetch global platform analytics for administrators
   */
  async getAdminAnalytics(period: string = '30d'): Promise<AdminPlatformAnalyticsData> {
    const response = await api.get('/analytics/admin', {
      params: { period }
    });
    return response.data.data;
  },

  /**
   * Download or preview reports (CSV, HTML Printable, or JSON)
   */
  async exportReport(params: ReportExportParams): Promise<void> {
    const response = await api.get('/analytics/reports', {
      params,
      responseType: params.format === 'json' ? 'json' : 'blob'
    });

    if (params.format === 'json') {
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${params.reportType.toLowerCase()}-report.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return;
    }

    if (params.format === 'html') {
      const blob = new Blob([response.data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      return;
    }

    // Default CSV file download
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${params.reportType.toLowerCase()}-report.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};
