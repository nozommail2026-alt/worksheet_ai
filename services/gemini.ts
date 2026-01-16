
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse } from "../types";

export const generateEducationalContent = async (
  topic: string, 
  grade: string, 
  rawContent: string
): Promise<AIResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `أنت بروفيسور خبير ومصمم جرافيك تعليمي متخصص. 
هدفك: إنتاج مذكرة A4 احترافية تبدأ بـ "صفحة غلاف" (Cover Page) مبهرة ثم تليها صفحات ممتلئة بالكامل.

قواعد هيكلية المذكرة:
1. الصفحة الأولى (إلزامية): يجب أن تكون "صفحة غلاف" حصرياً.
   - اضبط الحقل isCover: true لهذه الصفحة فقط.
   - imagePrompt: يجب أن يصف صورة "سينمائية، فائقة الجودة، بانورامية" تعبر عن جوهر الدرس.
   - content: يجب أن يكون بسيطاً جداً (فقط مقدمة ترحيبية قصيرة جداً لا تتجاوز ٣٠ كلمة).
   - title: هو عنوان الدرس الكبير.

2. الصفحات التالية (ممتلئة):
   - يجب أن تكون دسمة تعليمياً (Zero White Space).
   - أضف أقسام "العمق المعرفي"، "الربط بالواقع"، و"أخطاء شائعة".
   - استخدم h2، h3، insight-box، pro-tip، و case-study.
   - أضف quiz-section في أسفل كل صفحة تعليمية.

3. الكثافة: كل صفحة تعليمية (بعد الغلاف) يجب أن تحتوي على ٧٠٠ كلمة على الأقل.

الموضوع: "${topic}" | المرحلة: "${grade}"
المادة الخام:
"""
${rawContent}
"""

يجب أن يكون الرد بتنسيق JSON حصراً:
{
  "title": "عنوان المذكرة الشامل",
  "pages": [
    {
      "isCover": true,
      "title": "عنوان الغلاف",
      "content": "مقدمة بسيطة جداً للغلاف",
      "imagePrompt": "Cinematic high-detail cover art for ${topic}, educational 3D, center composition, white background."
    },
    {
      "isCover": false,
      "title": "عنوان الصفحة التعليمية الأولى",
      "content": "HTML كثيف جداً يملأ الورقة بالكامل...",
      "imagePrompt": "Detailed technical diagram of ${topic}, 3D, white background."
    }
  ]
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 32000 },
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
                isCover: { type: Type.BOOLEAN },
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
    const text = response.text;
    return JSON.parse(text || '{}') as AIResponse;
  } catch (e) {
    throw new Error("فشل في توليد المذكرة. يرجى المحاولة مجدداً.");
  }
};

export const generatePageImage = async (prompt: string): Promise<string | undefined> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `${prompt} | Professional studio photography style, high contrast, clean white background.` }]
      },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  } catch (e) {}
  return undefined;
};
