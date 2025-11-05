import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { aiService } from '../services/aiService';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// All AI routes require authentication
router.use(authenticate);

// Generate AI suggestions
router.post('/suggest', [
  body('sectionType').isIn(['summary', 'experience', 'skills', 'education', 'projects']).withMessage('Invalid section type'),
  body('context').optional().isObject().withMessage('Context must be an object'),
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

    const { sectionType, context } = req.body;

    // Check user's AI usage limits
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { subscriptionTier: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check if user has reached their AI suggestion limit
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const aiUsageCount = await prisma.aISuggestion.count({
      where: {
        resume: {
          userId: req.user!.id
        },
        createdAt: {
          gte: monthStart
        }
      }
    });

    const maxSuggestions = user.subscriptionTier === 'free' ? 10 : user.subscriptionTier === 'pro' ? 100 : 1000;

    if (aiUsageCount >= maxSuggestions) {
      return res.status(429).json({
        success: false,
        error: `AI suggestion limit reached (${maxSuggestions} per month). Please upgrade your plan.`,
      });
    }

    const aiRequest = {
      type: 'generate' as const,
      sectionType,
      context: {
        ...context,
        subscriptionTier: user.subscriptionTier,
      }
    };

    const aiResponse = await aiService.generateContent(aiRequest);

    // Save AI suggestions to database
    if (req.body.resumeId) {
      await Promise.all(aiResponse.suggestions.map(suggestion =>
        prisma.aISuggestion.create({
          data: {
            resumeId: req.body.resumeId,
            sectionType,
            suggestionText: suggestion,
            confidenceScore: aiResponse.confidence,
            isAccepted: false,
          }
        })
      ));
    }

    res.json({
      success: true,
      data: {
        suggestions: aiResponse.suggestions,
        confidence: aiResponse.confidence,
        reasoning: aiResponse.reasoning,
        remainingSuggestions: maxSuggestions - aiUsageCount - aiResponse.suggestions.length,
      }
    });
  } catch (error) {
    console.error('AI suggestion error:', error);
    next(error);
  }
});

// Improve content
router.post('/improve', [
  body('sectionType').isIn(['summary', 'experience', 'skills', 'education', 'projects']).withMessage('Invalid section type'),
  body('content').isString().withMessage('Content is required'),
  body('context').optional().isObject().withMessage('Context must be an object'),
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

    const { sectionType, content, context } = req.body;

    const aiRequest = {
      type: 'improve' as const,
      sectionType,
      content,
      context
    };

    const aiResponse = await aiService.improveContent(aiRequest);

    res.json({
      success: true,
      data: {
        suggestions: aiResponse.suggestions,
        confidence: aiResponse.confidence,
        reasoning: aiResponse.reasoning,
      }
    });
  } catch (error) {
    console.error('AI improvement error:', error);
    next(error);
  }
});

// Optimize for job
router.post('/optimize', [
  body('sectionType').isIn(['summary', 'experience', 'skills', 'education', 'projects']).withMessage('Invalid section type'),
  body('content').isString().withMessage('Content is required'),
  body('jobDescription').isString().withMessage('Job description is required'),
  body('context').optional().isObject().withMessage('Context must be an object'),
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

    const { sectionType, content, jobDescription, context } = req.body;

    const aiRequest = {
      type: 'optimize' as const,
      sectionType,
      content,
      jobDescription,
      context
    };

    const aiResponse = await aiService.optimizeForJob(aiRequest);

    res.json({
      success: true,
      data: {
        suggestions: aiResponse.suggestions,
        confidence: aiResponse.confidence,
        reasoning: aiResponse.reasoning,
      }
    });
  } catch (error) {
    console.error('AI optimization error:', error);
    next(error);
  }
});

// Generate resume title
router.post('/title', [
  body('personalInfo').isObject().withMessage('Personal info is required'),
  body('experience').isArray().withMessage('Experience must be an array'),
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

    const { personalInfo, experience } = req.body;

    const title = await aiService.generateResumeTitle(personalInfo, experience);

    res.json({
      success: true,
      data: { title }
    });
  } catch (error) {
    console.error('Title generation error:', error);
    next(error);
  }
});

// Accept AI suggestion
router.post('/accept/:suggestionId', async (req: AuthRequest, res, next) => {
  try {
    const { suggestionId } = req.params;

    const suggestion = await prisma.aISuggestion.findFirst({
      where: {
        id: suggestionId,
        resume: {
          userId: req.user!.id
        }
      }
    });

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        error: 'Suggestion not found',
      });
    }

    await prisma.aISuggestion.update({
      where: { id: suggestionId },
      data: { isAccepted: true }
    });

    res.json({
      success: true,
      message: 'Suggestion accepted'
    });
  } catch (error) {
    console.error('Accept suggestion error:', error);
    next(error);
  }
});

// Get AI usage statistics
router.get('/usage', async (req: AuthRequest, res, next) => {
  try {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [totalUsed, acceptedCount] = await Promise.all([
      prisma.aISuggestion.count({
        where: {
          resume: {
            userId: req.user!.id
          },
          createdAt: {
            gte: monthStart
          }
        }
      }),
      prisma.aISuggestion.count({
        where: {
          resume: {
            userId: req.user!.id
          },
          isAccepted: true,
          createdAt: {
            gte: monthStart
          }
        }
      })
    ]);

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { subscriptionTier: true }
    });

    const maxSuggestions = user?.subscriptionTier === 'free' ? 10 : user?.subscriptionTier === 'pro' ? 100 : 1000;

    res.json({
      success: true,
      data: {
        totalUsed,
        acceptedCount,
        remaining: Math.max(0, maxSuggestions - totalUsed),
        maxSuggestions,
        acceptanceRate: totalUsed > 0 ? Math.round((acceptedCount / totalUsed) * 100) : 0,
      }
    });
  } catch (error) {
    console.error('Usage statistics error:', error);
    next(error);
  }
});

export default router;