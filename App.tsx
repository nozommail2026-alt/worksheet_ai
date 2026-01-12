
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import PageEditor from './components/PageEditor';
import { NotePage, BrandConfig } from './types';
import { generateEducationalContent, generatePageImage } from './services/gemini';
import { Loader2, Plus, Sparkles, BookOpen, Trash2, Layers, PencilLine } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [pageCount, setPageCount] = useState(3);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  
  const [brand, setBrand] = useState<BrandConfig>({
    name: 'الأستاذ المتميز',
    theme: 'professional',
    primaryColor: '#1e3a8a',
    secondaryColor: '#1d4ed8',
    fontFamily: 'Cairo'
  });

  const [pages, setPages] = useState<NotePage[]>([
    {
      id: 'welcome',
      title: 'مذكرة تعليمية ذكية',
      content: '<h2>مرحباً بك في المحرر الاحترافي الجديد! 🚀</h2><p>تم تحديث المنصة لتشمل أدوات تعديل متطورة. يمكنك الآن:</p><ul><li>إدراج صناديق معلومات ملونة وجذابة من شريط الأدوات العائم.</li><li>استخدام نظام التراجع والإعادة (Undo/Redo) لضمان دقة العمل.</li><li>توليد صور ذكية لكل موضوع بشكل مستقل ومنظم.</li></ul><p>جرب الآن إضافة <strong>صندوق تعريف</strong> أو <strong>صندوق ملاحظات</strong> من الأعلى!</p>',
      footer: 'DafterAI Pro'
    }
  ]);

  const handleGenerate = async () => {
    if (!topic || !rawContent) {
      alert("يرجى إدخال الموضوع والمحتوى العلمي");
      return;
    }

    setLoading(true);
    try {
      const aiData = await generateEducationalContent(topic, grade, rawContent, pageCount);
      const processedPages: NotePage[] = [];
      
      for (const [index, p] of aiData.pages.entries()) {
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

  const updatePage = (id: string, updatedPage: NotePage) => {
    setPages(prev => prev.map(p => p.id === id ? updatedPage : p));
  };

  const addPage = () => {
    setPages([...pages, {
      id: Math.random().toString(36).substr(2, 9),
      title: 'صفحة جديدة',
      content: '<p>اكتب هنا...</p>',
      footer: brand.name
    }]);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-row-reverse font-['Cairo']">
      <Sidebar 
        brand={brand} 
        setBrand={setBrand} 
        onGenerate={() => setShowGenerateModal(true)}
        loading={loading}
        onExport={() => window.print()}
        onAddPage={addPage}
        onClear={() => setPages([])}
      />

      <main className="flex-1 mr-80 p-12 flex flex-col items-center overflow-y-auto h-screen no-scrollbar bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
        {pages.length === 0 ? (
          <div className="mt-40 text-center animate-in zoom-in duration-700">
            <div className="bg-white p-16 rounded-[3rem] shadow-2xl max-w-md border border-gray-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-full -z-10" />
               <PencilLine className="w-16 h-16 text-indigo-600 mx-auto mb-6" />
               <h2 className="text-3xl font-black text-gray-800">محرر المذكرات الذكي</h2>
               <p className="text-gray-500 mt-3 mb-10 leading-relaxed font-medium">ابدأ بتوليد المحتوى أو أضف صفحات يدوياً وابدأ في استخدام أدواتنا الاحترافية.</p>
               <button 
                 onClick={() => setShowGenerateModal(true)}
                 className="bg-indigo-600 text-white px-12 py-5 rounded-[1.5rem] font-bold hover:bg-indigo-700 transition-all flex items-center gap-3 mx-auto shadow-2xl shadow-indigo-200 hover:-translate-y-1 active:scale-95"
               >
                 <Sparkles className="w-6 h-6" /> توليد الآن
               </button>
            </div>
          </div>
        ) : (
          <div className="space-y-20 pb-40 w-full max-w-[210mm]">
            {pages.map((page, index) => (
              <div key={page.id} className="relative group animate-in slide-in-from-bottom-5 duration-500">
                <PageEditor 
                  page={page} 
                  brand={brand} 
                  pageNumber={index + 1}
                  onUpdate={(updated) => updatePage(page.id, updated)}
                />
                <button 
                  onClick={() => setPages(pages.filter(p => p.id !== page.id))}
                  className="no-print absolute top-10 -right-20 bg-white text-red-400 p-4 rounded-3xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-xl border border-gray-100"
                  title="حذف الصفحة"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            ))}

            <div className="no-print flex justify-center py-10">
              <button 
                onClick={addPage}
                className="group bg-white/50 backdrop-blur-sm border-2 border-dashed border-gray-300 text-gray-400 px-12 py-6 rounded-[2rem] flex flex-col items-center gap-2 hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-500 transition-all w-full"
              >
                <Plus className="w-8 h-8 group-hover:scale-125 transition-transform" />
                <span className="font-black">إضافة صفحة يدوية جديدة</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal is unchanged in logic but UI can be subtlely improved if needed */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-12 max-w-3xl w-full shadow-[0_0_100px_rgba(0,0,0,0.2)] relative animate-in zoom-in-95 duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-bl-full -z-10" />
            
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-4xl font-black text-gray-800 flex items-center gap-4">
                  <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  مولد المذكرات الذكي
                </h2>
                <p className="text-gray-400 mt-2 font-bold tracking-tight">نحول أفكارك لمحتوى تعليمي بصري فائق الجودة</p>
              </div>
              <button onClick={() => setShowGenerateModal(false)} className="bg-gray-100 hover:bg-red-50 hover:text-red-500 p-3 rounded-2xl transition-all font-black text-3xl leading-none">&times;</button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-black text-gray-400 mb-2 uppercase mr-1">المادة العلمية</label>
                <input 
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold"
                  placeholder="مثال: علم النفس الاجتماعي"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-black text-gray-400 mb-2 uppercase mr-1">الصف الدراسي</label>
                <input 
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold"
                  placeholder="مثال: الثالث الثانوي"
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-xs font-black text-gray-400 mb-2 uppercase mr-1 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" /> عدد الصفحات المطلوبة ({pageCount})
              </label>
              <div className="flex items-center gap-6 bg-gray-50 p-6 rounded-[1.5rem]">
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={pageCount} 
                  onChange={(e) => setPageCount(parseInt(e.target.value))}
                  className="flex-1 h-3 accent-indigo-600 rounded-lg appearance-none cursor-pointer bg-gray-200"
                />
                <div className="w-14 h-14 flex items-center justify-center bg-indigo-600 text-white rounded-2xl font-black text-xl shadow-lg shadow-indigo-100">
                  {pageCount}
                </div>
              </div>
            </div>

            <div className="mb-10">
              <label className="block text-xs font-black text-gray-400 mb-2 uppercase mr-1">المحتوى الخام (النص التعليمي)</label>
              <textarea 
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[1.5rem] outline-none transition-all h-56 resize-none leading-relaxed font-medium"
                placeholder="الصق نص الدرس أو الملاحظات هنا... سنتولى نحن الباقي."
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full py-6 rounded-[1.5rem] font-black text-2xl transition-all shadow-2xl flex items-center justify-center gap-4 ${
                loading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:scale-[1.01] active:scale-95 shadow-indigo-200'
              }`}
            >
              {loading ? <Loader2 className="animate-spin w-8 h-8" /> : <Sparkles className="w-8 h-8" />}
              {loading ? "جاري التصميم والتوليد..." : "تحويل المحتوى لمذكرة احترافية"}
            </button>
            
            {loading && (
              <div className="mt-6 flex flex-col items-center gap-2">
                 <p className="text-indigo-600 font-black animate-pulse">نحن الآن نخطط الصفحات، نصمم الأيقونات، وننظم المعلومات...</p>
                 <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full animate-[loading_20s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;
