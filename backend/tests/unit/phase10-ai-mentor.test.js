import test from 'node:test';
import assert from 'node:assert/strict';
import { AiMentorService } from '../../src/modules/ai-mentor/aiMentor.service.js';
import { AiMentorContext } from '../../src/modules/ai-mentor/aiMentor.context.js';
import {
  askQuestionSchema,
  explainSimulationSchema,
  recommendActionsSchema,
  quizQuestionSchema
} from '../../src/modules/ai-mentor/aiMentor.validation.js';
import {
  WATER_TABLE_CATEGORIES
} from '../../src/modules/simulation/engine/aquiferModel.js';

test('Phase 10: AI Water Mentor & Hydrological Consistency Unit Tests', async (t) => {
  await t.test('1. Canonical Hydrological Threshold Consistency', () => {
    assert.equal(WATER_TABLE_CATEGORIES.CRITICAL.code, 'CRITICAL');
    assert.equal(WATER_TABLE_CATEGORIES.SEMI_CRITICAL.code, 'SEMI_CRITICAL');
    assert.equal(WATER_TABLE_CATEGORIES.SAFE.code, 'SAFE');
    assert.equal(WATER_TABLE_CATEGORIES.OPTIMAL.code, 'OPTIMAL');

    // Verify boundary descriptions match Phase 7 specifications
    assert.ok(WATER_TABLE_CATEGORIES.CRITICAL.rangeDescription.includes('< 20%'));
    assert.ok(WATER_TABLE_CATEGORIES.SEMI_CRITICAL.rangeDescription.includes('20% to 40%'));
    assert.ok(WATER_TABLE_CATEGORIES.SAFE.rangeDescription.includes('40% to 70%'));
    assert.ok(WATER_TABLE_CATEGORIES.OPTIMAL.rangeDescription.includes('> 70%'));
  });

  await t.test('2. AI Mentor Input Validation Schemas', () => {
    // Valid chat input
    const validChat = askQuestionSchema.safeParse({
      message: 'How does drip irrigation save groundwater in my village?',
      sessionId: 'ses-123',
      includeSimulationContext: true
    });
    assert.equal(validChat.success, true);

    // Empty message should fail
    const emptyChat = askQuestionSchema.safeParse({ message: '' });
    assert.equal(emptyChat.success, false);

    // Overly long message should fail
    const longChat = askQuestionSchema.safeParse({ message: 'a'.repeat(1600) });
    assert.equal(longChat.success, false);

    // Quiz topic validation
    assert.equal(quizQuestionSchema.safeParse({ topic: 'RECHARGE' }).success, true);
    assert.equal(quizQuestionSchema.safeParse({ topic: 'IRRIGATION' }).success, true);
    assert.equal(quizQuestionSchema.safeParse({ topic: 'INVALID_TOPIC' }).success, false);
  });

  await t.test('3. Student Hydro Context Sanitation (Zero Credential Leakage)', async () => {
    const context = await AiMentorContext.getStudentHydroContext('u-student-01');
    assert.ok(context);
    
    // Check that context contains only relevant hydrology fields
    assert.equal(typeof context.villageName, 'string');
    assert.equal(typeof context.baselineAquifer?.storagePercentage === 'number' || typeof context.waterBalance?.storagePercentage === 'number', true);

    // Strictly ensure no credentials or tokens are present in context
    const contextStr = JSON.stringify(context);
    assert.equal(contextStr.includes('password'), false);
    assert.equal(contextStr.includes('token'), false);
    assert.equal(contextStr.includes('secret'), false);
    assert.equal(contextStr.includes('hash'), false);
  });

  await t.test('4. Deterministic Educational Mentor Fallback (Without API Key)', async () => {
    const studentUser = { id: 'u-student-01', email: 'aarav@jalrakshak.org', role: 'STUDENT' };

    // Test recharge inquiry
    const rechargeResponse = await AiMentorService.askMentor('u-student-01', studentUser, {
      message: 'What is a check dam and how does it help aquifer recharge?'
    });

    assert.ok(rechargeResponse.reply);
    assert.equal(rechargeResponse.provider, 'educational-engine');
    assert.equal(rechargeResponse.isAiGenerated, false);
    assert.ok(rechargeResponse.notice.includes('OPENAI_API_KEY is not configured') || rechargeResponse.notice.includes('deterministic'));
    assert.ok(rechargeResponse.reply.includes('Check Dam') || rechargeResponse.reply.includes('recharge'));

    // Verify actionable game navigation extraction
    assert.ok(Array.isArray(rechargeResponse.recommendedActions));
    const damAction = rechargeResponse.recommendedActions.find(a => a.target === 'NAVIGATE_CHECK_DAM');
    assert.ok(damAction, 'Expected NAVIGATE_CHECK_DAM action in response');
  });

  await t.test('5. Drip Irrigation Keyword & Action Routing', async () => {
    const studentUser = { id: 'u-student-01', email: 'aarav@jalrakshak.org', role: 'STUDENT' };

    const dripResponse = await AiMentorService.askMentor('u-student-01', studentUser, {
      message: 'Why should our farmers adopt drip irrigation?'
    });

    assert.ok(dripResponse.reply.includes('Drip') || dripResponse.reply.includes('Irrigation'));
    const farmAction = dripResponse.recommendedActions.find(a => a.target === 'NAVIGATE_FARM');
    assert.ok(farmAction, 'Expected NAVIGATE_FARM action');
  });

  await t.test('6. Conservation Recommendations Engine', async () => {
    const recs = await AiMentorService.getRecommendations('u-student-01');
    assert.ok(Array.isArray(recs.recommendations));
    assert.ok(recs.recommendations.length >= 3);

    const categories = recs.recommendations.map(r => r.category);
    assert.ok(categories.includes('AGRICULTURE') || categories.includes('WATERSHED'));
  });

  await t.test('7. Educational Quiz Generator', () => {
    const quiz = AiMentorService.getQuizQuestion('RECHARGE');
    assert.ok(quiz.question);
    assert.equal(quiz.options.length, 4);
    assert.equal(quiz.correctOption, 'B');
    assert.ok(quiz.explanation);
  });
});
