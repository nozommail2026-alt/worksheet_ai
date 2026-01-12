
import React, { useRef, useState, useEffect } from 'react';
import { NotePage, BrandConfig } from '../types';
import { THEMES } from '../constants';
import { 
  Bold, Italic, List, Info, AlertCircle, HelpCircle, 
  Lightbulb, Undo2, Redo2, Layout, Trash2, Award, Bookmark, Sparkles
} from 'lucide-react';

interface PageEditorProps {
  page: NotePage;
  brand: BrandConfig;
  onUpdate: (updatedPage: NotePage) => void;
  pageNumber: number;
}

const PageEditor: React.FC<PageEditorProps> = ({ page, brand, onUpdate, pageNumber }) => {
  const theme = THEMES[brand.theme];
  const contentRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState<string[]>([page.content]);
  const [historyIndex, setHistoryIndex] = useState(0);

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== page.content) {
      contentRef.current.innerHTML = page.content;
    }
  }, [page.id]);

  const saveToHistory = (newContent: string) => {
    if (newContent === history[historyIndex]) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    onUpdate({ ...page, content: newContent });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      if (contentRef.current) contentRef.current.innerHTML = prev;
      onUpdate({ ...page, content: prev });
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      if (contentRef.current) contentRef.current.innerHTML = next;
      onUpdate({ ...page, content: next });
    }
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (contentRef.current) saveToHistory(contentRef.current.innerHTML);
  };

  const handleContentChange = () => {
    if (contentRef.current) {
      saveToHistory(contentRef.current.innerHTML);
    }
  };

  const insertComponent = (type: 'info' | 'warning' | 'definition' | 'example') => {
    let html = '';
    const colors = {
      info: { bg: '#f0f9ff', border: '#0ea5e9', text: '#0369a1', icon: '💡' },
      warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e', icon: '⚠️' },
      definition: { bg: '#f0fdf4', border: '#22c55e', text: '#166534', icon: '📖' },
      example: { bg: '#fdf2f8', border: '#db2777', text: '#9d174d', icon: '✏️' }
    };
    
    const config = colors[type];
    const titles = { info: 'ملاحظة هامة', warning: 'انتبه!', definition: 'المصطلح العلمي', example: 'تطبيق عملي' };

    html = `
      <div class="my-6 p-6 rounded-[1.5rem] border-r-[10px] shadow-sm transition-all hover:shadow-md" style="background-color: ${config.bg}; border-color: ${config.border};">
        <div class="flex items-center gap-3 mb-3">
          <span class="text-2xl">${config.icon}</span>
          <strong class="text-lg" style="color: ${config.text}">${titles[type]}</strong>
        </div>
        <div class="text-base leading-relaxed" style="color: ${config.text}; opacity: 0.9;">اكتب هنا الشرح المفصل لهذا المكون التعليمي...</div>
      </div>
      <p><br></p>
    `;

    if (contentRef.current) {
      contentRef.current.focus();
      document.execCommand('insertHTML', false, html);
      saveToHistory(contentRef.current.innerHTML);
    }
  };

  return (
    <div 
      className="bg-white shadow-[0_30px_100px_-20px_rgba(0,0,0,0.15)] mx-auto my-16 relative overflow-hidden transition-all duration-700 page-container"
      style={{ width: '210mm', minHeight: '297mm', padding: '0' }}
    >
      <div className="absolute top-0 right-0 w-2 h-full opacity-10" style={{ backgroundColor: theme.primary }} />

      <div className="no-print absolute top-1/2 -right-20 -translate-y-1/2 flex flex-col gap-3 p-3 bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-2xl border border-gray-100 opacity-0 group-hover:opacity-100 transition-all z-50">
         <button onClick={handleUndo} disabled={historyIndex === 0} className={`p-4 rounded-2xl transition-all shadow-sm ${historyIndex === 0 ? 'text-gray-200' : 'text-gray-600 hover:bg-gray-50 active:scale-90'}`}><Undo2 size={24} /></button>
         <button onClick={handleRedo} disabled={historyIndex === history.length - 1} className={`p-4 rounded-2xl transition-all shadow-sm ${historyIndex === history.length - 1 ? 'text-gray-200' : 'text-gray-600 hover:bg-gray-50 active:scale-90'}`}><Redo2 size={24} /></button>
      </div>

      <div className="h-12 w-full relative overflow-hidden flex items-center px-10" style={{ backgroundColor: theme.primary }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff, #fff 1px, transparent 1px, transparent 10px)', backgroundSize: '15px 15px' }} />
      </div>

      <div className="p-[15mm] relative">
        <div className="flex justify-between items-start mb-12 border-b-4 pb-8" style={{ borderColor: theme.primary + '11' }}>
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed shadow-inner group/logo overflow-hidden" style={{ borderColor: theme.accent }}>
               {brand.logoUrl ? (
                 <img src={brand.logoUrl} alt="Logo" className="w-full h-full object-contain p-3" />
               ) : (
                 <Award className="w-10 h-10 text-gray-200" />
               )}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight leading-tight" style={{ color: theme.primary }}>{brand.name}</h1>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black text-white shadow-lg" style={{ backgroundColor: theme.secondary }}>
                  <Bookmark size={12} />
                  <span>{page.title}</span>
                </div>
                <div className="h-4 w-px bg-gray-200" />
                <span className="text-xs font-bold text-gray-400">العام الدراسي 2024 - 2025</span>
              </div>
            </div>
          </div>
          <div className="text-left">
             <div className="text-6xl font-black opacity-5 select-none leading-none -mt-4">{String(pageNumber).padStart(2, '0')}</div>
          </div>
        </div>

        <div className="no-print sticky top-4 z-40 mb-10 flex flex-wrap items-center justify-center gap-2 p-3 bg-white/95 backdrop-blur shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-[2rem] border border-indigo-50 border-b-4 border-b-indigo-100">
          <div className="flex items-center bg-gray-50 rounded-2xl p-1 gap-1">
            <button onClick={() => execCommand('bold')} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all" title="عريض"><Bold size={20} /></button>
            <button onClick={() => execCommand('italic')} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all" title="مائل"><Italic size={20} /></button>
            <button onClick={() => execCommand('insertUnorderedList')} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all" title="قائمة"><List size={20} /></button>
          </div>
          <div className="h-8 w-px bg-gray-200 mx-2" />
          <div className="flex items-center gap-2">
            <button onClick={() => insertComponent('definition')} className="px-4 py-2.5 bg-green-50 text-green-700 rounded-xl flex items-center gap-2 text-sm font-black hover:bg-green-100 transition-all border border-green-200/50"><Layout size={18} /> تعريف</button>
            <button onClick={() => insertComponent('info')} className="px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl flex items-center gap-2 text-sm font-black hover:bg-blue-100 transition-all border border-blue-200/50"><Lightbulb size={18} /> ملاحظة</button>
            <button onClick={() => insertComponent('example')} className="px-4 py-2.5 bg-pink-50 text-pink-700 rounded-xl flex items-center gap-2 text-sm font-black hover:bg-pink-100 transition-all border border-pink-200/50"><HelpCircle size={18} /> تطبيق</button>
            <button onClick={() => insertComponent('warning')} className="px-4 py-2.5 bg-amber-50 text-amber-700 rounded-xl flex items-center gap-2 text-sm font-black hover:bg-amber-100 transition-all border border-amber-200/50"><AlertCircle size={18} /> تحذير</button>
          </div>
        </div>

        <div className="flex flex-row-reverse gap-10 items-start">
          <div className="flex-1 text-right">
            <div
              ref={contentRef}
              contentEditable
              suppressContentEditableWarning
              onBlur={handleContentChange}
              className="editor-content prose prose-xl prose-indigo max-w-none text-gray-800 leading-[1.9] font-medium focus:outline-none min-h-[150mm]"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>

          {page.imageUrl && (
            <div className="w-[30%] shrink-0 space-y-6 animate-in slide-in-from-left-10 duration-700">
              <div className="relative group">
                <div className="absolute -inset-3 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 blur-2xl opacity-50 group-hover:opacity-100 transition-all rounded-[3rem]" />
                <div className="relative z-10 p-2 bg-white rounded-[2.5rem] shadow-2xl border-2 border-gray-50 transform group-hover:rotate-1 transition-transform duration-500">
                  <img src={page.imageUrl} alt="Visual" className="w-full h-auto object-cover aspect-[3/4] rounded-[2rem]" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-24 pt-10 border-t-2 flex justify-between items-end" style={{ borderColor: theme.primary + '11' }}>
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-black shadow-xl" style={{ backgroundColor: theme.primary }}>
               <span className="text-xs opacity-50 -mb-1">Page</span>
               <span className="text-2xl">{pageNumber}</span>
             </div>
             <div>
               <p className="text-sm font-black" style={{ color: theme.secondary }}>{brand.name}</p>
               <p className="text-[10px] text-gray-400 font-bold">كل الحقوق محفوظة &copy; {new Date().getFullYear()}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageEditor;
