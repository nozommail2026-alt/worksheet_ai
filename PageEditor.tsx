
import React, { useRef, useState, useEffect } from 'react';
import { NotePage, BrandConfig } from './types';
import { THEMES } from './constants';
import { Bold, Award, Underline, Phone, Scissors } from 'lucide-react';

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
      // الارتفاع الافتراضي لصفحة A4 بالبكسل هو حوالي 1122px
      // نترك مساحة للهيدر والفوتر والهوامش
      const baseThreshold = page.isCover ? 1000 : 920;
      const spacingAdjustment = (brand.headerTopGap + brand.headerContentGap) * 3.78;
      const threshold = baseThreshold - spacingAdjustment;
      
      const isOver = contentRef.current.scrollHeight > threshold; 
      setIsOverflowing(isOver);
    }
  };

  const handleManualSplit = () => {
    if (!contentRef.current || page.isCover) return;
    
    const container = contentRef.current;
    // Fix: Explicitly cast children to HTMLElement[] to avoid 'unknown' type errors
    const children = Array.from(container.children) as HTMLElement[];
    
    if (children.length === 0) {
      // إذا كان المحتوى نصاً فقط بدون وسوم HTML
      const fullText = container.innerHTML;
      const half = Math.floor(fullText.length / 2);
      const splitPoint = fullText.lastIndexOf(' ', half);
      const kept = fullText.substring(0, splitPoint);
      const remaining = fullText.substring(splitPoint);
      
      onUpdate({ ...page, content: kept });
      onSplit(remaining);
      return;
    }

    let splitIndex = -1;
    let currentTotalHeight = 0;
    const spacingAdjustment = (brand.headerTopGap + brand.headerContentGap) * 3.78;
    const threshold = 900 - spacingAdjustment;

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const style = window.getComputedStyle(child);
      const height = child.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
      
      currentTotalHeight += height;

      if (currentTotalHeight > threshold) {
        splitIndex = i;
        break;
      }
    }

    // إذا كان العنصر الأول وحده أطول من الصفحة
    if (splitIndex === 0) splitIndex = 1;
    
    // إذا لم نجد نقطة تجاوز ولكن هناك تجاوز في الـ scrollHeight
    if (splitIndex === -1 && children.length > 1) {
      splitIndex = Math.floor(children.length * 0.7);
    }

    if (splitIndex > 0 && splitIndex < children.length) {
      // Fix: Access outerHTML on HTMLElement elements
      const kept = children.slice(0, splitIndex).map(el => el.outerHTML).join('');
      const remaining = children.slice(splitIndex).map(el => el.outerHTML).join('');
      
      // تحديث الصفحة الحالية بالمحتوى الذي تم إبقاؤه
      onUpdate({ ...page, content: kept });
      // إرسال المحتوى المتبقي لإنشاء صفحة جديدة
      onSplit(remaining);
      setIsOverflowing(false);
    } else if (children.length === 1) {
      // حالة خاصة: عنصر واحد ضخم جداً، نقسمه كنص (تجريبي)
      const hugeEl = children[0];
      // Fix: hugeEl is now HTMLElement, so innerHTML is accessible
      const html = hugeEl.innerHTML;
      const half = Math.floor(html.length / 2);
      const splitAt = html.indexOf(' ', half);
      if (splitAt !== -1) {
        // Fix: hugeEl is now HTMLElement, so tagName is accessible
        const tag = hugeEl.tagName.toLowerCase();
        const kept = `<${tag}>${html.substring(0, splitAt)}</${tag}>`;
        const remaining = `<${tag}>${html.substring(splitAt)}</${tag}>`;
        onUpdate({ ...page, content: kept });
        onSplit(remaining);
      }
    }
  };

  const execCommand = (command: string) => {
    document.execCommand(command, false);
    if (contentRef.current) {
      onUpdate({ ...page, content: contentRef.current.innerHTML });
      checkOverflow();
    }
  };

  const Watermark = () => brand.watermarkUrl ? (
    <img 
      src={brand.watermarkUrl} 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] opacity-[0.05] pointer-events-none rotate-[-15deg] z-0" 
      alt="" 
    />
  ) : null;

  if (page.isCover) {
    return (
      <div 
        className="bg-white shadow-2xl mx-auto relative overflow-hidden page-container print:shadow-none print:my-0 flex flex-col items-center text-center"
        style={{ width: '210mm', height: '297mm', padding: '0', fontFamily: brand.fontFamily }}
      >
        <Watermark />
        <div className="w-full pt-[20mm] pb-[10mm] flex flex-col items-center relative z-10">
          <p className="text-xl font-black text-indigo-600 tracking-widest uppercase mb-2">{brand.name}</p>
          <div className="h-1 w-24 bg-indigo-600 rounded-full"></div>
        </div>

        <div className="flex-1 w-full px-[20mm] flex flex-col items-center justify-center relative z-10">
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

        <div className="w-full py-[15mm] border-t border-slate-100 mt-auto bg-slate-50/50 relative z-10">
           <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{brand.name} • ٢٠٢٥</p>
           {brand.phoneNumber && (
             <div className="flex items-center justify-center gap-2 mt-2 text-indigo-600 font-bold">
               <Phone size={14} />
               <span className="direction-ltr">{brand.phoneNumber}</span>
             </div>
           )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white shadow-2xl mx-auto relative overflow-hidden page-container print:shadow-none print:my-0 flex flex-col group ${isOverflowing ? 'ring-2 ring-red-500' : ''}`}
      style={{ width: '210mm', height: '297mm', padding: '0', fontFamily: brand.fontFamily }}
    >
      <Watermark />
      <div 
        className="flex items-center justify-between px-[12mm] py-2 border-b border-slate-50 bg-white/80 backdrop-blur-sm z-20 shrink-0"
        style={{ marginTop: `${brand.headerTopGap}mm` }}
      >
        <div className="flex items-center gap-2">
          <h1 className="text-[12px] font-black text-slate-800" style={{ fontFamily: 'Cairo' }}>{brand.name}</h1>
        </div>
        <div className="text-[10px] font-bold text-slate-400">الصفحة {pageNumber}</div>
      </div>

      <div 
        className="px-[12mm] flex-1 flex flex-col relative overflow-hidden z-10"
        style={{ paddingTop: `${brand.headerContentGap}mm`, paddingBottom: '10mm' }}
      >
        <div className="no-print mb-2 flex items-center gap-2 p-1 bg-white border border-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity sticky top-0 z-50">
          <button onClick={() => execCommand('bold')} className="p-1 hover:bg-slate-50 rounded"><Bold size={11} /></button>
          <button onClick={() => execCommand('underline')} className="p-1 hover:bg-slate-50 rounded"><Underline size={11} /></button>
        </div>

        <div className="relative flex-1">
          <div className="editor-content outline-none min-h-full relative z-10">
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
            <button 
              onClick={(e) => {
                e.preventDefault();
                handleManualSplit();
              }} 
              className="bg-white text-red-600 px-3 py-1 rounded font-black text-[10px] cursor-pointer hover:bg-slate-100 transition-colors flex items-center gap-1 border-none shadow-md active:scale-95"
            >
                <Scissors size={10} /> ترحيل
            </button>
          </div>
        )}

        <div className="mt-auto pt-1 border-t border-slate-100 flex justify-between items-center opacity-40 relative z-10">
           <div className="text-[8px] font-bold text-slate-400 flex items-center gap-4">
             {brand.phoneNumber && <span className="direction-ltr">📞 {brand.phoneNumber}</span>}
           </div>
           <div className="text-[8px] font-black text-slate-500 uppercase">{brand.name} • ٢٠٢٥</div>
        </div>
      </div>
    </div>
  );
};

export default PageEditor;
