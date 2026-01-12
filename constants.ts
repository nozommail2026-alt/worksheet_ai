
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
    primary: '#1e3a8a', // blue-900
    secondary: '#1d4ed8', // blue-700
    bg: '#ffffff',
    accent: '#fbbf24' // amber-400
  },
  creative: {
    name: 'الإبداعي',
    primary: '#7c3aed', // violet-600
    secondary: '#db2777', // pink-600
    bg: '#faf5ff',
    accent: '#22d3ee' // cyan-400
  },
  academic: {
    name: 'الأكاديمي',
    primary: '#065f46', // emerald-900
    secondary: '#047857', // emerald-700
    bg: '#f0fdf4',
    accent: '#84cc16' // lime-500
  },
  modern: {
    name: 'العصري',
    primary: '#111827', // gray-900
    secondary: '#4b5563', // gray-600
    bg: '#f9fafb',
    accent: '#f97316' // orange-500
  }
};
