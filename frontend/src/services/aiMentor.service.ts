import api from './api';

export interface MentorChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  hydroContext?: any;
  provider?: string;
  isAiGenerated?: boolean;
}

export interface MentorAction {
  id: string;
  label: string;
  target: 'NAVIGATE_FARM' | 'NAVIGATE_RWH' | 'NAVIGATE_CHECK_DAM' | 'NAVIGATE_BOREWELL' | 'NAVIGATE_POND';
}

export interface MentorChatResponse {
  sessionId: string;
  reply: string;
  provider: string;
  isAiGenerated: boolean;
  notice?: string | null;
  hydroContext?: any;
  recommendedActions?: MentorAction[];
}

export interface ConservationRecommendation {
  id: string;
  title: string;
  category: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  impact: string;
  gameAction: string;
  gameActionLabel: string;
}

export const aiMentorService = {
  /**
   * Send a question or message to the AI Water Mentor
   */
  async sendMessage(params: {
    message: string;
    sessionId?: string;
    villageId?: string;
    includeSimulationContext?: boolean;
  }): Promise<MentorChatResponse> {
    try {
      const response = await api.post('/ai-mentor/chat', params);
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
    } catch (err: any) {
      console.warn('[AI Mentor Service] Chat API error, using offline fallback mentor:', err.message);
    }

    // High-Fidelity Client-side Science Teacher Fallback
    const q = params.message.toLowerCase();
    let reply = `### 🎓 JalRakshak Water Wisdom\n\nWelcome to the JalRakshak Water Sanctuary! As your AI Water Mentor, I am here to help you master hydrogeology and village water stewardship.\n\nHere are great questions you can explore with me:\n1. *"Explain my latest simulation."*\n2. *"How does drip irrigation save groundwater?"*\n3. *"What is a check dam and how does it work?"*\n4. *"Why do shallow open wells run dry during summer?"*`;

    const actions: MentorAction[] = [];

    if (q.includes('drip') || q.includes('irrigation') || q.includes('farm') || q.includes('crop')) {
      reply = `### 🌱 Drip vs. Flood Irrigation\n\nIn Indian agriculture, irrigation accounts for over 80% of total groundwater extraction:\n\n- **Flood / Furrow Irrigation:** Suffers 40–50% water loss due to surface evaporation, deep percolation below active root zones, and ditch seepage.\n- **Subsurface Drip Irrigation:** Delivers micro-droplets directly to crop root zones. It saves **50% to 65% water**, prevents weed proliferation, and keeps soil salinity balanced.`;
      actions.push({ id: 'act-farm', label: 'Inspect Farmland & Drip Plots', target: 'NAVIGATE_FARM' });
    } else if (q.includes('check dam') || q.includes('anicut') || q.includes('recharge')) {
      reply = `### 🌧️ Check Dams & Artificial Recharge\n\nMasonry check dams built across seasonal drainage streams slow down monsoon runoff velocity:\n\n- **Infiltration Head:** Retaining runoff creates an upstream water column that infiltrates through fractured basalt strata over 4–6 months.\n- **Impact:** Elevates water tables in surrounding agricultural wells within a 1.5 km radius!`;
      actions.push({ id: 'act-dam', label: 'Inspect Masonry Check Dam', target: 'NAVIGATE_CHECK_DAM' });
    } else if (q.includes('harvest') || q.includes('rwh') || q.includes('roof')) {
      reply = `### 🏠 Rooftop Rainwater Harvesting\n\nRooftop RWH turns residential roofs into localized recharge stations:\n\n- A standard 120 m² roof captures over **70,000 liters** of monsoon water annually.\n- The first-flush diverter rejects the initial dirty rinse, while sand-gravel filter sumps channel clean water straight into shallow aquifers.`;
      actions.push({ id: 'act-rwh', label: 'View Rooftop RWH House', target: 'NAVIGATE_RWH' });
    }

    return {
      sessionId: params.sessionId || `offline-ses-${Date.now()}`,
      reply,
      provider: 'educational-engine',
      isAiGenerated: false,
      notice: 'Operating in deterministic offline educational mode.',
      recommendedActions: actions
    };
  },

  /**
   * Request dedicated analysis of student's latest simulation results
   */
  async explainLatestSimulation(params: {
    sessionId?: string;
    villageId?: string;
  }): Promise<MentorChatResponse> {
    try {
      const response = await api.get('/ai-mentor/explain-simulation', { params });
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
    } catch (err: any) {
      console.warn('[AI Mentor Service] Explain simulation error:', err.message);
    }

    return this.sendMessage({
      message: 'Explain my latest simulation results in detail.',
      ...params
    });
  },

  /**
   * Fetch conservation recommendations for the current village
   */
  async getRecommendations(villageId?: string): Promise<ConservationRecommendation[]> {
    try {
      const response = await api.get('/ai-mentor/recommendations', { params: { villageId } });
      if (response.data && response.data.success && response.data.data?.recommendations) {
        return response.data.data.recommendations;
      }
    } catch {
      // Fallback
    }

    return [
      {
        id: 'rec-drip',
        title: 'Transition to Subsurface Drip Irrigation',
        category: 'AGRICULTURE',
        priority: 'HIGH',
        impact: 'Saves 50–65% agricultural water and curbs excessive aquifer draft.',
        gameAction: 'NAVIGATE_FARM',
        gameActionLabel: 'Inspect Agricultural Plots'
      },
      {
        id: 'rec-dam',
        title: 'Desilt Masonry Check Dam & Infiltration Basin',
        category: 'WATERSHED',
        priority: 'CRITICAL',
        impact: 'Impounds monsoon streamflow to recharge the depleted basalt aquifer.',
        gameAction: 'NAVIGATE_CHECK_DAM',
        gameActionLabel: 'Inspect Masonry Check Dam'
      },
      {
        id: 'rec-rwh',
        title: 'Mandate Rooftop Rainwater Harvesting Filters',
        category: 'COMMUNITY',
        priority: 'MEDIUM',
        impact: 'Harvests 70,000+ liters per 120 m² roof, routing filtered rain into recharge pits.',
        gameAction: 'NAVIGATE_RWH',
        gameActionLabel: 'View RWH Pucca House'
      }
    ];
  },

  /**
   * Clear conversation history for a session
   */
  async clearSession(sessionId: string): Promise<void> {
    try {
      await api.delete(`/ai-mentor/conversations/${sessionId}`);
    } catch {
      // Offline fallback
    }
  }
};

export default aiMentorService;
