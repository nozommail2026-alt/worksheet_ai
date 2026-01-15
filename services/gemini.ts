import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse } from "../types";

export const generateEducationalContent = async (
  topic: string, 
  grade: string, 
  rawContent: string
): Promise<AIResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `أنت بروفيسور خبير ومصمم جرافيك تعليمي متخصص في إنتاج مذكرات PDF عالمية المستوى. 
هدفك الأسمى هو "القضاء على الفراغات البيضاء" (Eliminate White Space) وجعل كل صفحة A4 ممتلئة تماماً بالمحتوى التعليمي الغني.

قواعد "الكثافة القصوى" (Maximum Density Rules):
1. قاعدة الـ 90%: كل صفحة يجب أن تكون ممتلئة بنسبة 90% على الأقل. إذا كان النص الأصلي قصيراً، "يجب" عليك اختراع محتوى إضافي ذو صلة وثيقة مثل:
   - "تحليل معمق": شرح فيزيائي/منطقي معقد للمفاهيم.
   - "قصص واقعية": كيف غير هذا المفهوم وجه التاريخ أو الصناعة.
   - "تطبيقات متقدمة": تمارين للمتفوقين.
   - "مقارنة شمولية": جداول ضخمة تقارن بين عدة عناصر.
2. التنسيق الهيكلي الدسم: استخدم HTML غني جداً يوزع العناصر عمودياً:
   - ابدأ بـ h2 و h3 بشكل متكرر.
   - استخدم صناديق <div class="insight-box"> للنظريات.
   - استخدم <div class="pro-tip"> للمهارات العملية.
   - استخدم <div class="case-study"> لتحليل الأمثلة.
   - كرر استخدام الجداول والقوائم النقطية لزيادة الطول البصري.
3. الاختبارات المرحلية: في نهاية "كل" صفحة (ما عدا الأخيرة)، أضف قسم <div class="quiz-section"> يحتوي على ٤ أسئلة MCQ و ٣ أسئلة صح وخطأ لضمان استغلال أسفل الورقة.
4. الصفحة الختامية: يجب أن تكون صفحة "الاختبار النهائي والملخص الذهبي" وتكون دسمة جداً (١٠ أسئلة MCQ، ٥ أسئلة مقالية قصيرة، وملخص في جدول).

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
      "title": "عنوان القسم",
      "content": "HTML كثيف جداً (h2, p, insight-box, pro-tip, quiz-section). تأكد من أن طول النص يتجاوز 600 كلمة لكل صفحة لضمان ملء الورقة.",
      "imagePrompt": "Detailed scientific illustration of ${topic}, 3D macro photography style, white background."
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
    throw new Error("فشل في توليد المذكرة الكثيفة. يرجى المحاولة مرة أخرى.");
  }
};

export const generatePageImage = async (prompt: string): Promise<string | undefined> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `${prompt} | Professional educational 3D icon, studio lighting, white background.` }]
      },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  } catch (e) {}
  return undefined;
};