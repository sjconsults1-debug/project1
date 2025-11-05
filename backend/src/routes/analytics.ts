import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { analyticsService } from '../services/analyticsService';

const router = express.Router();

// All analytics routes require authentication
router.use(authenticate);

// Get user analytics
router.get('/user/:timeframe?', async (req: AuthRequest, res, next) => {
  try {
    const { timeframe = '30d' } = req.params;
    const validTimeframes = ['7d', '30d', '90d', '1y'];

    if (!validTimeframes.includes(timeframe)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid timeframe. Use 7d, 30d, 90d, or 1y.'
      });
    }

    const analytics = await analyticsService.getUserAnalytics(req.user!.id, timeframe as any);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('User analytics error:', error);
    next(error);
  }
});

// Get resume-specific analytics
router.get('/resume/:resumeId', async (req: AuthRequest, res, next) => {
  try {
    const { resumeId } = req.params;

    const analytics = await analyticsService.getResumeAnalytics(resumeId, req.user!.id);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error: any) {
    console.error('Resume analytics error:', error);

    if (error.message === 'Resume not found') {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    next(error);
  }
});

// Generate analytics report
router.post('/report/:timeframe?', async (req: AuthRequest, res, next) => {
  try {
    const { timeframe = '30d' } = req.params;
    const validTimeframes = ['7d', '30d', '90d', '1y'];

    if (!validTimeframes.includes(timeframe)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid timeframe. Use 7d, 30d, 90d, or 1y.'
      });
    }

    const report = await analyticsService.generateReport(req.user!.id, timeframe as any);

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Report generation error:', error);
    next(error);
  }
});

// Get global analytics (admin only)
router.get('/global', async (req: AuthRequest, res, next) => {
  try {
    // Check if user is admin or has proper permissions
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { subscriptionTier: true }
    });

    if (!user || user.subscriptionTier !== 'enterprise') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Enterprise tier required.'
      });
    }

    const globalAnalytics = await analyticsService.getGlobalAnalytics();

    res.json({
      success: true,
      data: globalAnalytics
    });
  } catch (error) {
    console.error('Global analytics error:', error);
    next(error);
  }
});

// Track custom events
router.post('/track', async (req: AuthRequest, res, next) => {
  try {
    const { eventType, data } = req.body;

    if (!eventType) {
      return res.status(400).json({
        success: false,
        error: 'Event type is required.'
      });
    }

    await analyticsService.recordEvent(req.user!.id, eventType, data);

    res.json({
      success: true,
      message: 'Event tracked successfully.'
    });
  } catch (error) {
    console.error('Event tracking error:', error);
    next(error);
  }
});

export default router;