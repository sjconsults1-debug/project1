import api from './apiService';

export interface ShareLink {
  shareId: string;
  shareUrl: string;
  qrCode: string;
  isPublic: boolean;
  isPasswordProtected: boolean;
  expiresAt: string;
  totalViews: number;
  totalDownloads: number;
  created: string;
  lastAccessed: string | null;
  owner: {
    id: string;
    name: string;
    subscriptionTier: string;
  };
  resume: {
    id: string;
    title: string;
  };
}

export interface ShareRequest {
  resumeId: string;
  isPublic?: boolean;
  expiresInDays?: number;
  passwordProtected?: boolean;
  password?: string;
}

export interface ShareUpdateRequest {
  isPublic?: boolean;
  expiresAt?: string;
  passwordProtected?: boolean;
  password?: string;
}

export const sharingService = {
  async createPublicShare(resumeId: string): Promise<ShareLink> {
    const response = await api.post('/sharing/public/' + resumeId);
    return response.data.data;
  },

  async createPrivateShare(resumeId: string, options: ShareRequest = {}): Promise<ShareLink> {
    const response = await api.post('/sharing/private/' + resumeId, options);
    return response.data.data;
  },

  async getShareLink(shareToken: string, password?: string): Promise<{
    valid: boolean;
    shareLink: ShareLink | null;
    error?: string;
  }> {
    const params = password ? `?password=${encodeURIComponent(password)}` : '';
    const response = await api.get(`/sharing/${shareToken}${params}`);
    return response.data.data;
  },

  async updateShareLink(shareId: string, updates: ShareUpdateRequest): Promise<ShareLink> {
    const response = await api.put(`/sharing/${shareId}`, updates);
    return response.data.data;
  },

  async deleteShareLink(shareId: string): Promise<void> {
    await api.delete(`/sharing/${shareId}`);
  },

  async getUserShares(): Promise<ShareLink[]> {
    const response = await api.get('/sharing/user');
    return response.data.data;
  },

  async trackDownload(shareId: string): Promise<void> {
    await api.get(`/sharing/${shareId}/download`);
  },

  async generateQRCode(shareUrl: string): Promise<{ qrCode: string; url: string }> {
    const response = await api.post('/sharing/qrcode', {
      url: shareUrl
    });
    return response.data.data;
  }
};

export default sharingService;