
export type ThemeType = 'professional' | 'creative' | 'academic' | 'modern';

export interface BrandConfig {
  name: string;
  theme: ThemeType;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  fontFamily: string;
  headerTopGap: number; // in mm
  headerContentGap: number; // in mm
}

export interface NotePage {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  footer: string;
  isCover?: boolean;
}

export interface AIResponse {
  title: string;
  pages: Array<{
    title: string;
    content: string;
    imagePrompt: string;
    isCover?: boolean;
  }>;
}
