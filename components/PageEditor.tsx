
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
  }, [page.id, page.content, brand.headerTopGap, brand.headerContentGap]);

  const checkOverflow = () => {
    if (contentRef.current) {
      // Threshold depends on spacing settings too
      const baseThreshold = page.isCover ? 1200 : 1000;
      const spacingAdjustment = (brand.headerTopGap + brand.headerContentGap) * 3.78; // 1mm approx 3.78px
      const threshold = baseThreshold - spacingAdjustment;
      
      const isOver = contentRef.current.scrollHeight > threshold; 
      setIsOverflowing(isOver);
    }
  };

  const handleManualSplit = () => {
    if (!contentRef.current || page.isCover) return;
    
    const children = Array.from(contentRef.current.children);
    if (children.length === 0) return;

    let splitIndex = 0;
    let currentHeight = 0;
    const spacingAdjustment = (brand.headerTopGap + brand.headerContentGap) * 3.78;
    const threshold = 980 - spacingAdjustment;

    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      const style = window.getComputedStyle(child);
      const marginTop = parseFloat(style.marginTop) || 0;
      const marginBottom = parseFloat(style.marginBottom) || 0;
      
      currentHeight += child.offsetHeight + marginTop + marginBottom;

      if (currentHeight > threshold) {
        splitIndex = i;
        break;
      }
    }

    if (splitIndex === 0 && children.length > 1) {
        splitIndex = 1;
    }

    if (splitIndex > 0 && splitIndex < children.length) {
      const kept = children.slice(0, splitIndex).map(el => (el as HTMLElement).outerHTML).join('');
      const remaining = children.slice(splitIndex).map(el => (el as HTMLElement).outerHTML).join('');
      
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

  if (page.isCover) {
    return (
      <div 
        className="bg-white shadow-2xl mx-auto relative overflow-hidden page-container print:shadow-none print:my-0 flex flex-col items-center text-center"
        style={{ width: '210mm', height: '297mm', padding: '0', fontFamily: brand.fontFamily }}
      >
        <div className="w-full pt-[20mm] pb-[10mm] flex flex-col items-center">
          <div className="w-24 h-24 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            {brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain p-2" /> : <Award className="text-white" size={48} />}
          </div>
          <p className="text-xl font-black text-indigo-600 tracking-widest uppercase mb-2">{brand.name}</p>
          <div className="h-1 w-24 bg-indigo-600 rounded-full"></div>
        </div>

        <div className="flex-1 w-full px-[20mm] flex flex-col items-center justify-center">
          {page.imageUrl && (
            <img 
              src={page.imageUrl} 
              className="w-[80%] max-h-[120mm] object-contain rounded-3xl shadow-2xl mb-12 border-4 border-white ring-1 ring-slate-100" 
              alt="Cover Art" 
            />
          )}
          <h1 className="text-6xl font-black text-slate-900 leading-tight mb-6" style={{ fontFamily: 'Cairo' }}>{page.title}</h1>
          <div 
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            onInput={() => onUpdate({ ...page, content: contentRef.current?.innerHTML || '' })}
            className="text-2xl text-slate-500 font-medium max-w-2xl outline-none"
          />
        </div>

        <div className="w-full py-[15mm] border-t border-slate-100 mt-auto bg-slate-50/50">
           <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{brand.name} • ٢٠٢٥ • مذكرات تعليمية ذكية</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white shadow-2xl mx-auto relative overflow-hidden page-container print:shadow-none print:my-0 flex flex-col group ${isOverflowing ? 'ring-2 ring-red-500' : ''}`}
      style={{ width: '210mm', height: '297mm', padding: '0', fontFamily: brand.fontFamily }}
    >
      <div 
        className="flex items-center justify-between px-[12mm] py-2 border-b border-slate-50 bg-white z-20 shrink-0"
        style={{ marginTop: `${brand.headerTopGap}mm` }}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-indigo-600 rounded-sm flex items-center justify-center shrink-0">
            {brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <Award className="text-white" size={12} />}
          </div>
          <h1 className="text-[10px] font-black text-slate-800" style={{ fontFamily: 'Cairo' }}>{brand.name}</h1>
        </div>
        <div className="text-[9px] font-bold text-slate-400">الصفحة {pageNumber}</div>
      </div>

      <div 
        className="px-[12mm] flex-1 flex flex-col relative notebook-bg overflow-hidden z-10"
        style={{ paddingTop: `${brand.headerContentGap}mm`, paddingBottom: '10mm' }}
      >
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
            <button onClick={handleManualSplit} className="bg-white text-red-600 px-2 py-0.5 rounded font-black text-[9px] cursor-pointer hover:bg-slate-100 transition-colors">ترحيل</button>
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
