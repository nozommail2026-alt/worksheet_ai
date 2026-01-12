
import React from 'react';
import { BrandConfig, ThemeType } from '../types';
import { THEMES } from '../constants';
import { Palette, Sparkles, Type, Download, Trash2, PlusCircle, Settings, Award, Image as ImageIcon, Loader2 } from 'lucide-react';

interface SidebarProps {
  brand: BrandConfig;
  setBrand: (b: BrandConfig) => void;
  onGenerate: () => void;
  loading: boolean;
  onExport: () => void;
  onAddPage: () => void;
  onClear: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  brand, setBrand, onGenerate, loading, onExport, onAddPage, onClear 
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
    <div className="w-80 h-screen bg-white border-l shadow-[0_0_40px_rgba(0,0,0,0.05)] overflow-y-auto no-print flex flex-col fixed right-0 top-0 z-50">
      <div className="p-8 border-b bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-10 opacity-50" />
        <h1 className="text-3xl font-black flex items-center gap-2 text-indigo-600">
          DafterAI
        </h1>
        <p className="text-gray-400 text-xs mt-2 font-bold tracking-widest uppercase">مستقبلك التعليمي بذكاء</p>
      </div>

      <div className="p-8 space-y-10 flex-1">
        <section className="space-y-6">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Award className="w-4 h-4" /> هوية المذكرة
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase">اسم المحاضر / الجهة</label>
              <input 
                type="text" 
                value={brand.name}
                onChange={(e) => setBrand({...brand, name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-gray-700"
                placeholder="أدخل الاسم"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase">شعار المؤسسة</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                  {brand.logoUrl ? (
                    <img src={brand.logoUrl} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                  ) : (
                    <ImageIcon className="text-gray-300 w-6 h-6" />
                  )}
                </div>
                <label className="cursor-pointer bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-indigo-100 transition-all">
                  رفع شعار
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase">نمط التصميم (Theme)</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(THEMES) as ThemeType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setBrand({...brand, theme: t})}
                    className={`p-3 text-xs rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      brand.theme === t 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                      : 'border-gray-100 hover:border-gray-200 text-gray-500'
                    }`}
                  >
                    <div className="w-6 h-1 rounded-full" style={{ backgroundColor: THEMES[t].primary }} />
                    <span className="font-bold">{THEMES[t].name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <button
            onClick={onGenerate}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            توليد ذكي جديد
          </button>
        </section>

        <section className="space-y-4 pt-6 border-t border-gray-100">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Settings className="w-4 h-4" /> خيارات إضافية
          </h3>
          <div className="space-y-2">
            <button 
              onClick={onAddPage}
              className="w-full flex items-center justify-center gap-2 text-sm font-bold text-gray-600 hover:text-indigo-600 transition-all bg-gray-50 hover:bg-indigo-50 p-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-200"
            >
              <PlusCircle className="w-4 h-4" /> إضافة صفحة فارغة
            </button>
            <button 
              onClick={onClear}
              className="w-full flex items-center justify-center gap-2 text-sm font-bold text-red-400 hover:text-red-600 transition-all p-3"
            >
              <Trash2 className="w-4 h-4" /> مسح كل العمل
            </button>
          </div>
        </section>
      </div>

      <div className="p-8 bg-gray-50">
        <button
          onClick={onExport}
          className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black hover:bg-emerald-700 hover:shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-3"
        >
          <Download className="w-5 h-5" /> تصدير PDF للطباعة
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
