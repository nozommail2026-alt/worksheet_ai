import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import PageEditor from './components/PageEditor';
import { NotePage, BrandConfig } from './types';
import { generateEducationalContent, generatePageImage } from './services/gemini';
import { Loader2, Sparkles, Trash2, X, Layers } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showHTMLModal, setShowHTMLModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [brand, setBrand] = useState<BrandConfig>({
    name: 'الأستاذ المتميز',
    theme: 'professional',
    primaryColor: '#1e3a8a',
    secondaryColor: '#0f172a',
    fontFamily: 'Tajawal'
  });

  const [pages, setPages] = useState<NotePage[]>([
    {
      id: 'welcome',
      title: 'مرحباً بك',
      content: `<h2>أهلاً بك في الإصدار الإبداعي لـ DafterAI 🎓</h2>
      <p>لقد قمنا بتحديث النظام ليتبع مبادئ التصميم التعليمي العالمية. كل صفحة ستكون الآن غنية، منظمة، وتفاعلية.</p>
      <div class="insight-box">💡 <b>ما الجديد؟</b> المحتوى الآن يتضمن أسئلة MCQ وصح وخطأ تلقائياً لضمان تفاعل الطالب.</div>
      <div class="pro-tip">⭐ <b>نصيحة التصميم:</b> الصورة الآن تلتف حولها النصوص لضمان استغلال كل مليمتر في الورقة.</div>
      <div class="quiz-section">
        <h3 style="margin:0 0 10px 0; font-size:1rem; color:#1e3a8a;">اختبر مهاراتك (مثال):</h3>
        <div class="mcq-item">١. أي من المزايا التالية هي الأهم في DafterAI؟ <br/> <span class="option">أ. السرعة</span> <span class="option">ب. التصميم البصري</span> <span class="option">ج. التفاعل</span></div>
        <div class="tf-item"><span>توليد الأسئلة يتم تلقائياً</span> <span>[صح / خطأ]</span></div>
      </div>`,
      footer: brand.name
    }
  ]);

  const handleGenerate = async () => {
    if (!topic || !rawContent) return;
    setLoading(true);
    try {
      const aiData = await generateEducationalContent(topic, grade, rawContent);
      const processedPages: NotePage[] = [];
      for (const p of aiData.pages) {
        const imageUrl = await generatePageImage(p.imagePrompt);
        processedPages.push({
          id: Math.random().toString(36).substr(2, 9),
          title: p.title,
          content: p.content,
          imageUrl: imageUrl,
          footer: brand.name
        });
      }
      setPages(processedPages);
      setShowGenerateModal(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageSplit = (pageIndex: number, excessHtml: string) => {
    const newPages = [...pages];
    newPages.splice(pageIndex + 1, 0, {
      id: Math.random().toString(36).substr(2, 9),
      title: 'تكملة المادة',
      content: excessHtml,
      footer: brand.name
    });
    setPages(newPages);
  };

  const generateFullHTML = () => {
    const pagesHTML = pages.map((page, index) => `
      <div style="width: 210mm; height: 297mm; background: white; margin: 40px auto; padding: 15mm; direction: rtl; font-family: 'Tajawal', sans-serif; position: relative; border-bottom: 5px solid ${brand.primaryColor}">
         <div style="border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 11px; font-weight: 900; color: ${brand.primaryColor};">${brand.name}</div>
            <div style="font-size: 10px; font-weight: 900; color: #cbd5e1;">صفحة ${index + 1}</div>
         </div>
         <div class="editor-content" style="font-size: 16px; line-height: 1.5; color: #0f172a;">
           ${page.imageUrl ? `<img src="${page.imageUrl}" style="float:left; width:25%; margin:0 15px 10px 0; border-radius:10px;" />` : ''}
           ${page.content}
         </div>
      </div>`).join('');
    return `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet"><style>.editor-content h2{font-weight:900; color:#1e3a8a; border-right:4px solid; padding-right:12px; margin-bottom:15px} .quiz-section{background:#f8fafc; border:2px solid #e2e8f0; padding:15px; border-radius:12px; margin-top:20px} .insight-box{background:#eff6ff; border-right:4px solid #3b82f6; padding:10px; border-radius:8px; margin:15px 0}</style></head><body>${pagesHTML}</body></html>`;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-row-reverse overflow-hidden">
      <Sidebar 
        brand={brand} setBrand={setBrand} onGenerate={() => setShowGenerateModal(true)}
        loading={loading} onExport={() => window.print()}
        onAddPage={() => setPages([...pages, { id: Date.now().toString(), title: 'جديدة', content: '<p>اكتب هنا...</p>', footer: brand.name }])}
        onClear={() => confirm("مسح المذكرة؟") && setPages([])}
        onShowHTML={() => setShowHTMLModal(true)}
      />

      <main className="flex-1 mr-80 p-6 overflow-y-auto h-screen bg-slate-200">
        <div className="space-y-16 pb-96 w-full max-w-[210mm] mx-auto">
          {pages.map((page, index) => (
            <div key={page.id} className="relative group">
              <PageEditor 
                page={page} brand={brand} pageNumber={index + 1} 
                onUpdate={(up) => setPages(pages.map(p => p.id === page.id ? up : p))} 
                onSplit={(ex) => handlePageSplit(index, ex)}
              />
              <button onClick={() => setPages(pages.filter(p => p.id !== page.id))} className="no-print absolute -left-12 top-0 bg-white text-red-500 p-3 rounded-full shadow opacity-0 group-hover:opacity-100 transition-all cursor-pointer border-none">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </main>

      {showGenerateModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl border border-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <Sparkles className="text-indigo-600" size={28} /> تأليف مذكرة تفاعلية
              </h2>
              <button onClick={() => setShowGenerateModal(false)} className="text-slate-300 hover:text-slate-900 border-none bg-transparent cursor-pointer"><X size={28} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none font-bold" placeholder="الموضوع" />
                <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none font-bold" placeholder="الصف" />
              </div>
              <textarea value={rawContent} onChange={(e) => setRawContent(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none h-40 font-medium resize-none" placeholder="الصق المادة العلمية هنا... سيتولى الذكاء الاصطناعي تحويلها لتحفة فنية تعليمية." />
              <button onClick={handleGenerate} disabled={loading} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-50 border-none cursor-pointer">
                {loading ? <Loader2 className="animate-spin" /> : <Layers size={20} />}
                {loading ? "جاري التصميم..." : "بدء التوليد الإبداعي"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showHTMLModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/90 p-10">
          <div className="bg-white w-full max-w-4xl h-[80vh] rounded-[2rem] flex flex-col overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center"><h2 className="text-xl font-black">كود HTML</h2><button onClick={() => setShowHTMLModal(false)} className="border-none bg-transparent cursor-pointer"><X size={24} /></button></div>
            <textarea readOnly className="flex-1 p-6 bg-slate-950 text-indigo-300 font-mono text-xs outline-none resize-none border-none" value={generateFullHTML()} />
            <div className="p-4 bg-slate-50 flex justify-end"><button onClick={() => {navigator.clipboard.writeText(generateFullHTML()); setCopied(true); setTimeout(()=>setCopied(false), 2000)}} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black border-none cursor-pointer">{copied ? "تم النسخ" : "نسخ الكود"}</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;