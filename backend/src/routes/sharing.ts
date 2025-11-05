import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { sharingService } from '../services/sharingService';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// All sharing routes require authentication
router.use(authenticate);

// Create public share
router.post('/public/:resumeId', [
  body('resumeId').isUUID().withMessage('Valid resume ID is required'),
], async (req: AuthRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { resumeId } = req.params;
    const userId = req.user!.id;

    // Verify user owns the resume
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId }
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    const { shareLink, qrCode } = await sharingService.createPublicShare(resumeId, userId);

    res.json({
      success: true,
      data: {
        shareId: shareLink.id,
        shareUrl: `${process.env.FRONTEND_URL}/shared/${shareLink.shareToken}`,
        qrCode: `data:image/png;base64,${qrCode.toString('base64')}`,
        expiresAt: shareLink.expiresAt,
      }
    });
  } catch (error) {
    console.error('Public share creation error:', error);
    next(error);
  }
});

// Create private share
router.post('/private/:resumeId', [
  body('resumeId').isUUID().withMessage('Valid resume ID is required'),
  body('expiresInDays').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365'),
  body('passwordProtected').optional().isBoolean().withMessage('Enable password protection'),
  body('password').optional().isString().withMessage('Password for share'),
], async (req: AuthRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { resumeId } = req.params;
    const { expiresInDays, passwordProtected, password } = req.body;
    const userId = req.user!.id;

    // Verify user owns the resume
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId }
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    const { shareLink, qrCode } = await sharingService.createPrivateShare(resumeId, userId, {
      expiresInDays,
      passwordProtected,
      password
    });

    res.json({
      success: true,
      data: {
        shareId: shareLink.id,
        shareUrl: `${process.env.FRONTEND_URL}/shared/${shareLink.shareToken}`,
        qrCode: `data:image/png;base64,${qrCode.toString('base64')}`,
        expiresAt: shareLink.expiresAt,
        isPasswordProtected: shareLink.passwordProtected,
      }
    });
  } catch (error) {
    console.error('Private share creation error:', error);
    next(error);
  }
});

// Get share link details
router.get('/:shareToken', async (req: AuthRequest, res, next) => {
  try {
    const { shareToken } = req.params;
    const { password } = req.query;

    const { valid, shareLink, error } = await sharingService.validateShareAccess(shareToken, password as string);

    if (!valid) {
      return res.status(404).json({
        success: false,
        error
      });
    }

    if (!shareLink.isPublic) {
      // For private shares, check ownership
      if (shareLink.resume.user.id !== req.user!.id) {
        return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Track the view
    await sharingService.trackView(shareLink.id);

    const resume = await prisma.resume.findUnique({
      where: { id: shareLink.resumeId },
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
    });

    res.json({
      success: true,
      data: {
        shareId: shareLink.id,
        shareUrl: `${process.env.FRONTEND_URL}/shared/${shareLink.shareToken}`,
        resume: {
          id: resume.id,
          title: resume.title,
        },
        isPublic: shareLink.isPublic,
        isPasswordProtected: shareLink.passwordProtected,
        expiresAt: shareLink.expiresAt,
        viewCount: shareLink.viewCount,
        downloadCount: shareLink.downloadCount,
        created: shareLink.created,
        lastAccessed: shareLink.updatedAt,
        owner: {
          id: resume.user.id,
          name: `${resume.user.firstName} ${resume.user.lastName}`,
          subscriptionTier: resume.user.subscriptionTier
        }
      }
    });
  } catch (error) {
    console.error('Share link access error:', error);
    next(error);
  }
});

// Download shared resume
router.get('/:shareToken/download', async (req: AuthRequest, res, next) => {
  try {
    const { shareToken } = req.params;
    const { valid, shareLink } = await sharingService.validateShareAccess(shareToken);

    if (!valid) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or expired share link'
      });
    }

    // Track the download
    await sharingService.trackDownload(shareLink.id);

    // Get resume data
    const resume = await prisma.resume.findUnique({
      where: { id: shareLink.resumeId },
      include: {
        template: true
      }
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // Generate PDF
    const { pdfService } = require('./pdfService');
    const pdfResult = await pdfService.generatePDF(
      resume.content as any,
      resume.template!,
      {
        watermark: shareLink.resume.user.subscriptionTier === 'free',
        fileName: `${resume.title.replace(/\s+/g, '_')}_Resume.pdf`
      }
    );

    // Set headers for download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfResult.fileName}"`);
    res.setHeader('Content-Length', pdfResult.buffer.length);

    res.send(pdfResult.buffer);
  } catch (error) {
    console.error('Share download error:', error);
    next(error);
  }
});

// Update share link
router.put('/:shareId', [
  body('isPublic').optional().isBoolean().withMessage('Whether share should be public'),
  body('expiresAt').optional().isISO8601().withMessage('New expiration date (ISO 8601 format)'),
  body('passwordProtected').optional().isBoolean().withMessage('Enable password protection'),
  body('password').optional().isString().withMessage('New password for share'),
], async (req: AuthRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { shareId } = req.params;
    const { isPublic, expiresAt, passwordProtected, password } = req.body;
    const userId = req.user!.id;

    // Verify ownership
    const shareLink = await prisma.shareLink.findFirst({
      where: { id: shareId, userId }
    });

    if (!shareLink) {
      return res.status(404).json({
        success: false,
        error: 'Share link not found'
      });
    }

    const updates: any = {};
    if (isPublic !== undefined) updates.isPublic = isPublic;
    if (expiresAt) updates.expiresAt = new Date(expiresAt);
    if (passwordProtected !== undefined) updates.passwordProtected = passwordProtected;
    if (password && updates.passwordProtected) {
      updates.password = await sharingService.hashPassword(password);
    }

    const updatedShare = await sharingService.updateShareLink(shareId, userId, updates);

    res.json({
      success: true,
      data: updatedShare
    });
  } catch (error) {
    console.error('Share link update error:', error);
    next(error);
  }
});

// Delete share link
router.delete('/:shareId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { shareId } = req.params;
    const userId = req.user!.id;

    await sharingService.deleteShareLink(shareId, userId);

    res.json({
      success: true,
      message: 'Share link deleted successfully'
    });
  } catch (error) {
    console.error('Share link deletion error:', error);
    next(error);
  }
});

// Get user's share links
router.get('/user', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const shareLinks = await sharingService.getUserShares(userId);

    res.json({
      success: true,
      data: shareLinks.map(link => ({
        id: link.id,
        shareUrl: `${process.env.FRONTEND_URL}/shared/${link.shareToken}`,
        isPublic: link.isPublic,
        isPasswordProtected: link.passwordProtected,
        viewCount: link.viewCount,
        downloadCount: link.downloadCount,
        createdAt: link.created,
        expiresAt: link.expiresAt,
        resume: link.resume
      }))
    });
  } catch (error) {
    console.error('Get user shares error:', error);
    next(error);
  }
});

// Cleanup expired shares (cron job)
router.delete('/cleanup', authenticate, async (req: AuthRequest, res, next) => {
  try {
      const deletedCount = await sharingService.cleanupExpiredShares();

      res.json({
        success: true,
        message: `Cleaned up ${deletedCount} expired share links`
      });
    } catch (error) {
      console.error('Cleanup error:', error);
      next(error);
    }
  });

export default router;