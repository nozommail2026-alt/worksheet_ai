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
      content: `<h2>أهلاً بك في الإصدار الأقصى لـ DafterAI 🎓</h2>
      <p>لقد قمنا بتحديث النظام ليقوم بملء الفراغات تلقائياً وضمان مظهر احترافي ممتلئ للمذكرات.</p>
      <div class="insight-box">💡 <b>الذكاء الاصطناعي الآن:</b> سيقوم بإنتاج محتوى إضافي (شرح، تحليل، قصص) لضمان عدم وجود فراغات بيضاء في أسفل الورقة.</div>
      <div class="pro-tip">⭐ <b>نصيحة:</b> اضغط على "توليد مذكرة كاملة" وشاهد كيف يمتلئ المحتوى بالتفاصيل الدقيقة.</div>
      <div class="case-study"><b>📚 حالة دراسية:</b> عند استخدام المذكرات الكثيفة، تزداد نسبة تركيز الطالب بنسبة ٤٠٪ بفضل التفاعل المستمر مع الأسئلة المدمجة.</div>
      <div class="quiz-section">
        <h3 style="margin:0 0 10px 0; font-size:1rem; color:#1e3a8a;">تحدي سريع للفهم:</h3>
        <div class="mcq-item">١. كيف يضمن النظام ملء الفراغات؟ <br/> <span class="option">أ. بتكبير الخط</span> <span class="option">ب. بإنتاج محتوى إضافي ذكي</span> <span class="option">ج. بترك مساحات</span></div>
        <div class="tf-item"><span>النظام يدعم الطباعة المباشرة</span> <span>[صح / خطأ]</span></div>
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
      <div class="page-container" style="width: 210mm; height: 297mm; background: white; margin: 20px auto; padding: 15mm; direction: rtl; font-family: '${brand.fontFamily}', sans-serif; position: relative; border-bottom: 5px solid ${brand.primaryColor}; box-shadow: 0 0 20px rgba(0,0,0,0.1); overflow: hidden; page-break-after: always;">
         <div style="border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 13px; font-weight: 900; color: ${brand.primaryColor};">${brand.name}</div>
            <div style="font-size: 11px; font-weight: 900; color: #cbd5e1;">صفحة ${index + 1}</div>
         </div>
         <div class="editor-content" style="font-size: 16px; line-height: 1.7; color: #0f172a; text-align: justify;">
           ${page.imageUrl ? `<img src="${page.imageUrl}" style="float:left; width:30%; margin:0 15px 10px 0; border-radius:12px; border: 1px solid #eee; shape-outside: margin-box; box-shadow: 0 2px 5px rgba(0,0,0,0.05);" />` : ''}
           ${page.content}
         </div>
         <div style="position: absolute; bottom: 10mm; left: 15mm; right: 15mm; border-top: 1px solid #eee; padding-top: 8px; display: flex; justify-content: space-between; opacity: 0.6; font-size: 9px; font-weight: 800;">
            <div>DafterAI Professional Learning System</div>
            <div style="text-transform: uppercase;">${brand.name} • ٢٠٢٥</div>
         </div>
      </div>`).join('');

    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>${topic || 'DafterAI Note'}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&family=Tajawal:wght@300;400;500;700;800;900&display=swap" rel="stylesheet">
    <style>
        body { background: #f1f5f9; margin: 0; padding-bottom: 100px; font-family: 'Tajawal', sans-serif; }
        .editor-content h2 { font-weight: 900; color: #1e3a8a; border-right: 6px solid #1e3a8a; padding-right: 12px; margin-bottom: 15px; background: #f8fafc; font-family: 'Cairo', sans-serif; padding: 5px 10px; }
        .quiz-section { background: #f8fafc; border: 2px solid #e2e8f0; padding: 15px; border-radius: 12px; margin-top: 20px; page-break-inside: avoid; }
        .insight-box { background: #eff6ff; border-right: 5px solid #3b82f6; padding: 12px; border-radius: 8px; margin: 15px 0; }
        .pro-tip { background: #fffbeb; border-right: 5px solid #f59e0b; padding: 10px; border-radius: 8px; font-size: 14px; font-weight: bold; }
        .case-study { background: #fdf2f8; border-right: 5px solid #db2777; padding: 12px; border-radius: 8px; margin: 15px 0; font-size: 14px; }
        .option { display: inline-block; padding: 2px 8px; border: 1px solid #cbd5e1; border-radius: 5px; margin-left: 5px; font-size: 12px; background: white; }
        .mcq-item { margin-bottom: 12px; font-weight: 600; }
        .tf-item { display: flex; justify-content: space-between; border-bottom: 1px dashed #ddd; padding: 8px 0; }
        
        .toolbar { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: white; padding: 12px 30px; border-radius: 50px; box-shadow: 0 15px 35px rgba(0,0,0,0.3); display: flex; gap: 15px; z-index: 9999; border: 1px solid #eee; }
        .btn { border: none; padding: 12px 24px; border-radius: 25px; font-weight: 900; cursor: pointer; transition: all 0.2s; font-family: 'Tajawal', sans-serif; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .btn-print { background: #10b981; color: white; }
        .btn-edit { background: #1e3a8a; color: white; }
        .btn:hover { opacity: 0.9; transform: translateY(-3px); box-shadow: 0 6px 15px rgba(0,0,0,0.15); }

        @media print {
            .toolbar { display: none !important; }
            body { background: white !important; padding: 0 !important; }
            .page-container { margin: 0 !important; box-shadow: none !important; border-bottom: none !important; }
        }
    </style>
</head>
<body>
    <div class="toolbar no-print">
        <button id="editBtn" class="btn btn-edit" onclick="toggleEdit()">تفعيل التعديل</button>
        <button class="btn btn-print" onclick="window.print()">طباعة / حفظ PDF</button>
    </div>
    
    <div id="content-root">
        ${pagesHTML}
    </div>

    <script>
        function toggleEdit() {
            const root = document.getElementById('content-root');
            const isEditable = root.contentEditable === 'true';
            root.contentEditable = !isEditable;
            const btn = document.getElementById('editBtn');
            btn.innerText = !isEditable ? 'تعطيل التعديل (حفظ)' : 'تفعيل التعديل المباشر';
            btn.style.background = !isEditable ? '#ef4444' : '#1e3a8a';
            
            if(!isEditable) {
                root.style.outline = "3px solid #3b82f6";
                root.style.outlineOffset = "-3px";
            } else {
                root.style.outline = "none";
            }
        }
    </script>
</body>
</html>`;
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
              <textarea value={rawContent} onChange={(e) => setRawContent(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none h-40 font-medium resize-none" placeholder="الصق المادة العلمية هنا..." />
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
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-black">كود HTML التفاعلي</h2>
              <button onClick={() => setShowHTMLModal(false)} className="border-none bg-transparent cursor-pointer"><X size={24} /></button>
            </div>
            <div className="p-4 bg-blue-50 text-blue-700 text-xs font-bold border-b">
              💡 الكود المستخرج يتضمن "شريط تحكم عائم" يسمح لك بتعديل المذكرة مباشرة في المتصفح أو طباعتها بسهولة.
            </div>
            <textarea readOnly className="flex-1 p-6 bg-slate-950 text-indigo-300 font-mono text-xs outline-none resize-none border-none" value={generateFullHTML()} />
            <div className="p-4 bg-slate-50 flex justify-end">
              <button onClick={() => {navigator.clipboard.writeText(generateFullHTML()); setCopied(true); setTimeout(()=>setCopied(false), 2000)}} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black border-none cursor-pointer">
                {copied ? "تم النسخ بنجاح!" : "نسخ الكود الكامل"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;