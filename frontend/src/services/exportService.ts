import api from './apiService';

export interface ExportRequest {
  resumeId: string;
  format: 'pdf' | 'docx' | 'txt';
  options?: {
    customFileName?: string;
    watermark?: boolean;
  };
}

export interface ExportResponse {
  exportId: string;
  downloadUrl: string;
  fileName: string;
  size: number;
  format: string;
  expiresAt: string;
}

export interface ExportHistory {
  id: string;
  format: string;
  fileName: string;
  size: number;
  createdAt: string;
  expiresAt: string;
  isExpired: boolean;
  downloadUrl: string | null;
}

export const exportService = {
  async exportResume(request: ExportRequest): Promise<ExportResponse> {
    const response = await api.post('/export/', request);
    return response.data.data;
  },

  async getExportHistory(resumeId: string): Promise<ExportHistory[]> {
    const response = await api.get(`/export/history/${resumeId}`);
    return response.data.data;
  },

  async downloadFile(exportId: string): Promise<void> {
    const response = await api.get(`/export/download/${exportId}`, {
      responseType: 'blob'
    });

    // Create download link
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Get filename from response headers or use a default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'resume.pdf';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};