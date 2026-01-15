
import { ThemeType } from './types';

export const THEMES: Record<ThemeType, { 
  name: string, 
  primary: string, 
  secondary: string, 
  bg: string,
  accent: string 
}> = {
  professional: {
    name: 'الاحترافي',
    primary: '#1e3a8a',
    secondary: '#1d4ed8',
    bg: '#ffffff',
    accent: '#fbbf24'
  },
  creative: {
    name: 'الإبداعي',
    primary: '#7c3aed',
    secondary: '#db2777',
    bg: '#faf5ff',
    accent: '#22d3ee'
  },
  academic: {
    name: 'الأكاديمي',
    primary: '#065f46',
    secondary: '#047857',
    bg: '#f0fdf4',
    accent: '#84cc16'
  },
  modern: {
    name: 'العصري',
    primary: '#111827',
    secondary: '#4b5563',
    bg: '#f9fafb',
    accent: '#f97316'
  }
};

export const ARABIC_FONTS = [
  { id: 'Tajawal', name: 'تجول (عصري)' },
  { id: 'Cairo', name: 'كايرو (كلاسيكي)' },
  { id: 'Amiri', name: 'الأميري (خط الرقعة)' },
  { id: 'Noto Sans Arabic', name: 'نوتو (نظيف)' },
  { id: 'Vazirmatn', name: 'وزير (تقني)' },
  { id: 'Lalezar', name: 'لاليزار (عريض)' },
  { id: 'Scheherazade New', name: 'شهرزاد (تراثي)' }
];
