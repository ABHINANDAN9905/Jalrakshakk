import { Conversation } from './conversation.model.js';

export class ConversationService {
  /**
   * Append a message to an existing conversation or initialize a new session
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  static async addMessage(data) {
    const { userId, sessionId, villageId, role, content, hydroContext, topic } = data;

    const message = {
      role,
      content,
      hydroContext: hydroContext || null,
      timestamp: new Date()
    };

    let session = await Conversation.findOne({ sessionId });

    if (!session) {
      session = new Conversation({
        userId,
        sessionId,
        villageId: villageId || null,
        topic: topic || 'Groundwater Conservation Guidance',
        messages: [message]
      });
    } else {
      session.messages.push(message);
    }

    return await session.save();
  }

  /**
   * Retrieve complete conversation thread by sessionId
   * @param {string} sessionId 
   * @returns {Promise<Object|null>}
   */
  static async getBySessionId(sessionId) {
    return await Conversation.findOne({ sessionId }).lean();
  }

  /**
   * Retrieve list of past mentoring sessions for a student
   * @param {string} userId 
   * @param {number} limit 
   * @returns {Promise<Array>}
   */
  static async getUserSessions(userId, limit = 20) {
    return await Conversation.find({ userId })
      .select('sessionId villageId topic createdAt updatedAt messages')
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();
  }
}

export default ConversationService;
