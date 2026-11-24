import { AiMentorService } from './aiMentor.service.js';
import { ConversationService } from './conversation.service.js';
import { Conversation } from './conversation.model.js';

export class AiMentorController {
  /**
   * POST /api/v1/ai-mentor/chat
   * Ask question to AI Water Mentor
   */
  static async chat(req, res, next) {
    try {
      const result = await AiMentorService.askMentor(req.user.id, req.user, req.body);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'AI Water Mentor responded successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/ai-mentor/explain-simulation
   * Dedicated explanation of the student's latest simulation
   */
  static async explainSimulation(req, res, next) {
    try {
      const result = await AiMentorService.explainSimulation(req.user.id, req.user, req.query);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Simulation analysis generated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/ai-mentor/recommendations
   * Retrieve conservation recommendations based on active village water balance
   */
  static async getRecommendations(req, res, next) {
    try {
      const { villageId } = req.query;
      const result = await AiMentorService.getRecommendations(req.user.id, villageId);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Conservation recommendations retrieved successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/ai-mentor/quiz
   * Retrieve educational multiple choice quiz question
   */
  static getQuiz(req, res, next) {
    try {
      const { topic } = req.query;
      const quiz = AiMentorService.getQuizQuestion(topic);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Quiz question retrieved successfully',
        data: quiz
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/ai-mentor/conversations
   * Retrieve student's conversation session history
   */
  static async getSessions(req, res, next) {
    try {
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '20', 10)));
      const sessions = await ConversationService.getUserSessions(req.user.id, limit);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'AI Mentor sessions retrieved successfully',
        data: sessions
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/ai-mentor/conversations/:sessionId
   * Retrieve specific conversation thread with ownership check
   */
  static async getSessionById(req, res, next) {
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

      // RBAC: Verify conversation ownership
      if (req.user.role === 'STUDENT' && conversation.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: 'Forbidden: You can only view your own AI Mentor sessions.'
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
   * DELETE /api/v1/ai-mentor/conversations/:sessionId
   * Clear or delete a conversation thread with ownership check
   */
  static async deleteSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const conversation = await Conversation.findOne({ sessionId });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: `Conversation session "${sessionId}" not found.`
        });
      }

      if (req.user.role === 'STUDENT' && conversation.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: 'Forbidden: You can only delete your own AI Mentor sessions.'
        });
      }

      await Conversation.deleteOne({ sessionId });

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Conversation session deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AiMentorController;
