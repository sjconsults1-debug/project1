import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

interface ShareLink {
  id: string;
  resumeId: string;
  userId: string;
  shareToken: string;
  isPublic: boolean;
  expiresAt: Date;
  viewCount: number;
  downloadCount: number;
  passwordProtected: boolean;
  password?: string;
  created: Date;
}

interface QRCodeData {
  content: string;
  size: number;
  format: 'png' | 'svg' | 'pdf';
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export class SharingService {
  private prisma = new PrismaClient();

  async generateShareToken(resumeId: string, userId: string): Promise<string> {
    return uuidv4().replace(/-/g, '');
  }

  async createShareLink(
    resumeId: string,
    userId: string,
    options: {
      isPublic?: boolean;
      expiresInDays?: number;
      passwordProtected?: boolean;
      password?: string;
    } = {}
  ): Promise<ShareLink> {
    const shareToken = await this.generateShareToken(resumeId, userId);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (options.expiresInDays || 30));

    const shareLink = await this.prisma.shareLink.create({
      data: {
        resumeId,
        userId,
        shareToken,
        isPublic: options.isPublic || false,
        expiresAt,
        viewCount: 0,
        downloadCount: 0,
        passwordProtected: options.passwordProtected || false,
        password: options.password ? await this.hashPassword(options.password) : null,
        created: new Date(),
        updatedAt: new Date(),
      }
    });

    return shareLink;
  }

  private async hashPassword(password: string): Promise<string> {
    // In production, use bcrypt
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async getShareLinkByToken(shareToken: string): Promise<ShareLink | null> {
    const shareLink = await this.prisma.shareLink.findFirst({
      where: {
        shareToken,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        resume: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                subscriptionTier: true
              }
            }
          }
        }
      }
    });

    if (shareLink && !shareLink.isPublic && shareLink.resume.user.id !== shareLink.userId) {
      return null; // Public link accessed by wrong user
    }

    return shareLink;
  }

  async updateShareLink(
    shareId: string,
    userId: string,
    updates: {
      isPublic?: boolean;
      expiresAt?: Date;
      passwordProtected?: boolean;
      password?: string;
    }
  ): Promise<ShareLink> {
    // Verify ownership
    const existingLink = await this.prisma.shareLink.findFirst({
      where: {
        id: shareId,
        userId
      }
    });

    if (!existingLink) {
      throw new Error('Share link not found or access denied');
    }

    const updateData: any = {};
    if (updates.isPublic !== undefined) updateData.isPublic = updates.isPublic;
    if (updates.expiresAt !== undefined) updateData.expiresAt = updates.expiresAt;
    if (updates.passwordProtected !== undefined) {
      updateData.passwordProtected = updates.passwordProtected;
      if (updates.password) {
        updateData.password = await this.hashPassword(updates.password);
      }
    }
    updateData.updatedAt = new Date();

    const updatedLink = await this.prisma.shareLink.update({
      where: { id: shareId },
      data: updateData
    });

    return updatedLink;
  }

  async trackView(shareId: string): Promise<void> {
    await this.prisma.shareLink.update({
      where: { id: shareId },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });
  }

  async trackDownload(shareId: string): Promise<void> {
    await this.prisma.shareLink.update({
      where: { id: shareId },
      data: {
        downloadCount: {
          increment: 1
        }
      }
    });
  }

  async getShareAnalytics(shareId: string, userId: string): Promise<{
    totalViews: number;
    totalDownloads: number;
    created: Date;
    lastAccessed: Date | null;
    isExpired: boolean;
  }> {
    const shareLink = await this.prisma.shareLink.findFirst({
      where: {
        id: shareId,
        userId
      }
    });

    if (!shareLink) {
      throw new Error('Share link not found');
    }

    return {
      totalViews: shareLink.viewCount,
      totalDownloads: shareLink.downloadCount,
      created: shareLink.created,
      lastAccessed: shareLink.updatedAt,
      isExpired: shareLink.expiresAt < new Date()
    };
  }

  async deleteShareLink(shareId: string, userId: string): Promise<void> {
    const shareLink = await this.prisma.shareLink.findFirst({
      where: {
        id: shareId,
        userId
      }
    });

    if (!shareLink) {
      throw new Error('Share link not found');
    }

    await this.prisma.shareLink.delete({
      where: { id: shareId }
    });
  }

  async generateQRCode(
    content: string,
    size: number = 200,
    format: 'png' | 'svg' | 'pdf' = 'png',
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'M'
  ): Promise<Buffer> {
    const QRCode = require('qrcode');

    return new Promise((resolve, reject) => {
      QRCode.toDataURL(content, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel,
        type: format
      }, (error, buffer) => {
        if (error) {
          reject(error);
        } else {
          // Convert data URL to Buffer
          const base64Data = buffer.split(',')[1];
          resolve(Buffer.from(base64Data, 'base64'));
        }
      });
    });
  }

  async generateResumeQRCode(
    resumeId: string,
    shareToken: string,
    baseUrl: string
  ): Promise<{ qrCode: Buffer; url: string }> {
    const url = `${baseUrl}/shared/${shareToken}`;

    const qrCode = await this.generateQRCode(url, 300, 'png', 'M');

    return {
      qrCode,
      url
    };
  }

  async createPublicShare(
    resumeId: string,
    userId: string
  ): Promise<{ shareLink: ShareLink; qrCode: Buffer }> {
    // Create public share link that doesn't expire
    const shareLink = await this.createShareLink(resumeId, userId, {
      isPublic: true,
      expiresInDays: 365, // 1 year
    });

    const { qrCode } = await this.generateResumeQRCode(resumeId, shareLink.shareToken, process.env.FRONTEND_URL || 'http://localhost:5173');

    return { shareLink, qrCode };
  }

  async createPrivateShare(
    resumeId: string,
    userId: string,
    options: {
      expiresInDays?: number;
      passwordProtected?: boolean;
      password?: string;
    } = {}
  ): Promise<{ shareLink: ShareLink; qrCode: Buffer }> {
    const shareLink = await this.createShareLink(resumeId, userId, options);

    const { qrCode } = await this.generateResumeQRCode(resumeId, shareLink.shareToken, process.env.FRONTEND_URL || 'http://localhost:5173');

    return { shareLink, qrCode };
  }

  async validateShareAccess(
    shareToken: string,
    password?: string
  ): Promise<{ valid: boolean; shareLink: ShareLink | null; error?: string }> {
    try {
      const shareLink = await this.getShareLinkByToken(shareToken);

      if (!shareLink) {
        return { valid: false, shareLink: null, error: 'Share link not found' };
      }

      // Check if expired
      if (shareLink.expiresAt < new Date()) {
        return { valid: false, shareLink: null, error: 'Share link has expired' };
      }

      // Check password protection
      if (shareLink.passwordProtected) {
        if (!password) {
          return { valid: false, shareLink: null, error: 'Password required' };
        }

        const isValid = await this.validatePassword(password, shareLink.password || '');
        if (!isValid) {
          return { valid: false, shareLink: null, error: 'Invalid password' };
      }

      // Update last accessed time
      await this.trackView(shareLink.id);

      return { valid: true, shareLink };
    } catch (error) {
      return { valid: false, shareLink: null, error: 'Invalid share token' };
    }
  }

  private async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    return hash === hashedPassword;
  }

  async getUserShares(userId: string): Promise<ShareLink[]> {
    return this.prisma.shareLink.findMany({
      where: { userId },
      include: {
        resume: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async cleanupExpiredShares(): Promise<number> {
    const result = await this.prisma.shareLink.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    return result.count;
  }
}

export const sharingService = new SharingService();