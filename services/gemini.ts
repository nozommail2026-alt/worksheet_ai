import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse } from "../types";

// The Google GenAI SDK initialization should use the process.env.API_KEY directly.
// To ensure the most up-to-date environment values, we initialize the client inside each service call.

export const generateEducationalContent = async (
  topic: string, 
  grade: string, 
  rawContent: string,
  pageCount: number
): Promise<AIResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `أنت خبير في تصميم المناهج التعليمية وتنسيق المذكرات. بناءً على المحتوى الخام التالي: "${rawContent}"، والموضوع العام: "${topic}" للمستوى: "${grade}".
قم بتنظيم هذا المحتوى في مذكرة تعليمية احترافية ومنظمة جداً كمواضيع مرتبة.
يجب أن تتكون المذكرة من عدد صفحات يساوي تماماً: ${pageCount} صفحات.
الشروط:
1. قسم المحتوى إلى ${pageCount} موضوع رئيسي، كل موضوع يخصص له صفحة واحدة مستقلة.
2. لكل صفحة، اكتب عنوان الموضوع بشكل واضح وجذاب.
3. نسق المحتوى داخل كل صفحة باستخدام HTML (h3 للعناوين الجانبية، p للشرح، ul/li للنقاط).
4. تأكد من أن كل صفحة تحتوي على وجبة دسمة ومنظمة من المعلومات دون حشو.
5. لكل صفحة، قدم وصفاً دقيقاً بالإنجليزية لصورة توضيحية (Image Prompt) تعبر عن موضوع هذه الصفحة تحديداً.
يجب أن يكون الرد بتنسيق JSON حصراً.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          pages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                imagePrompt: { type: Type.STRING }
              },
              required: ["title", "content", "imagePrompt"]
            }
          }
        },
        required: ["title", "pages"]
      }
    }
  });

  try {
    // Correctly using response.text property to extract output string.
    return JSON.parse(response.text || '{}') as AIResponse;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("حدث خطأ أثناء تحليل وتنظيم المحتوى.");
  }
};

export const generatePageImage = async (prompt: string): Promise<string | undefined> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Professional educational 3D illustration, clean vector style, minimalist, soft lighting, educational icons, white background, high quality, subject: ${prompt}` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    // Per guidelines, iterate through response parts to find image data.
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  } catch (e) {
    console.error("Image generation failed", e);
  }
  return undefined;
};