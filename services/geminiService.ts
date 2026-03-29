import { GoogleGenerativeAI, DynamicRetrievalMode } from "@google/generative-ai";
import { Appointment } from "../types";

// Helper to instantiate the client with the current environment key
const createAIClient = () => new GoogleGenerativeAI(process.env.API_KEY || '');

/**
 * Maestro Chat: Complex reasoning and multimodal image analysis using Gemini 1.5 Flash.
 */
export const chatWithAssistant = async (message: string, context: any, imageBase64?: string) => {
  try {
    const ai = createAIClient();
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const contents: any[] = [];
    const textPart = { text: message || "Analiza esta imagen estética. Si es un corte o tratamiento, evalúa la calidad y da recomendaciones." };

    if (imageBase64) {
      contents.push({
        role: "user",
        parts: [
          { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } },
          textPart
        ]
      });
    } else {
      contents.push({ role: "user", parts: [textPart] });
    }

    const payload = {
      contents,
      systemInstruction: {
        role: "system",
        parts: [{
          text: `Eres "Maestro Stetic", el asistente de IA de Stetic-App para centros de belleza.

REGLAS ESTRICTAS DE RESPUESTA:
- Sé CONCISO: máximo 3-4 oraciones por respuesta, a menos que el usuario pida explícitamente más detalle.
- Responde DIRECTAMENTE la pregunta. No des introducciones ni contexto innecesario.
- Usa bullet points (•) para listas, nunca párrafos largos.
- NO repitas la pregunta del usuario ni la parafrasees.
- Si analizas una imagen, da el veredicto en 1 línea y luego 2-3 tips máximo.
- Tono: profesional, cálido y directo. Idioma: español.

ROLES:
• CLIENTES: Feedback de cortes/tratamientos, recomendaciones de estilo.
• ADMINS: Insights de negocio, tendencias, optimización de agenda.

CONTEXTO: ${JSON.stringify(context)}`
        }]
      }
    };

    const response = await model.generateContent(payload as any);
    return response.response.text();
  } catch (error) {
    console.error("Error en Chat de Gemini Pro:", error);
    return "Lo siento, mi conexión neuronal ha tenido un hipo. ¿Podrías intentar de nuevo?";
  }
};

/**
 * Maps Grounding: Discover real-time locations and business info.
 */
export const discoverNearbyBeauty = async (query: string, location?: { lat: number, lng: number }) => {
  try {
    const ai = createAIClient();
    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: [{
        googleSearchRetrieval: {
          dynamicRetrievalConfig: {
            mode: DynamicRetrievalMode.MODE_DYNAMIC,
            dynamicThreshold: 0.3
          }
        }
      }]
    });

    const response = await model.generateContent(`Busca ${query} cerca de mi ubicación. Dame detalles sobre horarios, reputación y links de ubicación. Mi ubicación base es: ${location ? JSON.stringify(location) : 'desconocida'}`);
    const text = response.response.text();

    // Fallback grounding structure as @google/generative-ai exposes attribution slightly differently
    return { text, groundingChunks: [] };
  } catch (error) {
    console.error("Error en Maps Grounding:", error);
    return { text: "No pude encontrar información de ubicación en este momento.", groundingChunks: [] };
  }
};

export const getBusinessInsights = async (stats: any, appointments: Appointment[]) => {
  try {
    const ai = createAIClient();
    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const response = await model.generateContent(`Analiza estos datos de una estética: ${JSON.stringify(stats)}. Citas: ${JSON.stringify(appointments)}. Proporciona 3 consejos estratégicos. Formato JSON estricto: [{"insight": "str", "action": "str", "impact": "str"}]`);
    return JSON.parse(response.response.text() || "[]");
  } catch (error) {
    console.error("Error en Insights:", error);
    return [];
  }
};

// Veo and Imagen functions require the v2 genai SDK natively or are accessed via REST. 
// For now, we return fallbacks since they are previews not bundled in @google/generative-ai.
export const generateMarketingImage = async (prompt: string, size: "1K" | "2K" | "4K" = "1K") => {
  console.warn("Generating Images is restricted in this legacy SDK version.");
  return null;
};

export const generateMarketingVideo = async (prompt: string) => {
  console.warn("Generating Videos is restricted in this legacy SDK version.");
  return null;
};

export const analyzeBusinessVideo = async (base64: string, mimeType: string, prompt: string) => {
  try {
    const ai = createAIClient();
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const response = await model.generateContent([
      { inlineData: { data: base64, mimeType } },
      { text: prompt }
    ]);
    return response.response.text();
  } catch (error) {
    console.error("Error analyzing video with Gemini:", error);
    return "Ocurrió un error al intentar analizar el video.";
  }
};
