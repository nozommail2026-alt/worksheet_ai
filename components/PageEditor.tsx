
import React, { useRef, useState, useEffect } from 'react';
import { NotePage, BrandConfig } from '../types';
import { THEMES } from '../constants';
import { Bold, Award, Underline } from 'lucide-react';

interface PageEditorProps {
  page: NotePage;
  brand: BrandConfig;
  onUpdate: (updatedPage: NotePage) => void;
  onSplit: (excessHtml: string) => void;
  pageNumber: number;
}

const PageEditor: React.FC<PageEditorProps> = ({ page, brand, onUpdate, onSplit, pageNumber }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== page.content) {
      contentRef.current.innerHTML = page.content;
    }
    checkOverflow();
  }, [page.id, page.content]);

  const checkOverflow = () => {
    if (contentRef.current) {
      // Increased threshold to maximize page usage
      const isOver = contentRef.current.scrollHeight > 1060; 
      setIsOverflowing(isOver);
    }
  };

  const handleManualSplit = () => {
    if (!contentRef.current) return;
    const children = Array.from(contentRef.current.children);
    let splitIndex = children.length;
    let currentHeight = 0;
    
    for (let i = 0; i < children.length; i++) {
      currentHeight += (children[i] as HTMLElement).offsetHeight + 8;
      if (currentHeight > 1040) {
        splitIndex = i;
        break;
      }
    }

    if (splitIndex < children.length) {
      const remaining = children.slice(splitIndex).map(el => (el as HTMLElement).outerHTML).join('');
      const kept = children.slice(0, splitIndex).map(el => (el as HTMLElement).outerHTML).join('');
      
      contentRef.current.innerHTML = kept;
      onUpdate({ ...page, content: kept });
      onSplit(remaining);
      setIsOverflowing(false);
    }
  };

  const execCommand = (command: string) => {
    document.execCommand(command, false);
    if (contentRef.current) {
      onUpdate({ ...page, content: contentRef.current.innerHTML });
      checkOverflow();
    }
  };

  return (
    <div 
      className={`bg-white shadow-2xl mx-auto relative overflow-hidden page-container print:shadow-none print:my-0 flex flex-col group ${isOverflowing ? 'ring-2 ring-red-500' : ''}`}
      style={{ width: '210mm', height: '297mm', padding: '0', fontFamily: brand.fontFamily }}
    >
      <div className="flex items-center justify-between px-[12mm] py-2 border-b border-slate-50 bg-white z-20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-indigo-600 rounded-sm flex items-center justify-center shrink-0">
            {brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <Award className="text-white" size={12} />}
          </div>
          <h1 className="text-[10px] font-black text-slate-800" style={{ fontFamily: 'Cairo' }}>{brand.name}</h1>
        </div>
        <div className="text-[9px] font-bold text-slate-400">الصفحة {pageNumber}</div>
      </div>

      <div className="px-[12mm] py-[6mm] flex-1 flex flex-col relative notebook-bg overflow-hidden z-10">
        <div className="no-print mb-2 flex items-center gap-2 p-1 bg-white border border-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity sticky top-0 z-50">
          <button onClick={() => execCommand('bold')} className="p-1 hover:bg-slate-50 rounded"><Bold size={11} /></button>
          <button onClick={() => execCommand('underline')} className="p-1 hover:bg-slate-50 rounded"><Underline size={11} /></button>
        </div>

        <div className="relative flex-1">
          <div className="editor-content outline-none min-h-full">
            {page.imageUrl && (
              <img 
                src={page.imageUrl} 
                className="page-image-float" 
                alt="Diagram" 
                onLoad={checkOverflow}
              />
            )}
            <div
              ref={contentRef}
              contentEditable
              suppressContentEditableWarning
              onInput={() => {
                onUpdate({ ...page, content: contentRef.current?.innerHTML || '' });
                checkOverflow();
              }}
              className="outline-none"
            />
          </div>
        </div>

        {isOverflowing && (
          <div className="no-print absolute bottom-4 left-1/2 -translate-x-1/2 z-[100] bg-red-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-xl animate-pulse">
            <span className="text-[9px] font-black uppercase tracking-widest">محتوى زائد</span>
            <button onClick={handleManualSplit} className="bg-white text-red-600 px-2 py-0.5 rounded font-black text-[9px] cursor-pointer">ترحيل</button>
          </div>
        )}

        <div className="mt-auto pt-1 border-t border-slate-100 flex justify-between items-center opacity-40">
           <div className="text-[7px] font-bold text-slate-400">DafterAI Professional Learning System</div>
           <div className="text-[7px] font-black text-slate-500 uppercase">{brand.name} • ٢٠٢٥</div>
        </div>
      </div>
    </div>
  );
};

export default PageEditor;
