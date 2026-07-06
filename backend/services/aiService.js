const axios = require('axios');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

const isConfigured = Boolean(ANTHROPIC_API_KEY);

if (!isConfigured) {
  console.warn(
    '[AI] ANTHROPIC_API_KEY not found in .env — AI features will return a clear "not configured" ' +
      'response instead of calling the API. Add ANTHROPIC_API_KEY to enable scam analysis and the chat assistant.'
  );
}

const client = axios.create({
  baseURL: 'https://api.anthropic.com',
  headers: {
    'x-api-key': ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  },
  timeout: 20000,
});

const SCAM_ANALYSIS_SYSTEM_PROMPT = `You are the fraud-detection engine inside Kavach, a safety app for senior citizens, built for the Ahmedabad City Police Cyber Crime Branch.

You will be given a message, call transcript, or description of a phone call/SMS/WhatsApp/email that a senior citizen received and is worried about. Analyze it for common fraud patterns seen in India, including but not limited to: OTP scams, fake bank KYC update requests, digital arrest scams (fraudsters posing as police/CBI/customs claiming a warrant or parcel seizure), fake investment or trading schemes, lottery/prize scams, tech support scams, romance scams, phishing links, and impersonation of relatives asking for urgent money transfers.

Respond with ONLY a single valid JSON object, no markdown fences, no commentary before or after it, in exactly this shape:
{
  "riskScore": <integer 0-100>,
  "riskLevel": "low" | "medium" | "high" | "critical",
  "redFlags": [<short strings, each a specific red flag found in the text>],
  "explanation": "<2-3 plain-language sentences a senior citizen can easily understand, written in a calm, non-alarming tone>",
  "recommendedAction": "<one clear, specific next step, e.g. 'Do not share the OTP. Hang up and call your bank using the number on your card.'>"
}

If the message appears to be completely normal and safe (e.g. a message from a known family member with no urgency or money/credential requests), return a low riskScore and say so plainly. Never invent details that are not in the message. Keep the tone reassuring, never frightening.`;

const CHAT_SYSTEM_PROMPT = `You are the "Ask Kavach" assistant, built into a safety app for senior citizens in Ahmedabad, India, run with the Cyber Crime Branch.

Your audience is elderly users, some of whom are not comfortable with technology. Follow these rules strictly:
- Use short sentences and plain, everyday language. Avoid technical jargon.
- Be warm, patient, and respectful. Never make the person feel foolish for asking.
- Focus on cybersecurity awareness (scams, OTP safety, phishing, safe banking habits), how to use the Kavach app (SOS button, check-ins, reporting fraud), and general safety guidance.
- If asked about a specific medical symptom or diagnosis, do not diagnose. Gently suggest they contact their doctor or a family member, and mention they can use the app's emergency button if it is urgent.
- If someone describes an active, ongoing scam attempt or emergency happening right now, clearly tell them to use the SOS button in the app or call the police helpline, in addition to any other guidance.
- Keep replies brief — a few short sentences or a short list, not long essays, since this is read by people who may find long text tiring.`;

const stripJsonFences = (text) => {
  return text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
};

/**
 * Analyzes a suspicious message/call transcript for scam likelihood.
 * Falls back to a clear "not configured" result if no API key is set, so the
 * rest of the app keeps working in demo mode without crashing.
 */
const analyzeScamMessage = async (messageText) => {
  if (!isConfigured) {
    return {
      riskScore: 50,
      riskLevel: 'medium',
      redFlags: ['AI analysis unavailable'],
      explanation:
        'The AI scam checker is not fully set up yet (missing ANTHROPIC_API_KEY on the server). Please forward this message to a family member or the Cyber Crime Branch to be safe.',
      recommendedAction: 'Do not respond to the message. Ask a trusted family member to review it with you.',
      demo: true,
    };
  }

  try {
    const response = await client.post(ANTHROPIC_URL, {
      model: ANTHROPIC_MODEL,
      max_tokens: 600,
      system: SCAM_ANALYSIS_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Please analyze this message for fraud risk:\n\n"""${messageText}"""`,
        },
      ],
    });

    const textBlock = response.data.content.find((block) => block.type === 'text');
    const parsed = JSON.parse(stripJsonFences(textBlock.text));

    return {
      riskScore: parsed.riskScore,
      riskLevel: parsed.riskLevel,
      redFlags: parsed.redFlags || [],
      explanation: parsed.explanation,
      recommendedAction: parsed.recommendedAction,
      demo: false,
    };
  } catch (error) {
    console.error('[AI] Scam analysis failed:', error.response?.data || error.message);
    return {
      riskScore: null,
      riskLevel: 'medium',
      redFlags: [],
      explanation:
        'We could not complete an automatic analysis right now. Please treat this message with caution and do not share any OTP, password, or bank details.',
      recommendedAction: 'When in doubt, do not respond, and verify directly with the organization using an official number.',
      demo: false,
      error: true,
    };
  }
};

/**
 * Senior-friendly conversational assistant. `history` is an array of
 * { role: 'user' | 'assistant', content: string } from the current chat session.
 */
const chatAssistant = async (history = [], newMessage) => {
  if (!isConfigured) {
    return {
      reply:
        "The AI assistant isn't fully set up yet — the server is missing its ANTHROPIC_API_KEY. Please ask a family member for help in the meantime, or use the SOS button if this is an emergency.",
      demo: true,
    };
  }

  try {
    const messages = [...history, { role: 'user', content: newMessage }];

    const response = await client.post(ANTHROPIC_URL, {
      model: ANTHROPIC_MODEL,
      max_tokens: 400,
      system: CHAT_SYSTEM_PROMPT,
      messages,
    });

    const textBlock = response.data.content.find((block) => block.type === 'text');
    return { reply: textBlock.text, demo: false };
  } catch (error) {
    console.error('[AI] Chat assistant failed:', error.response?.data || error.message);
    return {
      reply: "I'm having trouble responding right now. Please try again in a moment, or ask a family member for help.",
      demo: false,
      error: true,
    };
  }
};

module.exports = { isConfigured, analyzeScamMessage, chatAssistant };
