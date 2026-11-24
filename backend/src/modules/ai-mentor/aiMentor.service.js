import OpenAI from 'openai';
import { env } from '../../config/env.js';
import { Conversation } from './conversation.model.js';
import { ConversationService } from './conversation.service.js';
import { AiMentorContext } from './aiMentor.context.js';
import {
  AI_MENTOR_SYSTEM_PROMPT,
  EXPLAIN_SIMULATION_PROMPT,
  QUIZ_GENERATOR_PROMPT
} from './aiMentor.prompts.js';

export class AiMentorService {
  /**
   * Primary conversation interface with the AI Water Mentor
   */
  static async askMentor(userId, user, params) {
    const {
      message,
      sessionId = `ses-${userId}-${Date.now()}`,
      villageId,
      includeSimulationContext = true
    } = params;

    // 1. Retrieve authorized student hydrogeological simulation context
    let hydroContext = null;
    if (includeSimulationContext) {
      hydroContext = await AiMentorContext.getStudentHydroContext(userId, villageId);
    }

    // 2. Retrieve past conversation history from MongoDB (last 6 messages for context)
    let pastMessages = [];
    try {
      const existingSession = await Conversation.findOne({ sessionId, userId }).lean();
      if (existingSession && existingSession.messages) {
        pastMessages = existingSession.messages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content
        }));
      }
    } catch (dbErr) {
      // Graceful offline fallback
    }

    // 3. Assemble prompt payload for OpenAI
    const systemInstruction = `${AI_MENTOR_SYSTEM_PROMPT}\n\nSTUDENT HYDROGEOLOGICAL CONTEXT:\n${
      hydroContext ? JSON.stringify(hydroContext, null, 2) : 'No simulation run recorded yet.'
    }`;

    const apiMessages = [
      { role: 'system', content: systemInstruction },
      ...pastMessages,
      { role: 'user', content: message }
    ];

    let mentorReply = '';
    let isAiGenerated = false;
    let provider = 'educational-engine';
    let notice = null;

    // 4. Check if OPENAI_API_KEY is configured
    if (env.OPENAI_API_KEY && env.OPENAI_API_KEY.startsWith('sk-')) {
      try {
        const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
        const response = await openai.chat.completions.create({
          model: env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: apiMessages,
          temperature: 0.6,
          max_tokens: 800
        });

        mentorReply = response.choices[0]?.message?.content || '';
        isAiGenerated = true;
        provider = 'openai';
      } catch (openAiError) {
        console.warn('[AI Mentor] OpenAI API call failed, falling back to deterministic educational engine:', openAiError.message);
        mentorReply = this.generateDeterministicEducationalReply(message, hydroContext);
        isAiGenerated = false;
        provider = 'educational-engine';
        notice = `OpenAI API connection unavailable (${openAiError.message}). Operating in deterministic educational mentor mode.`;
      }
    } else {
      // Deterministic educational fallback
      mentorReply = this.generateDeterministicEducationalReply(message, hydroContext);
      isAiGenerated = false;
      provider = 'educational-engine';
      notice = 'OPENAI_API_KEY is not configured on server. Operating in deterministic educational mentor mode.';
    }

    // 5. Extract interactive game navigation links based on topics discussed
    const recommendedGameActions = this.extractGameActions(message, mentorReply);

    // 6. Asynchronously persist conversation in MongoDB
    try {
      await ConversationService.addMessage({
        userId,
        sessionId,
        villageId: villageId || null,
        role: 'user',
        content: message,
        hydroContext
      });

      await ConversationService.addMessage({
        userId,
        sessionId,
        villageId: villageId || null,
        role: 'assistant',
        content: mentorReply,
        hydroContext: { provider, isAiGenerated }
      });
    } catch (saveErr) {
      // Database offline/unreachable in demo mode
    }

    return {
      sessionId,
      reply: mentorReply,
      provider,
      isAiGenerated,
      notice,
      hydroContext,
      recommendedActions: recommendedGameActions
    };
  }

  /**
   * Dedicated explanation of student's latest simulation run
   */
  static async explainSimulation(userId, user, params) {
    const { sessionId = `ses-exp-${userId}-${Date.now()}`, villageId } = params;
    const hydroContext = await AiMentorContext.getStudentHydroContext(userId, villageId);

    const promptMessage = `Please explain my latest simulation results for ${hydroContext.villageName || 'my village'}. How did my extraction and conservation decisions affect the aquifer storage and sustainability?`;

    return await this.askMentor(userId, user, {
      message: promptMessage,
      sessionId,
      villageId,
      includeSimulationContext: true
    });
  }

  /**
   * Generates actionable conservation recommendations tailored to actual simulation metrics
   */
  static async getRecommendations(userId, villageId) {
    const hydroContext = await AiMentorContext.getStudentHydroContext(userId, villageId);
    const recommendations = [];

    const wb = hydroContext.waterBalance || hydroContext.baselineAquifer || {};
    const extraction = wb.extractionM3 || wb.annualExtractionM3 || 0;
    const recharge = wb.rechargeM3 || wb.annualRechargeM3 || 0;
    const storagePct = wb.storagePercentage || 68.5;

    recommendations.push({
      id: 'rec-drip-irrigation',
      title: 'Transition to Subsurface Drip Irrigation',
      category: 'AGRICULTURE',
      priority: extraction > recharge ? 'CRITICAL' : 'HIGH',
      impact: 'Saves 50–65% agricultural water and curbs excessive aquifer draft.',
      gameAction: 'NAVIGATE_FARM',
      gameActionLabel: 'Inspect Agricultural Plots'
    });

    recommendations.push({
      id: 'rec-check-dam',
      title: 'Desilt Masonry Check Dam & Deepen Infiltration Basin',
      category: 'WATERSHED',
      priority: storagePct < 40 ? 'CRITICAL' : 'MEDIUM',
      impact: 'Impounds monsoon streamflow to recharge the depleted basalt aquifer.',
      gameAction: 'NAVIGATE_CHECK_DAM',
      gameActionLabel: 'Inspect Masonry Check Dam'
    });

    recommendations.push({
      id: 'rec-rwh-catchment',
      title: 'Mandate Rooftop Rainwater Harvesting Filters',
      category: 'COMMUNITY',
      priority: 'MEDIUM',
      impact: 'Harvests 70,000+ liters per 120 m² roof, routing filtered rain into recharge pits.',
      gameAction: 'NAVIGATE_RWH',
      gameActionLabel: 'View RWH Pucca House'
    });

    recommendations.push({
      id: 'rec-borewell-rationing',
      title: 'Limit Motorized Borewell Pumping Hours',
      category: 'EXTRACTION',
      priority: extraction > 250000 ? 'HIGH' : 'MEDIUM',
      impact: 'Prevents localized cones of depression that dry out adjacent shallow open wells.',
      gameAction: 'NAVIGATE_BOREWELL',
      gameActionLabel: 'Inspect Motorized Borewell'
    });

    return {
      villageName: hydroContext.villageName,
      storagePercentage: storagePct,
      conditionCategory: wb.conditionCategory || 'SAFE',
      recommendations
    };
  }

  /**
   * Generates interactive multiple choice educational quiz questions
   */
  static getQuizQuestion(topic = 'RECHARGE') {
    const QUIZ_BANK = {
      RECHARGE: {
        question: 'How do masonry check dams constructed across seasonal streams contribute to groundwater replenishment?',
        options: [
          'A) They completely block water from reaching downstream villages forever.',
          'B) They slow stream runoff velocity, allowing water to impound and infiltrate into the aquifer bed.',
          'C) They evaporate 100% of the monsoon floodwaters into the atmosphere.',
          'D) They pump groundwater directly out of the deep confined aquifer.'
        ],
        correctOption: 'B',
        explanation: 'Check dams impede monsoon runoff velocity, creating shallow upstream water pools that steadily infiltrate porous rock fissures over several months.'
      },
      IRRIGATION: {
        question: 'Why is subsurface drip irrigation significantly more water-efficient than conventional furrow flood irrigation?',
        options: [
          'A) It requires diesel fuel to evaporate excess water.',
          'B) It delivers low-pressure water directly to crop root zones, reducing evaporation and conveyance losses by up to 60%.',
          'C) It forces crops to grow without any water absorption.',
          'D) It only irrigates crops during monsoon downpours.'
        ],
        correctOption: 'B',
        explanation: 'Flood irrigation loses 40-50% to runoff and open surface evaporation. Drip lateral emitters hydrate the active root zone directly.'
      },
      AQUIFER_DYNAMICS: {
        question: 'What is a "cone of depression" formed in an unconfined aquifer?',
        options: [
          'A) A geological crater created by volcanic eruption.',
          'B) A localized drop in the water table surface around an active pumping borewell where extraction rate exceeds aquifer transmissivity.',
          'C) An underground mountain holding trapped rainwater.',
          'D) A reservoir built on top of a village hill.'
        ],
        correctOption: 'B',
        explanation: 'When a deep borewell pump draws water faster than the surrounding rock matrix can transmit it, the water table forms a funnel-shaped depression cone.'
      },
      RAINWATER_HARVESTING: {
        question: 'What is the function of a "First-Flush Diverter" in rooftop rainwater harvesting systems?',
        options: [
          'A) To pump groundwater to the rooftop.',
          'B) To discard the initial 15-20 minutes of rain that carries accumulated dust and bird droppings, protecting recharge filters.',
          'C) To boil the rainwater immediately.',
          'D) To measure the village temperature.'
        ],
        correctOption: 'B',
        explanation: 'The first wash of rain cleans dust, leaves, and organic debris from roofs. Diverting this initial wash keeps filtration sumps clean.'
      }
    };

    return QUIZ_BANK[topic] || QUIZ_BANK.RECHARGE;
  }

  /**
   * Deterministic scientific teacher fallback when external AI is unavailable
   */
  static generateDeterministicEducationalReply(query, hydroContext) {
    const q = (query || '').toLowerCase();
    const wb = hydroContext?.waterBalance || hydroContext?.baselineAquifer || {};
    const villageName = hydroContext?.villageName || 'your village';

    if (q.includes('explain') || q.includes('simulation') || q.includes('latest') || q.includes('result')) {
      const storagePct = wb.storagePercentage || 68.5;
      const cond = wb.conditionCategory || 'SAFE';
      const recharge = wb.rechargeM3 || wb.annualRechargeM3 || 420000;
      const extraction = wb.extractionM3 || wb.annualExtractionM3 || 310000;
      const net = (recharge - extraction).toLocaleString();

      return `### 💧 Hydrogeological Analysis for ${villageName}

Hello young scientist! Let's examine your latest simulation numbers:

1. **Water Balance Summary:**
   - **Total Aquifer Recharge:** +${recharge.toLocaleString()} m³
   - **Total Extracted Draft:** -${extraction.toLocaleString()} m³
   - **Net Aquifer Balance:** ${recharge >= extraction ? '+' : '-'}${net} m³
   - **Storage State:** **${storagePct}%** (Classified as **${cond.replace('_', ' ')}**)

2. **Hydrological Mechanics:**
   ${
     extraction > recharge
       ? `⚠️ **Extraction Overdraft Detected:** Your community extracted more water than monsoon infiltration replenished. This causes drawdown cones beneath your borewells and lowers open well levels.`
       : `✅ **Positive Aquifer Recharge:** Your conservation interventions allowed rainwater infiltration to exceed extraction, building underground storage resilience!`
   }

3. **Key Conservation Recommendations:**
   - **Agriculture:** Adopt subsurface drip irrigation on cash crops to reduce draft by up to 55%.
   - **Artificial Recharge:** Desilt the check dam and percolation tank before the next monsoon season.
   - **Governance:** Use the village Jal Samiti to enforce volumetric borewell pumping limits.`;
    }

    if (q.includes('recharge') || q.includes('increase') || q.includes('harvest')) {
      return `### 🌧️ How to Maximize Aquifer Recharge

Groundwater recharge occurs when surface water infiltrates the soil profile and reaches the saturated aquifer zone:

- **1. Check Dams & Weirs:** Masonry barriers built across drainage streams slow runoff velocity, turning rapid flash floods into steady deep percolation.
- **2. Percolation Tanks:** Porous excavated basins that trap monsoon deluge in high-permeability strata.
- **3. Rooftop Rainwater Harvesting (RWH):** Residential roofs (120 m²) can harvest >70,000 liters annually, diverting clean rain through sand-gravel filters directly into recharge shafts.
- **4. Continuous Contour Trenches (CCT):** Trenches dug along ridge slopes prevent soil erosion and facilitate unconfined aquifer infiltration.

*Try adding a check dam or percolation tank in your 3D village to see recharge volume increase!*`;
    }

    if (q.includes('drip') || q.includes('irrigation') || q.includes('flood') || q.includes('farm')) {
      return `### 🌱 Drip vs. Flood Irrigation

In Indian agriculture, irrigation accounts for over 80% of total groundwater extraction:

- **Flood / Furrow Irrigation:** Suffers 40–50% water loss due to surface evaporation, deep percolation below active root zones, and ditch seepage.
- **Subsurface Drip Irrigation:** Uses pressurized emitters to deliver micro-droplets directly to crop root zones. It saves **50% to 65% water**, prevents weed proliferation, and keeps soil salinity balanced.
- **Crop Water Budgeting:** Replacing high-water-demand sugarcane with millets (Bajra, Ragi) or pulses cuts crop water requirement by more than half.`;
    }

    if (q.includes('drought') || q.includes('critical') || q.includes('decrease') || q.includes('dry')) {
      return `### ☀️ Groundwater Behavior During Droughts

During drought conditions, rainfall drops below 75% of normal seasonal averages:

1. **Natural Recharge Collapses:** Soil moisture deficits prevent rainwater from reaching the unconfined aquifer.
2. **Accelerated Pumping:** Farmers run tube wells longer (10–14 hrs/day) to compensate for zero rain, causing steep **cones of depression**.
3. **Well Desiccation:** Shallow masonry wells (0–15m depth) dry out first, forcing deep drilling into non-renewable fossil aquifers.
4. **Remediation Strategy:** Shift crops to drought-hardy millets, ban non-essential industrial water draft, and protect drinking water reservoirs.`;
    }

    // Default science teacher response
    return `### 🎓 JalRakshak Water Wisdom

Welcome to the JalRakshak Water Sanctuary! As your AI Water Mentor, I am here to help you master hydrogeology and village water stewardship.

Here are great questions you can explore with me:
1. *"Explain my latest simulation."* (Breaks down your water balance and storage change)
2. *"How does drip irrigation save groundwater?"*
3. *"What is a check dam and how does it work?"*
4. *"Why do shallow open wells run dry during summer?"*
5. *"How can our village improve its sustainability score?"*

Feel free to ask any question or run a new simulation in the 3D village to see live aquifer dynamics!`;
  }

  /**
   * Matches keywords to interactive 3D village game features
   */
  static extractGameActions(query, reply) {
    const text = `${query} ${reply}`.toLowerCase();
    const actions = [];

    if (text.includes('drip') || text.includes('farm') || text.includes('crop') || text.includes('sugarcane')) {
      actions.push({
        id: 'act-farm',
        label: 'Inspect Farmland & Drip Plots',
        target: 'NAVIGATE_FARM'
      });
    }

    if (text.includes('harvest') || text.includes('rooftop') || text.includes('rwh') || text.includes('sump')) {
      actions.push({
        id: 'act-rwh',
        label: 'View Rooftop RWH House',
        target: 'NAVIGATE_RWH'
      });
    }

    if (text.includes('check dam') || text.includes('anicut') || text.includes('stream') || text.includes('river')) {
      actions.push({
        id: 'act-check-dam',
        label: 'Inspect Masonry Check Dam',
        target: 'NAVIGATE_CHECK_DAM'
      });
    }

    if (text.includes('borewell') || text.includes('pumping') || text.includes('tube well') || text.includes('cone of depression')) {
      actions.push({
        id: 'act-borewell',
        label: 'Inspect Motorized Borewell',
        target: 'NAVIGATE_BOREWELL'
      });
    }

    if (text.includes('pond') || text.includes('talab') || text.includes('percolation')) {
      actions.push({
        id: 'act-pond',
        label: 'Inspect Community Pond',
        target: 'NAVIGATE_POND'
      });
    }

    return actions;
  }
}

export default AiMentorService;
