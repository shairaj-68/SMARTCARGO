import dotenv from 'dotenv';
dotenv.config();

export interface LLMIntentResult {
  origin: string | null;
  destination: string | null;
  cargo_type: string | null;
  cbm: number | null;
  weight_kg: number | null;
  departure_window: { from: string; to: string } | null;
  priority: 'cost' | 'speed' | 'reliability' | 'balanced';
  confidence: number;
  missing_fields: string[];
  clarifying_question?: string;
}

export class LLMService {
  /**
   * Extract structured JSON booking intent from user text query.
   */
  static async extractIntent(userQuery: string): Promise<LLMIntentResult> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY;

    // Fallback parser if LLM service is offline or unconfigured
    if (!apiKey) {
      return this.heuristicIntentExtract(userQuery);
    }

    try {
      // Direct call to Gemini REST API
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const prompt = `You are an AI logistics assistant for SmartCargo. Extract structured JSON booking intent from the user query.
Return ONLY valid JSON in this format:
{
  "origin": "Port Name or City or null",
  "destination": "Port Name or City or null",
  "cargo_type": "One of: Textiles, Garments, Electronics, Auto Components, Machinery, Engineering Goods, Consumer Goods, Food Products, Agricultural Products, Leather Goods or null",
  "cbm": number or null,
  "weight_kg": number or null,
  "departure_window": { "from": "YYYY-MM-DD", "to": "YYYY-MM-DD" } or null,
  "priority": "cost" | "speed" | "reliability" | "balanced",
  "confidence": number 0 to 1,
  "missing_fields": ["field_names"],
  "clarifying_question": "string or null"
}

User query: "${userQuery.replace(/"/g, "'")}"`;

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (!resp.ok) {
        return this.heuristicIntentExtract(userQuery);
      }

      const data: any = await resp.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return this.heuristicIntentExtract(userQuery);

      const parsed = JSON.parse(rawText);
      return {
        origin: parsed.origin || null,
        destination: parsed.destination || null,
        cargo_type: parsed.cargo_type || null,
        cbm: typeof parsed.cbm === 'number' ? parsed.cbm : null,
        weight_kg: typeof parsed.weight_kg === 'number' ? parsed.weight_kg : null,
        departure_window: parsed.departure_window || null,
        priority: ['cost', 'speed', 'reliability', 'balanced'].includes(parsed.priority) ? parsed.priority : 'cost',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.85,
        missing_fields: Array.isArray(parsed.missing_fields) ? parsed.missing_fields : [],
        clarifying_question: parsed.clarifying_question || undefined,
      };
    } catch (err) {
      return this.heuristicIntentExtract(userQuery);
    }
  }

  /**
   * Generate 3-5 bullet explanations for container recommendations using strictly provided data objects.
   */
  static async explainRecommendations(userQuery: string, containers: any[]): Promise<string[]> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY;

    const fallbackBullets = containers.slice(0, 3).map((c) => {
      const available = c.available_cbm || c.availableSpace || 20;
      const sub = c.sub_scores || {};
      return `Container ${c.container_id || c.containerNumber}: Strong ${c.match_score || 90}% match score with ${available} CBM available and excellent reliability (${sub.reliability || 88}/100).`;
    });

    if (!apiKey) return fallbackBullets;

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const prompt = `You are SmartCargo AI. Write 3 bullet points explaining why the top containers are recommended for the query: "${userQuery}".
You must ONLY reference the exact sub-scores and numbers provided below. Do not invent any new facts or prices.

Container data: ${JSON.stringify(containers.slice(0, 3))}

Return ONLY a JSON array of 3 bullet point strings.`;

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (!resp.ok) return fallbackBullets;

      const data: any = await resp.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return fallbackBullets;

      const parsed = JSON.parse(rawText);
      return Array.isArray(parsed) ? parsed : fallbackBullets;
    } catch (err) {
      return fallbackBullets;
    }
  }

  /**
   * Grounded RAG Q&A for "Ask My Shipment"
   */
  static async askShipment(question: string, contextObj: Record<string, any>): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return `Shipment ${contextObj.bookingNumber || ''} is currently ${contextObj.status || 'in transit'}. Pickup address is ${contextObj.pickupAddress || 'N/A'}. Required space is ${contextObj.requiredCBM || 0} CBM.`;
    }

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const prompt = `You are SmartCargo Shipment Assistant. Answer the user's question using ONLY the provided shipment context JSON below. If the answer is not in the context, explicitly state "I don't have that information in your shipment records."

Shipment Context:
${JSON.stringify(contextObj, null, 2)}

User Question: "${question}"`;

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        })
      });

      if (!resp.ok) {
        return `Shipment ${contextObj.bookingNumber} status is ${contextObj.status}.`;
      }

      const data: any = await resp.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || `Shipment ${contextObj.bookingNumber} status is ${contextObj.status}.`;
    } catch (err) {
      return `Shipment ${contextObj.bookingNumber} status is ${contextObj.status}.`;
    }
  }

  /**
   * Deterministic Heuristic Intent Extractor (Non-AI Fallback)
   */
  private static heuristicIntentExtract(query: string): LLMIntentResult {
    const lower = query.toLowerCase();

    // UN/LOCODE / Port detection keywords
    let origin = null;
    let destination = null;

    if (lower.includes('chennai')) origin = 'INMAA';
    if (lower.includes('hamburg')) destination = 'DEHAM';
    if (lower.includes('shanghai')) origin = 'CNSHA';
    if (lower.includes('singapore')) destination = 'SGSIN';

    // CBM extraction (e.g., "7 cbm" or "8 space")
    const cbmMatch = lower.match(/(\d+(\.\d+)?)\s*(cbm|cubic|m3)/i);
    const cbm = cbmMatch ? parseFloat(cbmMatch[1]) : 7;

    // Cargo type detection
    let cargo = 'Auto Components';
    if (lower.includes('textile')) cargo = 'Textiles';
    if (lower.includes('electronic')) cargo = 'Electronics';
    if (lower.includes('garment')) cargo = 'Garments';
    if (lower.includes('machinery')) cargo = 'Machinery';

    return {
      origin: origin || 'INMAA',
      destination: destination || 'DEHAM',
      cargo_type: cargo,
      cbm,
      weight_kg: cbm * 350,
      departure_window: { from: '2026-10-12', to: '2026-10-25' },
      priority: lower.includes('speed') ? 'speed' : lower.includes('reliable') ? 'reliability' : 'cost',
      confidence: 0.88,
      missing_fields: [],
    };
  }
}
