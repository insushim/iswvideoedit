import { TimelineData } from './timeline';
import { ProjectSettings } from './project';

export interface Template {
  id: string;
  userId?: string;
  name: string;
  nameEn?: string;
  description: string;
  themeId: string;
  timeline: TimelineData;
  settings: ProjectSettings;
  isPublic: boolean;
  isPremium: boolean;
  price?: number;
  thumbnailUrl?: string;
  previewUrl?: string;
  downloads: number;
  rating: number;
  ratingCount: number;
  tags: string[];
  category: TemplateCategory;
  createdAt: Date;
  updatedAt: Date;
}

export type TemplateCategory =
  | 'graduation'
  | 'wedding'
  | 'birthday'
  | 'travel'
  | 'business'
  | 'memorial'
  | 'celebration'
  | 'kids'
  | 'sports'
  | 'holiday';

export interface TemplateReview {
  id: string;
  templateId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface TemplatePurchase {
  id: string;
  templateId: string;
  userId: string;
  price: number;
  createdAt: Date;
}

export interface TemplateFilter {
  category?: TemplateCategory;
  themeId?: string;
  isPremium?: boolean;
  minRating?: number;
  search?: string;
  sortBy?: 'popular' | 'recent' | 'rating' | 'price';
  sortOrder?: 'asc' | 'desc';
}

export const TEMPLATE_CATEGORIES = [
  { id: 'graduation', name: '졸업', nameEn: 'Graduation', icon: '🎓' },
  { id: 'wedding', name: '결혼', nameEn: 'Wedding', icon: '💒' },
  { id: 'birthday', name: '생일', nameEn: 'Birthday', icon: '🎂' },
  { id: 'travel', name: '여행', nameEn: 'Travel', icon: '✈️' },
  { id: 'business', name: '비즈니스', nameEn: 'Business', icon: '💼' },
  { id: 'memorial', name: '추모', nameEn: 'Memorial', icon: '🕯️' },
  { id: 'celebration', name: '축하', nameEn: 'Celebration', icon: '🎉' },
  { id: 'kids', name: '어린이', nameEn: 'Kids', icon: '👶' },
  { id: 'sports', name: '스포츠', nameEn: 'Sports', icon: '⚽' },
  { id: 'holiday', name: '명절', nameEn: 'Holiday', icon: '🎊' },
] as const;
