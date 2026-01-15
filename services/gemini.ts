
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse } from "../types";

export const generateEducationalContent = async (
  topic: string, 
  grade: string, 
  rawContent: string
): Promise<AIResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `أنت بروفيسور خبير ومصمم جرافيك تعليمي متخصص في إنتاج مذكرات PDF عالمية المستوى.
المهمة: تحويل المادة العلمية إلى مذكرة تعليمية احترافية تملأ صفحات A4 بالكامل دون أي فراغات ضائعة.

قواعد "التصميم التعليمي الكثيف" (Design Learning Rules):
1. املأ الصفحة بالكامل: إذا كان المحتوى الأصلي قصيراً، "يجب" عليك التوسع أكاديمياً عبر إضافة: (شرح عميق للمفاهيم، أمثلة واقعية، مقارنات بصرية، نصائح احترافية، تحليل للأخطاء الشائعة).
2. هيكلية الصفحة: كل صفحة يجب أن تحتوي على:
   - مقدمة "لماذا نتعلم هذا؟" (The Why).
   - شرح بجمال قصيرة (Short sentences only).
   - صناديق "إضاءة" (Insight Box) و "نصيحة ذهبية" (Pro Tip).
   - قسم "تحدي سريع" في نهاية كل صفحة (2 MCQ + 1 T/F).
3. الصفحة الختامية (إلزامية): يجب أن تكون الصفحة الأخيرة في المصفوفة بعنوان "الاختبار الشامل للمذكرة" وتحتوي على:
   - 5 أسئلة اختيار من متعدد (MCQ) تغطي المذكرة بالكامل.
   - 5 أسئلة صح وخطأ (T/F) شاملة.
   - ملخص "الخلاصة في نقاط".
4. الهوية البصرية: استخدم h2 للعناوين الرئيسية، h3 للفرعية، وقوائم نقطية. صف صوراً ذكية في imagePrompt ليتم وضعها بوضعية "عائمة" (Float).

الموضوع: "${topic}" | المرحلة: "${grade}"
المادة الخام:
"""
${rawContent}
"""

يجب أن يكون الرد بتنسيق JSON حصراً:
{
  "title": "عنوان المذكرة الجذاب",
  "pages": [
    {
      "title": "عنوان الدرس",
      "content": "HTML كثيف جداً يتضمن (h2, p, insight-box, pro-tip, quiz-section). تأكد من ملء الفراغات تماماً.",
      "imagePrompt": "Professional 3D educational icon, clean background, related to ${topic}"
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
    throw new Error("فشل في توليد المذكرة الكثيفة. يرجى التأكد من المادة العلمية.");
  }
};

export const generatePageImage = async (prompt: string): Promise<string | undefined> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `${prompt} | Educational diagram, minimalist 3D, white background.` }]
      },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  } catch (e) {}
  return undefined;
};
