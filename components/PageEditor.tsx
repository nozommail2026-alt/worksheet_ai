import React, { useRef, useState, useEffect } from 'react';
import { NotePage, BrandConfig } from '../types';
import { THEMES } from '../constants';
import { 
  Bold, Italic, List, Quote, Info, AlertCircle, HelpCircle, 
  Lightbulb, Undo2, Redo2, Type, AlignRight, Layout, Trash2, Award
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

  // Sync internal ref with page.content when external changes occur
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== page.content) {
      contentRef.current.innerHTML = page.content;
    }
  }, [page.id]); // Only reset on page change, not content change

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

  // Fix: Added the missing handleContentChange function to capture editor content on blur
  const handleContentChange = () => {
    if (contentRef.current) {
      saveToHistory(contentRef.current.innerHTML);
    }
  };

  const insertComponent = (type: 'info' | 'warning' | 'definition' | 'example') => {
    let html = '';
    const colors = {
      info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', icon: '💡' },
      warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e', icon: '⚠️' },
      definition: { bg: '#f0fdf4', border: '#22c55e', text: '#166534', icon: '📖' },
      example: { bg: '#fdf2f8', border: '#db2777', text: '#9d174d', icon: '✏️' }
    };
    
    const config = colors[type];
    const titles = { info: 'ملاحظة هامة', warning: 'انتبه!', definition: 'تعريف المصطلح', example: 'مثال تطبيقي' };

    html = `
      <div class="my-6 p-5 rounded-2xl border-r-8 shadow-sm" style="background-color: ${config.bg}; border-color: ${config.border};">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xl">${config.icon}</span>
          <strong style="color: ${config.text}">${titles[type]}</strong>
        </div>
        <div style="color: ${config.text}; opacity: 0.9;">اكتب المحتوى هنا...</div>
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
      className="bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] mx-auto my-12 relative overflow-hidden transition-all duration-500 page-container"
      style={{ width: '210mm', minHeight: '297mm', padding: '0' }}
    >
      {/* Undo/Redo Floating Menu (Desktop Only) */}
      <div className="no-print absolute top-1/2 -right-16 -translate-y-1/2 flex flex-col gap-2 p-2 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 group-hover:opacity-100 transition-all">
         <button onClick={handleUndo} disabled={historyIndex === 0} className={`p-3 rounded-xl transition-all ${historyIndex === 0 ? 'text-gray-200' : 'text-gray-600 hover:bg-gray-100'}`}><Undo2 size={20} /></button>
         <button onClick={handleRedo} disabled={historyIndex === history.length - 1} className={`p-3 rounded-xl transition-all ${historyIndex === history.length - 1 ? 'text-gray-200' : 'text-gray-600 hover:bg-gray-100'}`}><Redo2 size={20} /></button>
      </div>

      {/* Top Header Design */}
      <div className="h-10 relative overflow-hidden" style={{ backgroundColor: theme.primary }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      </div>

      <div className="p-[15mm]">
        {/* Branding Area */}
        <div className="flex justify-between items-center mb-10 border-b-2 pb-6" style={{ borderColor: theme.primary + '11' }}>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed shadow-inner" style={{ borderColor: theme.accent }}>
               {brand.logoUrl ? <img src={brand.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" /> : <span className="text-[12px] font-black text-gray-300">BRAND</span>}
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight" style={{ color: theme.primary }}>{brand.name}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase text-white shadow-sm" style={{ backgroundColor: theme.secondary }}>المادة: {page.title}</span>
                <span className="text-[11px] font-bold text-gray-400">الفصل الدراسي الأول</span>
              </div>
            </div>
          </div>
          <div className="text-left font-black opacity-10 text-4xl">
            {String(pageNumber).padStart(2, '0')}
          </div>
        </div>

        {/* Pro Toolbar */}
        <div className="no-print sticky top-0 z-50 mb-6 flex flex-wrap items-center gap-1 p-2 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center border-l px-2 gap-1">
            <button onClick={() => execCommand('bold')} className="p-2 hover:bg-gray-100 rounded-lg" title="عريض"><Bold size={18} /></button>
            <button onClick={() => execCommand('italic')} className="p-2 hover:bg-gray-100 rounded-lg" title="مائل"><Italic size={18} /></button>
          </div>
          <div className="flex items-center border-l px-2 gap-1">
            <button onClick={() => insertComponent('definition')} className="p-2 hover:bg-green-50 text-green-600 rounded-lg flex items-center gap-1 text-xs font-bold" title="إدراج تعريف"><Layout size={16} /> تعريف</button>
            <button onClick={() => insertComponent('info')} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg flex items-center gap-1 text-xs font-bold" title="إدراج ملاحظة"><Lightbulb size={16} /> ملاحظة</button>
            <button onClick={() => insertComponent('example')} className="p-2 hover:bg-pink-50 text-pink-600 rounded-lg flex items-center gap-1 text-xs font-bold" title="إدراج مثال"><HelpCircle size={16} /> مثال</button>
            <button onClick={() => insertComponent('warning')} className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg flex items-center gap-1 text-xs font-bold" title="إدراج تنبيه"><AlertCircle size={16} /> تنبيه</button>
          </div>
        </div>

        {/* Page Content */}
        <div className="relative">
          {page.imageUrl && (
            <div className="mb-10 group relative">
              <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-500/10 to-blue-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-all rounded-[2rem]" />
              <img src={page.imageUrl} alt="Page Illustration" className="w-full h-auto object-cover max-h-[280px] rounded-[2rem] shadow-xl relative z-10 border-4 border-white" />
            </div>
          )}

          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleContentChange}
            className="editor-content prose prose-slate max-w-none text-right text-gray-800 leading-[1.8] text-xl min-h-[180mm] focus:outline-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>

        {/* Footer */}
        <div className="mt-20 flex justify-between items-center text-xs font-bold border-t pt-6" style={{ borderColor: theme.primary + '11' }}>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-black" style={{ backgroundColor: theme.primary }}>
               {pageNumber}
             </div>
             <div className="flex flex-col">
               <span style={{ color: theme.secondary }}>{brand.name}</span>
               <span className="text-[10px] text-gray-400">نظام المذكرات الذكية &copy; 2024</span>
             </div>
          </div>
          <div className="flex items-center gap-2 opacity-30">
             <Award size={14} />
             <span>DafterAI Professional Editor</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageEditor;