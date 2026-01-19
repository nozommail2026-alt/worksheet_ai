
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PageEditor from './components/PageEditor';
import { NotePage, BrandConfig } from './types';
import { generateEducationalContent, generatePageImage } from './services/gemini';
import { Loader2, Sparkles, Trash2, X, Layers, FileText, CheckCircle, Link as LinkIcon, ExternalLink, Copy, Printer, Edit3, Hash } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showHTMLModal, setShowHTMLModal] = useState(false);
  const [showURLModal, setShowURLModal] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [wordCopied, setWordCopied] = useState(false);
  const [markdownCopied, setMarkdownCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  
  const [brand, setBrand] = useState<BrandConfig>({
    name: 'الأستاذ المتميز',
    theme: 'professional',
    primaryColor: '#1e3a8a',
    secondaryColor: '#0f172a',
    phoneNumber: '0123456789',
    fontFamily: 'Tajawal',
    headerTopGap: 8,
    headerContentGap: 6,
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 10
  });

  const [pages, setPages] = useState<NotePage[]>([
    {
      id: 'welcome',
      title: 'مذكرتك التعليمية',
      isCover: true,
      content: `مرحباً بك في عصر المذكرات الذكية. نحن بانتظار إبداعك.`,
      footer: brand.name,
      imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1000'
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
          footer: brand.name,
          isCover: p.isCover
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

  const generateFullHTML = () => {
    const pagesHTML = pages.map((page, index) => {
      const watermark = brand.watermarkUrl ? `<img src="${brand.watermarkUrl}" class="watermark-bg" />` : '';
      const phoneDisplay = brand.phoneNumber ? `<span style="font-size: 10px;">📞 ${brand.phoneNumber}</span>` : '';
      
      if (page.isCover) {
        return `
          <div class="page-container cover-page" style="font-family: '${brand.fontFamily}', sans-serif; border: 12px double ${brand.primaryColor};">
            ${watermark}
            <div class="brand-header">${brand.name}</div>
            <div class="cover-content-center">
              ${page.imageUrl ? `<img src="${page.imageUrl}" class="cover-image" />` : ''}
              <h1 class="cover-title">${page.title}</h1>
              <div class="cover-subtitle editable-content" contenteditable="true">${page.content}</div>
            </div>
            <div class="page-footer-text">
               <div>${brand.name} • ٢٠٢٥</div>
               ${brand.phoneNumber ? `<div style="margin-top: 5px; font-size: 16px; color: ${brand.primaryColor};">للتواصل: ${brand.phoneNumber}</div>` : ''}
            </div>
          </div>
        `;
      }
      return `
        <div class="page-container content-page" style="font-family: '${brand.fontFamily}', sans-serif;">
           ${watermark}
           <div class="page-header" style="margin-top: var(--header-top-gap); margin-bottom: var(--header-content-gap);">
              <div class="header-brand" style="color: ${brand.primaryColor};">${brand.name}</div>
              <div class="page-number">صفحة ${index + 1}</div>
           </div>
           <div class="editor-content-wrapper">
             <div class="editor-content" contenteditable="true">
               ${page.imageUrl ? `<img src="${page.imageUrl}" class="page-image-float" />` : ''}
               ${page.content}
             </div>
           </div>
           <div class="page-footer" style="margin-bottom: var(--margin-bottom);">
              <div style="display: flex; gap: 20px;">
                ${phoneDisplay}
              </div>
              <div style="text-transform: uppercase;">${brand.name} • ٢٠٢٥</div>
              <button class="split-btn no-print" onclick="splitPage(this)">ترحيل الزائد</button>
           </div>
        </div>
      `;
    }).join('');

    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${topic || 'مذكرة تعليمية'}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&family=Tajawal:wght@300;400;500;700;800;900&display=swap" rel="stylesheet">
    <style>
        :root { 
            --primary: ${brand.primaryColor}; 
            --margin-left: ${brand.marginLeft}mm;
            --margin-right: ${brand.marginRight}mm;
            --header-top-gap: ${brand.headerTopGap}mm;
            --header-content-gap: ${brand.headerContentGap}mm;
            --margin-bottom: ${brand.marginBottom}mm;
        }
        * { box-sizing: border-box; }
        
        @page {
            size: A4;
            margin: 0;
        }

        body { 
            background: #f1f5f9; 
            margin: 0; 
            padding: 40px 0; 
            font-family: 'Tajawal', sans-serif; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            min-height: 100vh;
        }
        
        #pages-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 30px;
            width: 100%;
        }

        .page-container {
            width: 210mm;
            height: 297mm;
            background: white;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            padding-left: var(--margin-left);
            padding-right: var(--margin-right);
            padding-top: 5mm;
            page-break-after: always;
            flex-shrink: 0;
        }

        .watermark-bg {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-15deg);
            width: 70%;
            height: auto;
            opacity: 0.05;
            pointer-events: none;
            z-index: 0;
        }

        .cover-page { text-align: center; justify-content: space-between; z-index: 1; padding: 15mm; }
        .brand-header { font-size: 28px; font-weight: 900; color: var(--primary); margin-top: 10mm; position: relative; z-index: 2; }
        .cover-content-center { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative; z-index: 2; }
        .cover-image { width: 80%; max-height: 100mm; object-fit: contain; border-radius: 30px; margin-bottom: 30px; box-shadow: 0 15px 40px rgba(0,0,0,0.08); border: 4px solid white; outline: 1px solid #eee; }
        .cover-title { font-size: 52px; font-weight: 900; color: #0f172a; margin: 0 0 15px 0; line-height: 1.1; font-family: 'Cairo', sans-serif; }
        .cover-subtitle { font-size: 20px; color: #64748b; font-weight: 500; max-width: 85%; line-height: 1.5; outline: none; }
        .page-footer-text { margin-bottom: 10mm; font-size: 14px; color: #94a3b8; font-weight: 700; letter-spacing: 0.1em; position: relative; z-index: 2; }

        .page-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; flex-shrink: 0; position: relative; z-index: 2; }
        .header-brand { font-size: 14px; font-weight: 900; }
        .page-number { font-size: 12px; font-weight: 800; color: #cbd5e1; }
        .page-footer { border-top: 1px solid #f1f5f9; padding-top: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; font-weight: 800; color: #94a3b8; flex-shrink: 0; margin-top: auto; position: relative; z-index: 2; }
        
        .editor-content-wrapper { flex: 1; overflow: hidden; position: relative; z-index: 2; }
        .editor-content { font-size: 16px; line-height: 1.7; color: #0f172a; text-align: justify; outline: none; }
        .page-image-float { float: left; width: 32%; margin: 0 20px 15px 0; border-radius: 15px; border: 1px solid #eee; shape-outside: margin-box; }
        
        .editor-content h2 { font-family: 'Cairo', sans-serif; font-weight: 900; color: var(--primary); border-right: 6px solid var(--primary); padding: 5px 15px; margin: 20px 0 12px 0; background: rgba(248, 250, 252, 0.8); font-size: 20px; }
        .editor-content h3 { font-size: 18px; font-weight: 800; margin-top: 15px; color: #334155; }
        .insight-box { background: rgba(239, 246, 255, 0.8); border-right: 5px solid #3b82f6; padding: 15px; border-radius: 12px; margin: 15px 0; font-size: 15px; }
        .pro-tip { background: rgba(255, 251, 235, 0.8); border-right: 5px solid #f59e0b; padding: 12px; border-radius: 10px; font-weight: 800; font-size: 14px; margin: 12px 0; color: #92400e; }
        .quiz-section { background: rgba(248, 250, 252, 0.8); border: 2px solid #e2e8f0; padding: 15px; border-radius: 12px; margin-top: 20px; page-break-inside: avoid; }
        .case-study { background: rgba(253, 242, 248, 0.8); border-right: 5px solid #db2777; padding: 15px; border-radius: 12px; margin: 15px 0; font-size: 14px; }
        
        .split-btn { background: #ef4444; color: white; border: none; padding: 6px 16px; border-radius: 8px; font-size: 11px; font-weight: 900; cursor: pointer; opacity: 0; transition: all 0.2s; }
        .page-container:hover .split-btn { opacity: 1; }

        .controls-panel { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: white; padding: 8px 25px; border-radius: 50px; box-shadow: 0 15px 40px rgba(0,0,0,0.1); display: flex; gap: 12px; z-index: 99999; border: 1px solid #eee; }
        .control-btn { border: none; padding: 10px 18px; border-radius: 25px; font-weight: 900; cursor: pointer; transition: all 0.2s; font-family: 'Tajawal', sans-serif; display: flex; align-items: center; gap: 8px; font-size: 13px; }
        .btn-edit { background: #4f46e5; color: white; }
        .btn-print { background: #10b981; color: white; }
        .btn-settings { background: #64748b; color: white; }
        
        #settings-modal { 
            display: none; position: fixed; top: 80px; left: 50%; transform: translateX(-50%); 
            background: white; padding: 25px; border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); 
            z-index: 100000; width: 320px; border: 1px solid #f1f5f9;
        }
        .setting-group { margin-bottom: 15px; }
        .setting-label { display: flex; justify-content: space-between; font-size: 11px; font-weight: 900; color: #64748b; margin-bottom: 5px; }
        .setting-slider { width: 100%; accent-color: #4f46e5; }

        @media print {
            .no-print { display: none !important; }
            body { background: white !important; padding: 0 !important; }
            .page-container { 
                margin: 0 !important; 
                box-shadow: none !important; 
                border-bottom: none !important; 
                width: 210mm !important; 
                height: 297mm !important; 
                overflow: hidden !important;
            }
        }
    </style>
</head>
<body>
    <div class="controls-panel no-print">
        <button id="masterEditBtn" class="control-btn btn-edit" onclick="toggleFullEdit()">تفعيل التعديل</button>
        <button class="control-btn btn-settings" onclick="toggleSettings()">المساحات والهوامش</button>
        <button class="control-btn btn-print" onclick="window.print()">طباعة PDF</button>
    </div>

    <div id="settings-modal" class="no-print">
        <h3 style="margin-top: 0; font-size: 16px; font-weight: 900; color: #1e293b; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 15px;">ضبط المساحات</h3>
        <div class="setting-group">
            <div class="setting-label"><span>الهامش الأيمن</span><span id="label-right">${brand.marginRight}mm</span></div>
            <input type="range" class="setting-slider" min="0" max="50" value="${brand.marginRight}" oninput="updateVar('--margin-right', this.value, 'label-right')">
        </div>
        <div class="setting-group">
            <div class="setting-label"><span>الهامش الأيسر</span><span id="label-left">${brand.marginLeft}mm</span></div>
            <input type="range" class="setting-slider" min="0" max="50" value="${brand.marginLeft}" oninput="updateVar('--margin-left', this.value, 'label-left')">
        </div>
        <div class="setting-group">
            <div class="setting-label"><span>المسافة من الأعلى</span><span id="label-top">${brand.headerTopGap}mm</span></div>
            <input type="range" class="setting-slider" min="0" max="50" value="${brand.headerTopGap}" oninput="updateVar('--header-top-gap', this.value, 'label-top')">
        </div>
        <div class="setting-group">
            <div class="setting-label"><span>بين الهيدر والمحتوى</span><span id="label-content">${brand.headerContentGap}mm</span></div>
            <input type="range" class="setting-slider" min="0" max="50" value="${brand.headerContentGap}" oninput="updateVar('--header-content-gap', this.value, 'label-content')">
        </div>
        <div class="setting-group">
            <div class="setting-label"><span>الهامش السفلي</span><span id="label-bottom">${brand.marginBottom}mm</span></div>
            <input type="range" class="setting-slider" min="0" max="50" value="${brand.marginBottom}" oninput="updateVar('--margin-bottom', this.value, 'label-bottom')">
        </div>
        <button onclick="toggleSettings()" style="width: 100%; padding: 10px; border-radius: 12px; border: none; background: #f1f5f9; font-weight: 900; cursor: pointer;">إغلاق</button>
    </div>

    <div id="pages-wrapper">${pagesHTML}</div>

    <script>
        function toggleFullEdit() {
            const wrapper = document.getElementById('pages-wrapper');
            const isEditing = wrapper.contentEditable === 'true';
            wrapper.contentEditable = !isEditing;
            const btn = document.getElementById('masterEditBtn');
            btn.innerText = !isEditing ? 'إغلاق التعديل' : 'تفعيل التعديل';
            btn.style.background = !isEditing ? '#ef4444' : '#4f46e5';
        }

        function toggleSettings() {
            const modal = document.getElementById('settings-modal');
            modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
        }

        function updateVar(name, val, labelId) {
            document.documentElement.style.setProperty(name, val + 'mm');
            document.getElementById(labelId).innerText = val + 'mm';
        }

        function splitPage(btn) {
            const pageContainer = btn.closest('.page-container');
            const editorContent = pageContainer.querySelector('.editor-content');
            if (!editorContent) return;

            const children = Array.from(editorContent.children);
            if (children.length < 2) return;

            // حساب العتبة بناءً على المتغيرات الحالية
            const rootStyle = getComputedStyle(document.documentElement);
            const topGap = parseFloat(rootStyle.getPropertyValue('--header-top-gap')) || 0;
            const contentGap = parseFloat(rootStyle.getPropertyValue('--header-content-gap')) || 0;
            const bottomGap = parseFloat(rootStyle.getPropertyValue('--margin-bottom')) || 0;
            
            // المساحة المحجوزة بالميليمتر تقريباً: 5 (padding) + topGap + 10 (header) + contentGap + 10 (footer) + bottomGap
            const reservedMm = 5 + topGap + 10 + contentGap + 10 + bottomGap;
            const availableMm = 297 - reservedMm;
            const thresholdPx = availableMm * 3.78;

            let splitIndex = -1;
            let currentHeight = 0;

            for (let i = 0; i < children.length; i++) {
                const style = window.getComputedStyle(children[i]);
                const height = children[i].offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
                currentHeight += height;
                if (currentHeight > thresholdPx) {
                    splitIndex = i;
                    break;
                }
            }

            if (splitIndex === -1) return; // لا يوجد تجاوز
            if (splitIndex === 0) splitIndex = 1;

            const remainingNodes = children.slice(splitIndex);
            
            // إنشاء صفحة جديدة
            const newPage = pageContainer.cloneNode(true);
            const newEditor = newPage.querySelector('.editor-content');
            newEditor.innerHTML = '';
            
            // نقل العناصر المتجاوزة فقط (Atomic Move)
            remainingNodes.forEach(node => {
                newEditor.appendChild(node);
            });

            // إدراج الصفحة الجديدة بعد الحالية
            pageContainer.parentNode.insertBefore(newPage, pageContainer.nextSibling);
            
            // إعادة ترقيم الصفحات
            const allPages = document.querySelectorAll('.page-container');
            allPages.forEach((p, idx) => {
                const numEl = p.querySelector('.page-number');
                if (numEl) numEl.innerText = 'صفحة ' + (idx + 1);
            });
        }
    </script>
</body>
</html>`;
  };

  const handleGenerateUrl = () => {
    const html = generateFullHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setGeneratedUrl(url);
    setShowURLModal(true);
  };

  const handleCopyMarkdown = async () => {
    let md = `# ${brand.name}\n\n`;
    if (brand.phoneNumber) md += `**للتواصل: ${brand.phoneNumber}**\n\n`;
    pages.forEach((p, idx) => {
      md += `## ${p.isCover ? 'غلاف: ' : 'صفحة ' + (idx + 1) + ': '}${p.title}\n\n`;
      let cleanContent = p.content
        .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '### $1\n')
        .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '#### $1\n')
        .replace(/<div class="insight-box"[^>]*>(.*?)<\/div>/gi, '> **إضاءة:** $1\n')
        .replace(/<div class="pro-tip"[^>]*>(.*?)<\/div>/gi, '> **نصيحة:** $1\n')
        .replace(/<div class="case-study"[^>]*>(.*?)<\/div>/gi, '> **حالة دراسية:** $1\n')
        .replace(/<li[^>]*>(.*?)<\/li>/gi, '* $1\n')
        .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
        .replace(/<[^>]+>/g, '');
      md += cleanContent + '\n---\n\n';
    });
    try {
      await navigator.clipboard.writeText(md);
      setMarkdownCopied(true);
      setTimeout(() => setMarkdownCopied(false), 2000);
    } catch (e) {
      console.error("Markdown copy failed", e);
    }
  };

  const handlePageSplit = (pageIndex: number, currentContent: string, excessHtml: string) => {
    setPages(prevPages => {
      const newPages = [...prevPages];
      // تحديث محتوى الصفحة الأصلية لمنع التكرار
      newPages[pageIndex] = { ...newPages[pageIndex], content: currentContent };
      // إضافة الصفحة الجديدة
      newPages.splice(pageIndex + 1, 0, {
        id: Math.random().toString(36).substr(2, 9),
        title: 'تكملة المادة',
        content: excessHtml,
        footer: brand.name,
        isCover: false
      });
      return newPages;
    });
  };

  const handleCopyWord = async () => {
    const wordHtml = pages.map((page, index) => {
      if (page.isCover) {
        return `
          <div style="width: 100%; font-family: 'Segoe UI', Arial, sans-serif; direction: rtl; text-align: center; padding: 50px; border: 5px solid ${brand.primaryColor};">
            <h2 style="color: ${brand.primaryColor}; font-size: 24pt;">${brand.name}</h2>
            ${page.imageUrl ? `<p><img src="${page.imageUrl}" width="400" /></p>` : ''}
            <h1 style="font-size: 48pt;">${page.title}</h1>
            <p>${page.content}</p>
            ${brand.phoneNumber ? `<p style="font-size: 14pt;">للتواصل: ${brand.phoneNumber}</p>` : ''}
          </div>
        `;
      }
      return `
        <div style="width: 100%; font-family: 'Segoe UI', Arial, sans-serif; direction: rtl; margin-top: 40px;">
          <h1 style="color: ${brand.primaryColor}; border-bottom: 2px solid ${brand.primaryColor};">${page.title}</h1>
          <div style="font-size: 12pt; line-height: 1.6;">${page.content}</div>
          <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 5px; font-size: 9pt;">${brand.name} ${brand.phoneNumber ? ' - ' + brand.phoneNumber : ''}</div>
        </div>
      `;
    }).join('');

    const fullHtml = `<html><head><meta charset="UTF-8"></head><body>${wordHtml}</body></html>`;
    try {
      const type = "text/html";
      const blob = new Blob([fullHtml], { type });
      const data = [new ClipboardItem({ [type]: blob })];
      await navigator.clipboard.write(data);
      setWordCopied(true);
      setTimeout(() => setWordCopied(false), 2000);
    } catch (e) {
      navigator.clipboard.writeText(fullHtml);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-row-reverse overflow-hidden">
      <Sidebar 
        brand={brand} setBrand={setBrand} onGenerate={() => setShowGenerateModal(true)}
        loading={loading} onExport={handleGenerateUrl}
        onAddPage={() => setPages([...pages, { id: Date.now().toString(), title: 'جديدة', content: '<p>اكتب هنا...</p>', footer: brand.name, isCover: false }])}
        onClear={() => confirm("مسح المذكرة؟") && setPages([])}
        onShowHTML={() => setShowHTMLModal(true)}
        onCopyWord={handleCopyWord}
        wordCopied={wordCopied}
        onCopyMarkdown={handleCopyMarkdown}
        markdownCopied={markdownCopied}
      />

      <main className="flex-1 mr-80 p-6 overflow-y-auto h-screen bg-slate-200">
        <div className="space-y-12 pb-96 w-full max-w-[210mm] mx-auto flex flex-col items-center">
          {pages.map((page, index) => (
            <div key={page.id} className="relative group w-full flex justify-center">
              <PageEditor 
                page={page} brand={brand} pageNumber={index + 1} 
                onUpdate={(up) => setPages(pages.map(p => p.id === page.id ? up : p))} 
                onSplit={(curr, ex) => handlePageSplit(index, curr, ex)}
              />
              <button onClick={() => setPages(pages.filter(p => p.id !== page.id))} className="no-print absolute -left-12 top-0 bg-white text-red-500 p-3 rounded-full shadow opacity-0 group-hover:opacity-100 transition-all cursor-pointer border-none">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </main>

      {showURLModal && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-6">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-xl w-full shadow-2xl text-center">
            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <LinkIcon size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">رابط المذكرة جاهز!</h2>
            <p className="text-slate-500 mb-8 font-medium">تم توليد رابط تفاعلي بجودة A4 عالية. يمكنك استخدامه للطباعة أو العرض المباشر.</p>
            <div className="flex flex-col gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 flex items-center justify-between gap-4">
                <code className="text-indigo-600 font-bold truncate flex-1 text-left direction-ltr">{generatedUrl}</code>
                <button onClick={() => { navigator.clipboard.writeText(generatedUrl); setUrlCopied(true); setTimeout(() => setUrlCopied(false), 2000); }} className="bg-white text-indigo-600 p-3 rounded-xl border border-slate-200 hover:bg-indigo-50 transition-colors">
                  {urlCopied ? <CheckCircle size={20} /> : <Copy size={20} />}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <a href={generatedUrl} target="_blank" rel="noopener noreferrer" className="bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl hover:bg-indigo-700 transition-all no-underline">
                  <ExternalLink size={20} /> فتح ومعاينة
                </a>
                <button onClick={() => setShowURLModal(false)} className="bg-slate-100 text-slate-600 py-4 rounded-2xl font-black border-none cursor-pointer hover:bg-slate-200 transition-all">إغلاق</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showGenerateModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl border border-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3"><Sparkles className="text-indigo-600" size={28} /> تأليف مذكرة تفاعلية</h2>
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
              <h2 className="text-xl font-black">كود HTML التفاعلي (معدل للطباعة A4)</h2>
              <button onClick={() => setShowHTMLModal(false)} className="border-none bg-transparent cursor-pointer"><X size={24} /></button>
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
