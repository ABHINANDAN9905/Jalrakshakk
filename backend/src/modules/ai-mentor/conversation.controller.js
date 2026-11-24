import { ConversationService } from './conversation.service.js';

export class ConversationController {
  /**
   * POST /api/v1/ai-mentor/conversations
   */
  static async addMessage(req, res, next) {
    try {
      const { userId, sessionId, villageId, role, content, hydroContext, topic } = req.body;

      if (!userId || !sessionId || !role || !content) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'Missing required fields: userId, sessionId, role, and content are required.'
        });
      }

      const conversation = await ConversationService.addMessage({
        userId,
        sessionId,
        villageId,
        role,
        content,
        hydroContext,
        topic
      });

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Message appended to AI Mentor conversation session',
        data: conversation
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/ai-mentor/conversations/:sessionId
   */
  static async getSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const conversation = await ConversationService.getBySessionId(sessionId);

      if (!conversation) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: `Conversation session "${sessionId}" not found.`
        });
      }

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Conversation session retrieved successfully',
        data: conversation
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/ai-mentor/conversations/user/:userId
   */
  static async getUserSessions(req, res, next) {
    try {
      const { userId } = req.params;
      const { limit } = req.query;
      const limitNum = Math.min(50, Math.max(1, parseInt(limit || '20', 10)));

      const sessions = await ConversationService.getUserSessions(userId, limitNum);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'User AI Mentor sessions retrieved successfully',
        data: sessions,
        meta: {
          count: sessions.length,
          userId
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ConversationController;
