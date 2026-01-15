
import React from 'react';
import { BrandConfig, ThemeType } from '../types';
import { THEMES, ARABIC_FONTS } from '../constants';
import { Palette, Sparkles, Type, Download, Trash2, PlusCircle, Settings, Award, Image as ImageIcon, Loader2, Code } from 'lucide-react';

interface SidebarProps {
  brand: BrandConfig;
  setBrand: (b: BrandConfig) => void;
  onGenerate: () => void;
  loading: boolean;
  onExport: () => void;
  onAddPage: () => void;
  onClear: () => void;
  onShowHTML: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  brand, setBrand, onGenerate, loading, onExport, onAddPage, onClear, onShowHTML
}) => {
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBrand({ ...brand, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-80 h-screen bg-white border-l shadow-2xl overflow-y-auto no-print flex flex-col fixed right-0 top-0 z-[100]">
      <div className="p-8 border-b text-center">
        <h1 className="text-4xl font-black text-indigo-600">DafterAI</h1>
        <p className="text-gray-400 text-xs mt-2 font-bold tracking-widest">التأليف التعليمي الذكي</p>
      </div>

      <div className="p-6 space-y-8 flex-1">
        <section className="space-y-4">
          <label className="text-xs font-black text-gray-400 uppercase flex items-center gap-2"><Type size={14}/> الخط المفضل</label>
          <select 
            value={brand.fontFamily}
            onChange={(e) => setBrand({...brand, fontFamily: e.target.value})}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 focus:border-indigo-500 rounded-xl outline-none font-bold text-gray-700"
          >
            {ARABIC_FONTS.map(font => (
              <option key={font.id} value={font.id}>{font.name}</option>
            ))}
          </select>
        </section>

        <section className="space-y-4">
          <label className="text-xs font-black text-gray-400 uppercase flex items-center gap-2"><Award size={14}/> هوية المحاضر</label>
          <input 
            type="text" 
            value={brand.name}
            onChange={(e) => setBrand({...brand, name: e.target.value})}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 focus:border-indigo-500 rounded-xl outline-none font-bold"
            placeholder="أدخل الاسم"
          />
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
               {brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <ImageIcon className="text-gray-300" />}
             </div>
             <label className="cursor-pointer bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-indigo-100 transition-all flex-1 text-center">
               تغيير الشعار
               <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
             </label>
          </div>
        </section>

        <section className="space-y-2">
           <button onClick={onGenerate} disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
             {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
             توليد مذكرة كاملة
           </button>
           <button onClick={onShowHTML} className="w-full bg-gray-800 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3">
             <Code size={18} /> استخراج HTML
           </button>
        </section>

        <section className="pt-6 border-t space-y-2">
           <button onClick={onAddPage} className="w-full flex items-center justify-center gap-2 text-sm font-bold text-gray-600 hover:text-indigo-600 bg-gray-50 p-3 rounded-xl">
             <PlusCircle size={16} /> صفحة فارغة
           </button>
           <button onClick={onClear} className="w-full flex items-center justify-center gap-2 text-sm font-bold text-red-500 hover:bg-red-50 p-3 rounded-xl">
             <Trash2 size={16} /> مسح الكل
           </button>
        </section>
      </div>

      <div className="p-6 bg-gray-50 mt-auto">
        <button onClick={onExport} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg flex items-center justify-center gap-3">
          <Download size={20} /> حفظ / طباعة (PDF)
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
