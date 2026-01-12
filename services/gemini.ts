
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse } from "../types";

export const generateEducationalContent = async (
  topic: string, 
  grade: string, 
  rawContent: string,
  pageCount: number
): Promise<AIResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `أنت مصمم مناهج تعليمية عالمي. مهمتك تحويل النص الخام إلى مذكرة تعليمية احترافية جداً ومنظمة.
الموضوع: "${topic}"، المستوى: "${grade}".
يجب أن تتكون المذكرة من ${pageCount} صفحات بالضبط.

لكل صفحة، قم بصياغة المحتوى بالتنسيق التالي:
1. عنوان الصفحة: يجب أن يكون ملفتاً ومرتبطاً بالموضوع الفرعي.
2. الأهداف (Objectives): قائمة نقطية قصيرة بما سيتعلمه الطالب في هذه الصفحة.
3. المحتوى الرئيسي (Main Body): شرح منظم باستخدام (h3, p, ul, li). استخدم لغة تعليمية رصينة.
4. قسم "هل تعلم" أو "معلومة إضافية": لإضفاء طابع احترافي.
5. وصف الصورة (Image Prompt): وصف دقيق بالإنجليزية لصورة توضيحية عالية الجودة (3D, Cinematic, or Clean Vector) توضع في يسار الصفحة.

يجب أن يكون الرد بتنسيق JSON حصراً:
{
  "title": "عنوان المذكرة الرئيسي",
  "pages": [
    {
      "title": "عنوان الصفحة",
      "content": "HTML content using h3, p, ul, li with professional sections",
      "imagePrompt": "Detailed English prompt for the image"
    }
  ]
}`;

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
    return JSON.parse(response.text || '{}') as AIResponse;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("حدث خطأ أثناء تنظيم المحتوى بشكل احترافي.");
  }
};

export const generatePageImage = async (prompt: string): Promise<string | undefined> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `High-end professional educational illustration, 3D render style, soft global illumination, masterpiece, minimalist composition, related to: ${prompt}` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4" // Portrait for side layout
        }
      }
    });

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
