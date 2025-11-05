import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { pdfService } from '../services/pdfService';
import { PrismaClient } from '@prisma/client';
import { ExportFormat } from '@shared/types';

const router = express.Router();
const prisma = new PrismaClient();

// All export routes require authentication
router.use(authenticate);

// Export resume
router.post('/', [
  body('resumeId').isUUID().withMessage('Valid resume ID is required'),
  body('format').isIn(['pdf', 'docx', 'txt']).withMessage('Format must be pdf, docx, or txt'),
  body('options').optional().isObject().withMessage('Options must be an object'),
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

    const { resumeId, format, options = {} } = req.body;

    // Get resume and template
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: req.user!.id
      },
      include: {
        template: true,
        user: {
          select: { subscriptionTier: true }
        }
      }
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found',
      });
    }

    // Check export limits for free tier
    if (resume.user.subscriptionTier === 'free') {
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      const exportCount = await prisma.export.count({
        where: {
          resumeId,
          createdAt: {
            gte: monthStart
          }
        }
      });

      if (exportCount >= 3) {
        return res.status(429).json({
          success: false,
          error: 'Free tier limited to 3 exports per month. Please upgrade to Pro for unlimited exports.',
        });
      }
    }

    const resumeContent = resume.content as any;
    const template = resume.template!;

    let result;

    switch (format as ExportFormat) {
      case 'pdf':
        result = await pdfService.generatePDF(resumeContent, template, {
          watermark: resume.user.subscriptionTier === 'free',
          fileName: options.customFileName
        });
        break;

      case 'docx':
        result = await pdfService.generateDOCX(resumeContent);
        break;

      case 'txt':
        // Simple text export
        const personalInfo = resumeContent.personalInfo;
        let textContent = `${personalInfo.firstName} ${personalInfo.lastName}\n`;
        textContent += `${personalInfo.email}\n${personalInfo.phone}\n${personalInfo.location}\n\n`;

        if (resumeContent.summary) {
          textContent += `SUMMARY\n${resumeContent.summary}\n\n`;
        }

        result = {
          buffer: Buffer.from(textContent, 'utf8'),
          fileName: options.customFileName || `${personalInfo.firstName}_${personalInfo.lastName}_Resume.txt`
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Unsupported export format',
        });
    }

    // Calculate expiry date (7 days for free tier, 30 days for paid)
    const expiryDays = resume.user.subscriptionTier === 'free' ? 7 : 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    // Save export record
    const exportRecord = await prisma.export.create({
      data: {
        resumeId,
        format: format as ExportFormat,
        url: `/api/export/download/${resumeId}`, // This would be a download endpoint
        fileName: result.fileName,
        size: result.buffer.length,
        expiresAt
      }
    });

    // Store file temporarily (in production, use cloud storage)
    const filePath = await pdfService.savePDFFile(result.buffer, result.fileName);

    res.json({
      success: true,
      data: {
        exportId: exportRecord.id,
        downloadUrl: `/api/export/download/${exportRecord.id}`,
        fileName: result.fileName,
        size: result.buffer.length,
        format,
        expiresAt: exportRecord.expiresAt,
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    next(error);
  }
});

// Download exported file
router.get('/download/:exportId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { exportId } = req.params;

    const exportRecord = await prisma.export.findFirst({
      where: {
        id: exportId,
        resume: {
          userId: req.user!.id
        }
      },
      include: {
        resume: {
          select: { title: true }
        }
      }
    });

    if (!exportRecord) {
      return res.status(404).json({
        success: false,
        error: 'Export not found',
      });
    }

    // Check if export has expired
    if (exportRecord.expiresAt < new Date()) {
      return res.status(410).json({
        success: false,
        error: 'Export has expired',
      });
    }

    try {
      const filePath = require('path').join(process.cwd(), 'uploads', exportRecord.fileName);
      const fs = require('fs');

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: 'File not found',
        });
      }

      const fileBuffer = fs.readFileSync(filePath);

      res.setHeader('Content-Type', this.getContentType(exportRecord.format));
      res.setHeader('Content-Disposition', `attachment; filename="${exportRecord.fileName}"`);
      res.setHeader('Content-Length', fileBuffer.length);

      res.send(fileBuffer);
    } catch (fileError) {
      console.error('File read error:', fileError);
      res.status(500).json({
        success: false,
        error: 'Failed to read file',
      });
    }
  } catch (error) {
    console.error('Download error:', error);
    next(error);
  }
});

// Get export status and history
router.get('/history/:resumeId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { resumeId } = req.params;

    const exports = await prisma.export.findMany({
      where: {
        resumeId,
        resume: {
          userId: req.user!.id
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        format: true,
        fileName: true,
        size: true,
        createdAt: true,
        expiresAt: true
      }
    });

    res.json({
      success: true,
      data: exports.map(exp => ({
        ...exp,
        isExpired: exp.expiresAt < new Date(),
        downloadUrl: exp.expiresAt >= new Date() ? `/api/export/download/${exp.id}` : null
      }))
    });
  } catch (error) {
    console.error('Export history error:', error);
    next(error);
  }
});

// Delete expired exports (cleanup endpoint - could be called by a cron job)
router.delete('/cleanup', async (req, res, next) => {
  try {
    const expiredExports = await prisma.export.findMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      },
      select: { id: true, fileName: true }
    });

    // Delete files from filesystem
    const fs = require('fs');
    const path = require('path');

    for (const exportRecord of expiredExports) {
      try {
        const filePath = path.join(process.cwd(), 'uploads', exportRecord.fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error(`Failed to delete file ${exportRecord.fileName}:`, error);
      }
    }

    // Delete database records
    await prisma.export.deleteMany({
      where: {
        id: {
          in: expiredExports.map(e => e.id)
        }
      }
    });

    res.json({
      success: true,
      message: `Cleaned up ${expiredExports.length} expired exports`
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    next(error);
  }
});

function getContentType(format: ExportFormat): string {
  switch (format) {
    case 'pdf':
      return 'application/pdf';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'txt':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
}

export default router;