import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Product, StylingNote } from "@/types/menu";

// ─────────────────────────────────────────────────────────────
// Gemini 1.5 Flash — editorial interior-stylist notes.
// SECURITY NOTE: For production, proxy this through a Cloud
// Function so the API key never lives in the client bundle.
// The current setup is fine for local dev / private demos.
// ─────────────────────────────────────────────────────────────

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

function client() {
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
}

const SYSTEM_PROMPT = `You are the head stylist of GRACE FURNITURE, a
high-end design house. Voice: editorial, confident, tactile, restrained.
You write in the manner of Dwell, Cereal, and Architectural Digest.

You write two-line styling notes for individual furniture pieces.
No emoji. No marketing clichés ("game-changer", "must-have", "timeless"
without specific reason). No real-estate-listing language. Focus on
materials, proportion, light, and how the piece behaves in a room.

Return STRICT JSON, no markdown fences:
{
  "description": "Two short evocative sentences. Max 240 characters total.",
  "roomFit": "One short room/pairing suggestion. Max 70 characters. (e.g., 'A reading corner with a sheepskin throw and warm side light.')",
  "highlights": ["3 to 4 short material/style/feel tags, 2-3 words each"]
}`;

export async function generateStylingNote(
  item: Product,
): Promise<StylingNote> {
  const c = client();
  if (!c) {
    // Graceful fallback so the UI never breaks.
    return {
      description: item.description,
      roomFit: undefined,
      highlights: item.materials.slice(0, 4),
    };
  }

  const model = c.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.85,
      responseMimeType: "application/json",
    },
  });

  const userPrompt = `Piece: ${item.name}
Style: ${item.style}
Price: $${item.price.toLocaleString()}
Materials: ${item.materials.join(", ")}
Dimensions: ${item.dimensions.width}W × ${item.dimensions.depth}D × ${item.dimensions.height}H cm
Existing copy: ${item.description}

Write the styling note now.`;

  try {
    const res = await model.generateContent(userPrompt);
    const text = res.response.text();
    return JSON.parse(text) as StylingNote;
  } catch (err) {
    console.warn("[gemini] falling back:", err);
    return {
      description: item.description,
      highlights: item.materials.slice(0, 4),
    };
  }
}

/** Back-compat export — useGeminiInsights still imports `generateTastingNote`. */
export const generateTastingNote = generateStylingNote;

export function isGeminiConfigured(): boolean {
  return Boolean(apiKey);
}
