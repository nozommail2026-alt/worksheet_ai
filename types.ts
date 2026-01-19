
export type ThemeType = 'professional' | 'creative' | 'academic' | 'modern';

export interface BrandConfig {
  name: string;
  theme: ThemeType;
  primaryColor: string;
  secondaryColor: string;
  watermarkUrl?: string; // Background brand image
  phoneNumber?: string; // Contact number
  fontFamily: string;
  headerTopGap: number; // in mm
  headerContentGap: number; // in mm (gap between header line and content start)
  marginLeft: number; // in mm
  marginRight: number; // in mm
  marginBottom: number; // in mm
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
